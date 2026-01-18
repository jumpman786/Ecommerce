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
                    # Use trimmed messages to avoid token limit
                    trimmed = self._trim_messages(max_messages=10)
                    analysis_result = await self.openai.analyze_screenshot(
                        base64_image=self.screenshot_data,
                        original_prompt=self.user_prompt,
                        messages=[{"role": "system", "content": get_system_prompt(catalog_prompt)}] + trimmed,
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
        
        # Pass trimmed history (from previous requests in this session) for context
        # This allows "move it to left" to understand what "it" refers to
        existing_history = self._trim_messages(max_messages=10) if self.messages else None
        
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
        # Summarize tree (just keys and types, not full props)
        tree_summary = self._summarize_tree_for_step()
        
        # Add user message to history (keep it short)
        self.messages.append({
            "role": "user",
            "content": f"Execute: {step}\n\nTree keys: {tree_summary}"
        })
        
        # Trim history if too long (keep last 20 messages)
        trimmed_messages = self._trim_messages(max_messages=20)
        
        # Call with trimmed conversation history
        response = await self.openai.chat_completion(
            messages=[{"role": "system", "content": system_prompt}] + trimmed_messages,
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

    def _summarize_tree_for_step(self) -> str:
        """Create a compact tree summary for step execution."""
        elements = self.tree.elements
        # Just list keys grouped by type
        by_type: dict[str, list[str]] = {}
        for key, el in elements.items():
            t = el.type
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(key)
        
        lines = []
        for t, keys in by_type.items():
            lines.append(f"{t}: {', '.join(keys[:10])}" + (f"... +{len(keys)-10}" if len(keys) > 10 else ""))
        return "\n".join(lines)

    def _trim_messages(self, max_messages: int = 20) -> list[dict[str, Any]]:
        """Trim conversation history to avoid token limits.
        
        IMPORTANT: Must keep tool call sequences together - an assistant message
        with tool_calls MUST be followed by all its tool responses.
        """
        if len(self.messages) <= max_messages:
            return self.messages
        
        # Find safe trim point - don't cut inside a tool call sequence
        # Start from the end and find where we can safely cut
        messages_to_keep = []
        pending_tool_ids: set[str] = set()
        
        for msg in reversed(self.messages):
            # Add message
            messages_to_keep.insert(0, msg)
            
            # Track tool responses we've seen
            if msg.get("role") == "tool":
                pending_tool_ids.add(msg.get("tool_call_id", ""))
            
            # When we see an assistant with tool_calls, remove those IDs from pending
            if msg.get("role") == "assistant" and msg.get("tool_calls"):
                for tc in msg["tool_calls"]:
                    pending_tool_ids.discard(tc.get("id", ""))
            
            # Once we have enough messages AND no pending tool calls, we can stop
            if len(messages_to_keep) >= max_messages and not pending_tool_ids:
                break
        
        # If we still have messages but no clean break, just return recent ones
        if len(messages_to_keep) > max_messages * 2:
            # Too many - just keep the last max_messages, removing any orphaned tool messages
            messages_to_keep = messages_to_keep[-max_messages:]
            # Filter out tool messages without a preceding assistant message
            clean_messages = []
            for msg in messages_to_keep:
                if msg.get("role") == "tool":
                    # Only keep if we have a matching assistant message
                    continue  # Skip orphaned tool messages
                clean_messages.append(msg)
            messages_to_keep = clean_messages
        
        return messages_to_keep

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
            edit_image_fn=self._edit_image,
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
                print(f"🔧 Executing action: {function_name} with params: {str(params)[:200]}")
                result = await execute_action(function_name, params, ctx)
                print(f"✅ Action {function_name} completed: {str(result)[:100]}")
                
                # Add tool result to conversation history (truncate large values)
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": self._truncate_result(result),
                })

                # Yield patches
                for patch in ctx.patches:
                    yield CustomizeEvent(type="patch", patch=patch)
                ctx.patches.clear()

                # Yield theme update if changed
                if function_name == "apply_theme":
                    yield CustomizeEvent(type="theme_update", theme=self.theme)

            except Exception as e:
                error_msg = str(e)
                print(f"❌ Action {function_name} failed: {error_msg}")
                # Add error to history - MUST respond to every tool_call_id
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps({"error": error_msg}),
                })
                yield CustomizeEvent(
                    type="error",
                    message=f"Action {function_name} failed: {error_msg}",
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

    async def _edit_image(
        self,
        image_source: str,
        prompt: str,
    ) -> str:
        """Edit an existing image using OpenAI DALL-E."""
        return await self.openai.edit_image(image_source, prompt)

    def _truncate_result(self, result: dict[str, Any], max_len: int = 500) -> str:
        """Truncate tool result to avoid token explosion from base64 images."""
        # Deep copy to avoid modifying original
        import copy
        truncated = copy.deepcopy(result)
        
        # Truncate known large fields
        for key in ["imageUrl", "editedImageUrl", "updatedProps"]:
            if key in truncated:
                val = truncated[key]
                if isinstance(val, str) and len(val) > 100:
                    if val.startswith("data:image"):
                        truncated[key] = "[BASE64_IMAGE_GENERATED]"
                    else:
                        truncated[key] = val[:100] + "..."
                elif isinstance(val, dict):
                    # Truncate props that contain images
                    for pk, pv in list(val.items()):
                        if isinstance(pv, str) and pv.startswith("data:image"):
                            val[pk] = "[BASE64_IMAGE]"
        
        json_str = json.dumps(truncated)
        if len(json_str) > max_len:
            return json_str[:max_len] + "...[truncated]"
        return json_str
