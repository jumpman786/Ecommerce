"""
Google Gemini Nano Banana image generation service.
Simple passthrough - agent controls the prompts.
"""
import os
import base64
from typing import Optional

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("⚠️ google-genai not installed. Run: pip install google-genai")


class GeminiImageService:
    """Simple Gemini image generation - no hardcoded prompts."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.client = None
        
        if not GENAI_AVAILABLE:
            print("⚠️ google-genai not available")
        elif not self.api_key:
            print("⚠️ GOOGLE_API_KEY not set")
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
                print("✅ Gemini Nano Banana ready")
            except Exception as e:
                print(f"⚠️ Gemini init failed: {e}")

    async def generate_image(
        self,
        prompt: str,
        style: str = "banner",
        width: int = 1200,
        height: int = 400,
    ) -> str:
        """
        Generate image from prompt. Agent controls the prompt content.
        
        Returns base64 data URL or placeholder.
        """
        if not self.client:
            return self._placeholder(width, height)
        
        aspect = self._aspect_ratio(width, height)

        try:
            print(f"🎨 Generating: {prompt[:80]}...")
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(aspect_ratio=aspect),
            )
            )

            for part in response.parts:
                if part.inline_data is not None:
                    data = part.inline_data.data
                    mime = part.inline_data.mime_type or "image/png"
                    b64 = data if isinstance(data, str) else base64.b64encode(data).decode("utf-8")
                    print(f"✅ Generated ({len(b64)} bytes)")
                    return f"data:{mime};base64,{b64}"

            print("⚠️ No image in response")
            return self._placeholder(width, height)

        except Exception as e:
            print(f"❌ Generation failed: {e}")
            return self._placeholder(width, height)

    def _placeholder(self, w: int, h: int) -> str:
        """Simple colored placeholder when generation fails."""
        return f"https://via.placeholder.com/{w}x{h}/cccccc/666666?text=IMAGE"

    def _aspect_ratio(self, w: int, h: int) -> str:
        """Convert dimensions to Gemini aspect ratio."""
        r = w / h
        if r > 2.0: return "21:9"
        if r > 1.5: return "16:9"
        if r > 1.2: return "4:3"
        if r < 0.5: return "9:16"
        if r < 0.7: return "3:4"
        if r < 0.9: return "4:5"
        return "1:1"


_service: Optional[GeminiImageService] = None

def get_gemini_service() -> GeminiImageService:
    global _service
    if _service is None:
        _service = GeminiImageService()
    return _service
