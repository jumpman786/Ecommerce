"""
OpenAI GPT-4o client for the AI agent.
"""
import os
from typing import Any, AsyncIterator, Optional
from openai import AsyncOpenAI


class OpenAIClient:
    """Async OpenAI client wrapper for GPT-4o."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is required")

        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "gpt-4o"

    async def chat_completion(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        tool_choice: Optional[dict[str, Any] | str] = None,
        temperature: float = 0.7,
    ) -> dict[str, Any]:
        """
        Send a chat completion request to GPT-4o.

        Args:
            messages: List of messages in OpenAI format
            tools: Optional list of tool definitions
            tool_choice: Optional tool choice specification
            temperature: Sampling temperature

        Returns:
            The completion response
        """
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }

        if tools:
            kwargs["tools"] = tools
        if tool_choice:
            kwargs["tool_choice"] = tool_choice

        response = await self.client.chat.completions.create(**kwargs)
        return response.model_dump()

    async def chat_completion_stream(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        temperature: float = 0.7,
    ) -> AsyncIterator[dict[str, Any]]:
        """
        Stream a chat completion request.

        Args:
            messages: List of messages in OpenAI format
            tools: Optional list of tool definitions
            temperature: Sampling temperature

        Yields:
            Streamed response chunks
        """
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": True,
        }

        if tools:
            kwargs["tools"] = tools

        response = await self.client.chat.completions.create(**kwargs)

        async for chunk in response:
            yield chunk.model_dump()

    async def generate_plan(
        self,
        user_prompt: str,
        current_tree: dict[str, Any],
        system_prompt: str,
        tools: list[dict[str, Any]],
        conversation_history: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        Generate a plan for the customization request.

        Args:
            user_prompt: The user's customization request
            current_tree: Current UI tree state
            system_prompt: System prompt with catalog info
            tools: Available tools
            conversation_history: Previous messages for context (optional)

        Returns:
            The plan (tool call result)
        """
        # Build the new user message
        new_user_message = {
            "role": "user",
            "content": f"""User request: {user_prompt}

Current UI tree structure:
{self._summarize_tree(current_tree)}

Think carefully about design principles and create a cohesive plan.
Use the create_plan tool to outline specific steps."""
        }
        
        # Use conversation history if provided, otherwise start fresh
        if conversation_history and len(conversation_history) > 0:
            # Include history for context (user said "move it to left" - what is "it"?)
            messages = [
                {"role": "system", "content": system_prompt},
                *conversation_history,  # Previous context
                new_user_message,
            ]
            print(f"📝 Planning with {len(conversation_history)} messages of history")
        else:
            messages = [
                {"role": "system", "content": system_prompt},
                new_user_message,
            ]

        response = await self.chat_completion(
            messages=messages,
            tools=tools,
            tool_choice={"type": "function", "function": {"name": "create_plan"}},
            temperature=0.7,
        )

        return response

    async def execute_step(
        self,
        step_description: str,
        current_tree: dict[str, Any],
        system_prompt: str,
        tools: list[dict[str, Any]],
        context: Optional[str] = None,
        palette: Optional[dict[str, str]] = None,
    ) -> dict[str, Any]:
        """
        Execute a single step in the plan.

        Args:
            step_description: Description of the step to execute
            current_tree: Current UI tree state
            system_prompt: System prompt with catalog info
            tools: Available tools
            context: Additional context from previous steps
            palette: Color palette to use for consistency

        Returns:
            The completion response with tool calls
        """
        user_message = f"""Execute this specific task: {step_description}

Current UI tree:
{self._format_tree_for_prompt(current_tree)}"""

        if palette:
            user_message += f"\n\nUse this color palette for consistency:\n{palette}"

        if context:
            user_message += f"\n\nContext from previous steps:\n{context}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]

        response = await self.chat_completion(
            messages=messages,
            tools=tools,
            temperature=0.7,
        )

        return response

    async def analyze_screenshot(
        self,
        base64_image: str,
        original_prompt: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Analyze a screenshot using GPT-4o vision to verify UI changes.

        Args:
            base64_image: Base64 encoded PNG screenshot
            original_prompt: The original user customization request
            messages: Conversation history for context
            tools: Available tools for making fixes

        Returns:
            The completion response with potential fix actions
        """
        # Build vision analysis prompt
        analysis_prompt = f"""Analyze this screenshot to verify the UI changes match the user's request.

Original request: {original_prompt}

Look for these issues:
1. Colors that don't match the intended theme or palette
2. Text that's hard to read (poor contrast)
3. Layout/alignment problems
4. Missing elements that should have been added
5. Elements that look broken or unstyled
6. Images that failed to load or look wrong

If everything looks good, respond with just: "UI looks correct, no issues found."

If you find issues, call the appropriate tools to fix them:
- Use modify_component to fix colors, text, or styling
- Use move_component to fix positioning issues

Be specific about what needs to be fixed."""

        # Create vision message with image
        vision_message = {
            "role": "user",
            "content": [
                {"type": "text", "text": analysis_prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{base64_image}",
                        "detail": "high"
                    }
                }
            ]
        }

        # Build full message list: system + history + vision
        # Filter out any previous vision messages from history
        filtered_messages = [
            m for m in messages
            if not (isinstance(m.get("content"), list) and 
                   any(c.get("type") == "image_url" for c in m.get("content", [])))
        ]

        all_messages = filtered_messages + [vision_message]

        response = await self.chat_completion(
            messages=all_messages,
            tools=tools,
            temperature=0.3,  # Lower temperature for more precise analysis
        )

        return response

    def _summarize_tree(self, tree: dict[str, Any]) -> str:
        """Create a summary of the tree for the planning prompt."""
        elements = tree.get("elements", {})
        root = tree.get("root", "")

        summary_lines = [f"Root: {root}", f"Total elements: {len(elements)}", ""]

        # List all component keys with their types
        summary_lines.append("Components:")
        for key, el in elements.items():
            el_type = el.get("type", "Unknown")
            props = el.get("props", {})
            # Get a few key props without base64 data
            safe_props = {}
            for k, v in list(props.items())[:5]:
                if isinstance(v, str) and v.startswith("data:image"):
                    safe_props[k] = "[IMAGE]"
                elif isinstance(v, str) and len(v) > 50:
                    safe_props[k] = v[:50] + "..."
                else:
                    safe_props[k] = v
            summary_lines.append(f"  - {key} ({el_type}): {safe_props}")

        return "\n".join(summary_lines)

    def _format_tree_for_prompt(self, tree: dict[str, Any]) -> str:
        """Format the tree as JSON for the execution prompt."""
        import json
        import copy
        
        # Deep copy to avoid modifying original
        clean_tree = copy.deepcopy(tree)
        elements = clean_tree.get("elements", {})

        # Sanitize base64 images to avoid token explosion
        for key, el in elements.items():
            props = el.get("props", {})
            for prop_key, prop_val in list(props.items()):
                if isinstance(prop_val, str) and prop_val.startswith("data:image"):
                    # Replace base64 with placeholder
                    props[prop_key] = "[GENERATED_IMAGE]"

        # If tree is too large, summarize
        if len(elements) > 50:
            return self._summarize_tree(clean_tree) + "\n\n[Tree truncated - use component keys to reference elements]"

        return json.dumps(clean_tree, indent=2)


# Singleton instance
_openai_client: Optional[OpenAIClient] = None


def get_openai_client() -> OpenAIClient:
    """Get or create the OpenAI client singleton."""
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAIClient()
    return _openai_client
