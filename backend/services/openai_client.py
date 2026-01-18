"""
OpenAI o1 client for the AI agent with reasoning capabilities.
"""
import os
from typing import Any, AsyncIterator, Optional
from openai import AsyncOpenAI


class OpenAIClient:
    """Async OpenAI client wrapper for o1 reasoning model."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is required")

        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "o1"  # Reasoning model with built-in thinking

    async def chat_completion(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        tool_choice: Optional[dict[str, Any] | str] = None,
        reasoning_effort: str = "medium",
    ) -> dict[str, Any]:
        """
        Send a chat completion request to o1.

        Args:
            messages: List of messages in OpenAI format
            tools: Optional list of tool definitions
            tool_choice: Optional tool choice specification
            reasoning_effort: How much reasoning to use (low, medium, high)

        Returns:
            The completion response
        """
        # o1 models use developer message instead of system
        processed_messages = self._convert_system_to_developer(messages)
        
        kwargs = {
            "model": self.model,
            "messages": processed_messages,
            "reasoning_effort": reasoning_effort,
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
        reasoning_effort: str = "medium",
    ) -> AsyncIterator[dict[str, Any]]:
        """
        Stream a chat completion request.

        Args:
            messages: List of messages in OpenAI format
            tools: Optional list of tool definitions
            reasoning_effort: How much reasoning to use

        Yields:
            Streamed response chunks
        """
        processed_messages = self._convert_system_to_developer(messages)
        
        kwargs = {
            "model": self.model,
            "messages": processed_messages,
            "reasoning_effort": reasoning_effort,
            "stream": True,
        }

        if tools:
            kwargs["tools"] = tools

        response = await self.client.chat.completions.create(**kwargs)

        async for chunk in response:
            yield chunk.model_dump()

    def _convert_system_to_developer(self, messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Convert system messages to developer messages for o1.
        o1 uses 'developer' role instead of 'system'.
        """
        result = []
        for msg in messages:
            if msg.get("role") == "system":
                result.append({"role": "developer", "content": msg["content"]})
            else:
                result.append(msg)
        return result

    async def generate_plan(
        self,
        user_prompt: str,
        current_tree: dict[str, Any],
        system_prompt: str,
        tools: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Generate a plan for the customization request.
        Uses high reasoning effort for better planning.

        Args:
            user_prompt: The user's customization request
            current_tree: Current UI tree state
            system_prompt: System prompt with catalog info
            tools: Available tools

        Returns:
            The plan (tool call result)
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"""User request: {user_prompt}

Current UI tree structure:
{self._summarize_tree(current_tree)}

Think carefully about design principles and create a cohesive plan.
First step should always be to establish a color palette.
Use the create_plan tool to outline specific steps."""
            },
        ]

        response = await self.chat_completion(
            messages=messages,
            tools=tools,
            tool_choice={"type": "function", "function": {"name": "create_plan"}},
            reasoning_effort="high",  # Use high reasoning for planning
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
            reasoning_effort="medium",
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
