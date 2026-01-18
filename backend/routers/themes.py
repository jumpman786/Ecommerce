"""
Theme generation API endpoints.
"""
import json
from fastapi import APIRouter, HTTPException

from models.requests import GenerateThemeRequest, ThemeResponse
from catalog.themes import THEME_PRESETS, get_theme, create_custom_theme
from services.openai_client import get_openai_client

router = APIRouter(prefix="/api", tags=["themes"])


@router.get("/themes")
async def list_themes():
    """Get list of available theme presets."""
    return {
        "themes": list(THEME_PRESETS.keys()),
        "presets": {
            name: {
                "name": theme["name"],
                "colors": theme["colors"],
                "hasComponents": theme.get("components") is not None,
            }
            for name, theme in THEME_PRESETS.items()
        },
    }


@router.get("/themes/{theme_name}")
async def get_theme_preset(theme_name: str):
    """Get a specific theme preset."""
    theme = get_theme(theme_name)
    if not theme:
        raise HTTPException(status_code=404, detail=f"Theme not found: {theme_name}")
    return theme


@router.post("/generate-theme")
async def generate_theme(request: GenerateThemeRequest):
    """
    Generate a custom theme using AI.

    Takes a natural language description and generates
    a complete theme with colors and component styles.
    """
    try:
        openai = get_openai_client()

        # Build prompt for theme generation
        system_prompt = """You are a UI theme designer. Generate a color theme for an e-commerce app.

Return a JSON object with this structure:
{
  "name": "theme_name",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "surface": "#hexcode",
    "text": "#hexcode",
    "textSecondary": "#hexcode",
    "textInverse": "#hexcode",
    "border": "#hexcode",
    "success": "#hexcode",
    "warning": "#hexcode",
    "error": "#hexcode"
  },
  "components": {
    "banner": {
      "title": "Banner title text",
      "subtitle": "Banner subtitle",
      "ctaText": "Button text",
      "overlay": "rgba color for overlay"
    },
    "announcement": {
      "text": "Announcement text",
      "backgroundColor": "#hexcode",
      "textColor": "#hexcode"
    }
  }
}

Generate colors that:
- Work well together (complementary/analogous)
- Have good contrast for accessibility
- Match the mood described by the user
- Are appropriate for e-commerce"""

        user_prompt = f"""Generate a theme based on this description: {request.prompt}

{"Base it on the " + request.baseTheme + " theme but modify according to the description." if request.baseTheme else ""}

Return only valid JSON, no explanation."""

        response = await openai.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
        )

        # Extract content
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Parse JSON from response
        # Handle potential markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        theme_data = json.loads(content.strip())

        # If base theme specified, merge with it
        if request.baseTheme:
            base = get_theme(request.baseTheme)
            if base:
                theme_data = create_custom_theme(
                    name=theme_data.get("name", "custom"),
                    colors=theme_data.get("colors", {}),
                    components=theme_data.get("components"),
                    base_theme=request.baseTheme,
                )

        return theme_data

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse theme: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate theme: {str(e)}")
