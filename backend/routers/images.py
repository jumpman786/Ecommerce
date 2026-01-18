"""
Image generation API endpoints.
"""
from fastapi import APIRouter, HTTPException

from models.requests import GenerateImageRequest, GenerateImageResponse
from services.gemini import get_gemini_service

router = APIRouter(prefix="/api", tags=["images"])


@router.post("/generate-image", response_model=GenerateImageResponse)
async def generate_image(request: GenerateImageRequest):
    """
    Generate an image using Google Gemini Imagen.

    Supports different styles:
    - product: Clean product photography style
    - banner: Wide promotional banner
    - icon: Minimal flat icon
    - background: Abstract background pattern

    Returns:
    - imageUrl: Base64 data URL or hosted URL
    """
    try:
        gemini = get_gemini_service()

        image_url = await gemini.generate_image(
            prompt=request.prompt,
            style=request.style,
            width=request.width,
            height=request.height,
        )

        return GenerateImageResponse(
            imageUrl=image_url,
            success=True,
        )

    except Exception as e:
        return GenerateImageResponse(
            imageUrl="",
            success=False,
            error=str(e),
        )


@router.post("/generate-theme-banner")
async def generate_theme_banner(theme_name: str, custom_prompt: str = None):
    """
    Generate a banner image for a specific theme.

    Pre-configured prompts for each theme:
    - christmas: Holiday themed with red/green
    - valentines: Hearts and pink/red
    - halloween: Spooky orange/purple
    - summer: Beach and tropical
    - blackFriday: Dark dramatic with gold
    - sale: Red and white urgent sale
    """
    try:
        gemini = get_gemini_service()

        image_url = await gemini.generate_theme_banner(
            theme_name=theme_name,
            custom_prompt=custom_prompt,
        )

        return {
            "success": True,
            "theme": theme_name,
            "imageUrl": image_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
