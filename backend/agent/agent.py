"""
Main AI agent implementation.
Orchestrates the customization workflow using GPT-4o.
"""
import json
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
    4. Validate and complete
    """

    def __init__(
        self,
        tree: UITree,
        theme: Optional[dict[str, Any]] = None,
    ):
        self.tree = tree
        self.theme = theme or {}
        self.todo_manager = TodoManager()
        self.openai = get_openai_client()
        self.gemini = get_gemini_service()
        self.patches: list[PatchOperation] = []

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
        context = ""
        for todo in self.todo_manager.todos:
            # Mark in progress
            self.todo_manager.mark_in_progress(todo.id)
            yield CustomizeEvent(
                type="todo_update",
                todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
            )

            yield CustomizeEvent(type="status", message=f"Executing: {todo.task}")

            try:
                # Execute the step
                result = await self._execute_step(todo.task, system_prompt, context)

                # Process tool calls
                async for event in self._process_tool_calls(result):
                    yield event

                # Mark completed
                self.todo_manager.mark_completed(todo.id, result)
                context += f"\nCompleted: {todo.task}"

            except Exception as e:
                self.todo_manager.mark_failed(todo.id, str(e))
                yield CustomizeEvent(type="error", message=f"Step failed: {str(e)}")

            yield CustomizeEvent(
                type="todo_update",
                todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
            )

        # Phase 3: Complete
        summary = self.todo_manager.get_summary()
        yield CustomizeEvent(
            type="complete",
            message=f"Completed {summary['completed']}/{summary['total']} tasks",
            todos=[TodoItem(**t) for t in self.todo_manager.to_dict_list()],
        )

    async def _generate_plan(self, prompt: str, system_prompt: str) -> dict[str, Any]:
        """Generate a plan using GPT-4o."""
        response = await self.openai.generate_plan(
            user_prompt=prompt,
            current_tree=self.tree.model_dump(),
            system_prompt=system_prompt,
            tools=AGENT_TOOLS,
        )

        # Extract plan from tool call
        message = response.get("choices", [{}])[0].get("message", {})
        tool_calls = message.get("tool_calls", [])

        if tool_calls:
            for call in tool_calls:
                if call.get("function", {}).get("name") == "create_plan":
                    args = json.loads(call["function"]["arguments"])
                    steps = args.get("steps", [])
                    self.todo_manager.create_from_plan(steps)
                    return args

        raise ValueError("No plan generated")

    async def _execute_step(
        self,
        step: str,
        system_prompt: str,
        context: str,
    ) -> dict[str, Any]:
        """Execute a single step using GPT-4o."""
        response = await self.openai.execute_step(
            step_description=step,
            current_tree=self.tree.model_dump(),
            system_prompt=system_prompt,
            tools=AGENT_TOOLS,
            context=context if context else None,
        )

        return response

    async def _process_tool_calls(
        self,
        response: dict[str, Any],
    ) -> AsyncIterator[CustomizeEvent]:
        """Process tool calls from GPT-4o response."""
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

            try:
                params = json.loads(arguments)
            except json.JSONDecodeError:
                yield CustomizeEvent(
                    type="error",
                    message=f"Invalid arguments for {function_name}",
                )
                continue

            # Skip create_plan (already handled)
            if function_name == "create_plan":
                continue

            # Skip capture_screenshot and validate_changes for now
            if function_name in ("capture_screenshot", "validate_changes"):
                continue

            try:
                # Execute the action
                result = await execute_action(function_name, params, ctx)

                # Yield patches
                for patch in ctx.patches:
                    yield CustomizeEvent(type="patch", patch=patch)
                ctx.patches.clear()

                # Yield theme update if changed
                if function_name == "apply_theme":
                    yield CustomizeEvent(type="theme_update", theme=self.theme)

            except Exception as e:
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
