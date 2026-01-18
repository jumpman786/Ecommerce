"""
Main AI agent implementation.
Orchestrates the customization workflow using GPT-4o.
"""
import asyncio
import json
import uuid
from typing import Any, AsyncIterator, Optional

from models.ui_tree import UITree
from models.requests import CustomizeEvent, TodoItem, PatchOperation
from catalog.handlers import ActionContext, execute_action
from services.openai_client import get_openai_client
from services.gemini import get_gemini_service
from .tools import AGENT_TOOLS
from .prompts import get_system_prompt, generate_catalog_prompt
from .todo_manager import TodoManager


class EcommerceAgent:
    """
    AI agent that customizes the e-commerce app.

    Workflow:
    1. Receive user prompt + current UI tree
    2. Generate plan (todos) using GPT-4o
    3. Execute each step, streaming patches
    4. Screenshot verification and fixes
    5. Complete
    """

    def __init__(
        self,
        tree: UITree,
        theme: Optional[dict[str, Any]] = None,
        session_id: Optional[str] = None,
    ):
        self.tree = tree
        self.theme = theme or {}
        self.session_id = session_id or str(uuid.uuid4())
        self.todo_manager = TodoManager()
        self.openai = get_openai_client()
        self.gemini = get_gemini_service()
        self.patches: list[PatchOperation] = []
        
        # Conversation history for multi-turn context
        self.messages: list[dict[str, Any]] = []
        
        # Screenshot synchronization
        self.screenshot_event = asyncio.Event()
        self.screenshot_data: Optional[str] = None
        
        # Original user prompt for verification context
        self.user_prompt: str = ""

    async def execute(self, prompt: str) -> AsyncIterator[CustomizeEvent]:
        """
        Execute the customization request.

        Args:
            prompt: User's customization request

        Yields:
            CustomizeEvent objects for streaming to frontend
        """
        # Generate catalog prompt
        catalog_prompt = generate_catalog_prompt()
        system_prompt = get_system_prompt(catalog_prompt)

        # Phase 1: Planning
        yield CustomizeEvent(type="status", message="Planning changes...")

        try:
            plan = await self._generate_plan(prompt, system_prompt)
            yield CustomizeEvent(
                type="plan",
                todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
            )
        except Exception as e:
            yield CustomizeEvent(type="error", message=f"Failed to create plan: {str(e)}")
            return

        # Phase 2: Execute each step
        for todo in self.todo_manager.todos:
            # Mark in progress
            self.todo_manager.mark_in_progress(todo.id)
            yield CustomizeEvent(
                type="todo_update",
                todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
            )

            yield CustomizeEvent(type="status", message=f"Executing: {todo.task}")

            try:
                # Execute the step (uses conversation history)
                result = await self._execute_step(todo.task, system_prompt)

                # Process tool calls and add results to history
                async for event in self._process_tool_calls(result):
                    yield event

                # Mark completed
                self.todo_manager.mark_completed(todo.id, result)

            except Exception as e:
                self.todo_manager.mark_failed(todo.id, str(e))
                yield CustomizeEvent(type="error", message=f"Step failed: {str(e)}")

            yield CustomizeEvent(
                type="todo_update",
                todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
            )

        # Phase 3: Screenshot verification
        # Currently disabled - Metro bundler doesn't support proper screenshot capture
        # Enable when using puppeteer or html2canvas
        ENABLE_SCREENSHOT_VERIFICATION = False
        
        if ENABLE_SCREENSHOT_VERIFICATION:
            MAX_VERIFY_ITERATIONS = 3
            yield CustomizeEvent(type="status", message="Verifying changes...")
            
            for iteration in range(MAX_VERIFY_ITERATIONS):
                # Request screenshot from frontend
                request_id = str(uuid.uuid4())
                yield CustomizeEvent(
                    type="screenshot_request", 
                    request_id=request_id,
                    session_id=self.session_id,
                )
                
                try:
                    # Wait for frontend to send screenshot (short timeout)
                    await asyncio.wait_for(self.screenshot_event.wait(), timeout=10.0)
                    self.screenshot_event.clear()
                except asyncio.TimeoutError:
                    yield CustomizeEvent(type="status", message="Screenshot timeout, skipping verification")
                    break
                
                # Skip verification if screenshot is empty or too small
                if not self.screenshot_data or len(self.screenshot_data) < 100:
                    yield CustomizeEvent(type="status", message="Screenshot unavailable, skipping verification")
                    self.screenshot_data = None
                    break
                
                # Analyze screenshot with vision
                yield CustomizeEvent(type="status", message=f"Analyzing screenshot (iteration {iteration + 1})...")
                
                try:
                    analysis_result = await self.openai.analyze_screenshot(
                        base64_image=self.screenshot_data,
                        original_prompt=self.user_prompt,
                        messages=[{"role": "system", "content": get_system_prompt(catalog_prompt)}] + self.messages,
                        tools=AGENT_TOOLS,
                    )
                    self.screenshot_data = None  # Clear for next iteration
                    
                    # Check if any fixes are needed
                    message = analysis_result.get("choices", [{}])[0].get("message", {})
                    tool_calls = message.get("tool_calls") or []
                    content = message.get("content", "")
                    
                    # Add analysis to conversation history
                    self.messages.append({
                        "role": "user",
                        "content": "[Screenshot analysis request]",
                    })
                    assistant_msg = {
                        "role": "assistant",
                        "content": content,
                    }
                    # Only include tool_calls if non-empty (OpenAI rejects empty arrays)
                    if tool_calls:
                        assistant_msg["tool_calls"] = tool_calls
                    self.messages.append(assistant_msg)
                    
                    if not tool_calls:
                        # No fixes needed
                        yield CustomizeEvent(type="status", message="UI verified successfully!")
                        break
                    
                    # Process fix actions
                    yield CustomizeEvent(type="status", message=f"Applying {len(tool_calls)} fixes...")
                    async for event in self._process_tool_calls(analysis_result):
                        yield event
                        
                except Exception as e:
                    yield CustomizeEvent(type="error", message=f"Screenshot analysis failed: {str(e)}")
                    break
        
        # Phase 4: Complete
        summary = self.todo_manager.get_summary()
        yield CustomizeEvent(
            type="complete",
            message=f"Completed {summary['completed']}/{summary['total']} tasks",
            todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
        )

    async def _generate_plan(self, prompt: str, system_prompt: str) -> dict[str, Any]:
        """Generate a plan using GPT-4o with conversation history for context."""
        # Store original prompt for verification context
        self.user_prompt = prompt
        
        # Pass existing history (from previous requests in this session) for context
        # This allows "move it to left" to understand what "it" refers to
        existing_history = self.messages.copy() if self.messages else None
        
        response = await self.openai.generate_plan(
            user_prompt=prompt,
            current_tree=self.tree.model_dump(),
            system_prompt=system_prompt,
            tools=AGENT_TOOLS,
            conversation_history=existing_history,
        )
        
        # Add this request to history for future context
        self.messages.append({
            "role": "user",
            "content": f"Customize this e-commerce app: {prompt}\n\nUI Tree has {len(self.tree.elements)} elements.",
        })

        # Extract plan from tool call
        message = response.get("choices", [{}])[0].get("message", {})
        tool_calls = message.get("tool_calls", [])

        if tool_calls:
            # Add assistant message to history
            msg = {
                "role": "assistant",
                "content": message.get("content"),
            }
            # Only include tool_calls if non-empty
            if tool_calls:
                msg["tool_calls"] = tool_calls
            self.messages.append(msg)
            
            for call in tool_calls:
                if call.get("function", {}).get("name") == "create_plan":
                    args = json.loads(call["function"]["arguments"])
                    steps = args.get("steps", [])
                    self.todo_manager.create_from_plan(steps)
                    
                    # Add tool result to history
                    self.messages.append({
                        "role": "tool",
                        "tool_call_id": call.get("id", ""),
                        "content": json.dumps({"status": "plan created", "steps": len(steps)}),
                    })
                    return args

        raise ValueError("No plan generated")

    async def _execute_step(
        self,
        step: str,
        system_prompt: str,
    ) -> dict[str, Any]:
        """Execute a single step using GPT-4o with conversation history."""
        # Add user message to history
        self.messages.append({
            "role": "user",
            "content": f"Execute this step: {step}\n\nCurrent UI tree:\n{json.dumps(self.tree.model_dump(), indent=2)[:2000]}..."
        })
        
        # Call with full conversation history
        response = await self.openai.chat_completion(
            messages=[{"role": "system", "content": system_prompt}] + self.messages,
            tools=AGENT_TOOLS,
            temperature=0.7,
        )
        
        # Add assistant response to history
        assistant_msg = response.get("choices", [{}])[0].get("message", {})
        msg = {
            "role": "assistant",
            "content": assistant_msg.get("content"),
        }
        # Only include tool_calls if non-empty (OpenAI rejects empty arrays)
        if assistant_msg.get("tool_calls"):
            msg["tool_calls"] = assistant_msg["tool_calls"]
        self.messages.append(msg)

        return response

    async def _process_tool_calls(
        self,
        response: dict[str, Any],
    ) -> AsyncIterator[CustomizeEvent]:
        """Process tool calls from GPT-4o response and add results to history."""
        message = response.get("choices", [{}])[0].get("message", {})
        tool_calls = message.get("tool_calls") or []  # Handle None case

        # Create action context
        ctx = ActionContext(
            tree=self.tree,
            theme=self.theme,
            on_patch=lambda p: self.patches.append(p),
            on_theme_change=lambda t: self._handle_theme_change(t),
            generate_image_fn=self._generate_image,
        )

        for call in tool_calls:
            function_name = call.get("function", {}).get("name")
            arguments = call.get("function", {}).get("arguments", "{}")
            call_id = call.get("id", "")

            try:
                params = json.loads(arguments)
            except json.JSONDecodeError:
                # Add error to history
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps({"error": f"Invalid JSON arguments for {function_name}"}),
                })
                yield CustomizeEvent(
                    type="error",
                    message=f"Invalid arguments for {function_name}",
                )
                continue

            # Skip create_plan (already handled)
            if function_name == "create_plan":
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps({"status": "plan already processed"}),
                })
                continue

            # Skip capture_screenshot and validate_changes (handled separately in verification)
            if function_name in ("capture_screenshot", "validate_changes"):
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps({"status": "will be executed in verification phase"}),
                })
                continue

            try:
                # Execute the action
                result = await execute_action(function_name, params, ctx)
                
                # Add tool result to conversation history
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps(result),
                })

                # Yield patches
                for patch in ctx.patches:
                    yield CustomizeEvent(type="patch", patch=patch)
                ctx.patches.clear()

                # Yield theme update if changed
                if function_name == "apply_theme":
                    yield CustomizeEvent(type="theme_update", theme=self.theme)

            except Exception as e:
                # Add error to history
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps({"error": str(e)}),
                })
                yield CustomizeEvent(
                    type="error",
                    message=f"Action {function_name} failed: {str(e)}",
                )

    def _handle_theme_change(self, theme: dict[str, Any]):
        """Handle theme change."""
        self.theme = theme

    async def _generate_image(
        self,
        prompt: str,
        style: str,
        width: int,
        height: int,
    ) -> str:
        """Generate an image using Gemini."""
        return await self.gemini.generate_image(prompt, style, width, height)
