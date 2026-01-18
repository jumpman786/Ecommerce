"""
OpenAI GPT-4o client for the AI agent.
"""
import os
import base64
import io
from typing import Any, AsyncIterator, Optional
from openai import AsyncOpenAI
from PIL import Image
import httpx


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
            temperature=0.3,  # Low for deterministic plans
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
            temperature=0.2,  # Low for deterministic step execution
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
        # Build vision analysis prompt - be critical like a professional UI/UX designer
        analysis_prompt = f"""You are a senior UI/UX designer reviewing this e-commerce app screenshot.
Be CRITICAL and look for refinements. Your job is to POLISH the design AND ensure it matches the user's intent.

## ORIGINAL USER REQUEST:
"{original_prompt}"

## STEP 1: ALIGNMENT CHECK (Most Important!)
First, verify the UI ACTUALLY delivers what the user asked for:
- If user asked for "Christmas theme" → Is there Christmas imagery, red/green/gold colors, festive elements?
- If user asked to "move button right" → Is the button actually on the right?
- If user asked for "dark mode" → Is the background dark with light text?
- Does the overall result MATCH the user's intent?

If the result does NOT match the user's request, call tools to FIX it immediately.

## STEP 2: DESIGN QUALITY CHECK
Then evaluate these design aspects:

1. **Text Readability**
   - Is ALL text clearly readable? Check contrast against backgrounds
   - Are there any text overlaps or conflicts? (e.g., two headlines fighting for attention)
   - Old default text showing through new themed content?

2. **Visual Harmony**
   - Does the color palette feel cohesive? (60-30-10 rule)
   - Are there any jarring color clashes?
   - Does the theme apply CONSISTENTLY across all sections?

3. **Layout & Spacing**
   - Is spacing consistent?
   - Are elements properly aligned?
   - Any overlapping elements that shouldn't overlap?

4. **Professional Polish**
   - Would this look good in a professional e-commerce store?
   - Any rough edges, misaligned text, or broken layouts?

## STEP 3: CHECK FOR UNWANTED CHANGES
The agent may have made EXTRA changes that the user didn't ask for. Check for:
- Color changes when user only asked to move something
- Font changes when user only asked to change color
- Any modifications that go BEYOND what was requested

If you see unwanted changes, call tools to REVERT them to the original state.

## DECISION MAKING:
1. If user's request is NOT fulfilled → Call tools to fix it
2. If the agent made EXTRA unwanted changes → Call tools to revert them
3. If there are design issues → Call tools to fix them  
4. Only say "UI looks correct, no issues found" if:
   - The user's request is FULLY satisfied
   - AND no extra unwanted changes were made
   - AND the design is polished with no issues

## BE STRICT - Common issues to catch:
- "Aligned right" means the element should be at the RIGHT EDGE of its container, not floating in the middle
- Buttons floating in weird positions are WRONG
- Text that looks cramped or overlapping is WRONG
- If something looks "off" or "weird", it IS wrong - trust your instincts
- Professional e-commerce sites have CLEAN layouts - if it looks amateur, FIX IT

## IMPORTANT: 
You are the LAST line of defense. If you pass something that looks bad, it goes to production.
Be HARSH. Find issues. Make it PERFECT.

For each issue, call modify_component with specific fixes."""

        # Create vision message with image
        # Handle both raw base64 and full data URL formats
        if base64_image.startswith('data:'):
            image_url = base64_image
        else:
            image_url = f"data:image/png;base64,{base64_image}"
        
        vision_message = {
            "role": "user",
            "content": [
                {"type": "text", "text": analysis_prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_url,
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

    async def edit_image(
        self,
        image_source: str,
        prompt: str,
        size: str = "512x512"  # Smaller size for faster loading on web
    ) -> str:
        """
        Edit an image using OpenAI DALL-E.

        Args:
            image_source: Original image - can be base64 data URL or HTTP URL
            prompt: Description of desired changes
            size: Output size (default 1024x1024)

        Returns:
            Edited image as base64 data URL
        """
        print(f"🎨 OpenAI edit_image called: prompt={prompt[:50]}...")
        
        # Get the raw image bytes
        image_bytes = await self._fetch_image_bytes(image_source)
        print(f"🎨 Fetched {len(image_bytes)} bytes from source")
        
        # Prepare as square PNG (DALL-E requirement)
        prepared_image = self._prepare_image_for_edit(image_bytes)
        print(f"🎨 Prepared image: {len(prepared_image)} bytes")
        
        # Create a file-like object with proper name for OpenAI API
        image_file = io.BytesIO(prepared_image)
        image_file.name = "image.png"  # OpenAI requires .png extension
        
        # Call OpenAI image edit API
        response = await self.client.images.edit(
            model="dall-e-2",  # Only dall-e-2 supports edits
            image=image_file,
            prompt=prompt,
            n=1,
            size=size,
            response_format="b64_json"
        )
        
        # Extract base64 from response
        edited_b64 = response.data[0].b64_json
        print(f"🎨 Edit successful, got {len(edited_b64)} chars of base64")
        return f"data:image/png;base64,{edited_b64}"

    async def _fetch_image_bytes(self, image_source: str) -> bytes:
        """Fetch image bytes from URL or decode from base64."""
        if image_source.startswith("data:"):
            # Extract base64 from data URL
            # Format: data:image/png;base64,<data>
            header, b64_data = image_source.split(",", 1)
            return base64.b64decode(b64_data)
        elif image_source.startswith("http://") or image_source.startswith("https://"):
            # Fetch from URL
            async with httpx.AsyncClient() as client:
                response = await client.get(image_source)
                response.raise_for_status()
                return response.content
        else:
            raise ValueError(f"Unsupported image source: {image_source[:50]}...")

    def _prepare_image_for_edit(self, image_bytes: bytes) -> bytes:
        """
        Prepare image for DALL-E edit API.
        - Convert to PNG
        - Make it square (center crop or pad)
        - Ensure under 4MB
        """
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGBA (required for transparency support)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        
        # Make square by center-cropping
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))
        
        # Resize to 512x512 for faster web rendering
        if min_dim != 512:
            img = img.resize((512, 512), Image.LANCZOS)
        
        # Convert to PNG bytes
        output = io.BytesIO()
        img.save(output, format="PNG")
        png_bytes = output.getvalue()
        
        # Check size - if over 4MB, reduce quality
        if len(png_bytes) > 4 * 1024 * 1024:
            # Resize to smaller dimensions
            img = img.resize((512, 512), Image.LANCZOS)
            output = io.BytesIO()
            img.save(output, format="PNG")
            png_bytes = output.getvalue()
        
        return png_bytes

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
