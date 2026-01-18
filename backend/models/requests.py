"""
API Request and Response models.
"""
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

from .ui_tree import UITree


class CustomizeRequest(BaseModel):
    """Request to customize the UI via AI agent."""
    prompt: str  # User's customization request
    current_tree: UITree  # Current state of the UI
    theme: Optional[dict[str, Any]] = None  # Current theme


class TodoItem(BaseModel):
    """A single todo item in the agent's plan."""
    id: str
    task: str
    status: Literal["pending", "in_progress", "completed", "failed"] = "pending"
    result: Optional[Any] = None


class PatchOperation(BaseModel):
    """A JSON patch operation to apply to the tree."""
    op: Literal["add", "remove", "replace", "set"]
    path: str  # JSON pointer path
    value: Optional[Any] = None


class CustomizeEvent(BaseModel):
    """
    Server-sent event during customization.
    Streamed to frontend via SSE.
    """
    type: Literal[
        "status",      # Status message
        "plan",        # Initial plan with todos
        "todo_update", # Todo status change
        "patch",       # UI tree patch
        "theme_update",# Theme change
        "validation_warning",  # Validation issue
        "error",       # Error occurred
        "complete",    # Customization complete
    ]
    message: Optional[str] = None
    todos: Optional[list[TodoItem]] = None
    patch: Optional[PatchOperation] = None
    theme: Optional[dict[str, Any]] = None
    issues: Optional[list[str]] = None


class GenerateImageRequest(BaseModel):
    """Request to generate an image via Gemini."""
    prompt: str
    style: Literal["product", "banner", "icon", "background"] = "product"
    width: int = 512
    height: int = 512
    targetComponent: Optional[str] = None  # Component key to apply image to
    targetProp: str = "source"  # Prop name to set (default: source for Image)


class GenerateImageResponse(BaseModel):
    """Response from image generation."""
    imageUrl: str
    success: bool = True
    error: Optional[str] = None


class ThemeColors(BaseModel):
    """Theme color palette."""
    primary: str
    secondary: str
    accent: str
    background: str
    surface: str
    text: str
    textSecondary: str
    textInverse: str
    border: str
    success: str
    warning: str
    error: str


class ThemeBannerConfig(BaseModel):
    """Theme banner component configuration."""
    imageUrl: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    ctaText: Optional[str] = None
    overlay: Optional[str] = None


class ThemeAnnouncementConfig(BaseModel):
    """Theme announcement component configuration."""
    text: str
    backgroundColor: str
    textColor: str


class ThemeComponents(BaseModel):
    """Theme component overrides."""
    banner: Optional[ThemeBannerConfig] = None
    announcement: Optional[ThemeAnnouncementConfig] = None


class ThemeResponse(BaseModel):
    """A complete theme definition."""
    name: str
    colors: ThemeColors
    components: Optional[ThemeComponents] = None


class GenerateThemeRequest(BaseModel):
    """Request to generate a custom theme via AI."""
    prompt: str  # Natural language theme description
    baseTheme: Optional[str] = None  # Theme to base off of


class ScreenshotRequest(BaseModel):
    """Request for screenshot from frontend."""
    componentKey: Optional[str] = None  # Specific component (None = full screen)
    format: Literal["base64", "url"] = "base64"


class ScreenshotResponse(BaseModel):
    """Screenshot data from frontend."""
    data: str  # Base64 or URL
    format: Literal["base64", "url"]
    componentKey: Optional[str] = None
    width: int
    height: int
