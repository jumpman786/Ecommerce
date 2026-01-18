"""
Action definitions for the AI agent.
These are the tools the agent can use to modify the UI.
"""
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


# =============================================================================
# ACTION PARAMETER SCHEMAS
# =============================================================================

class ModifyComponentParams(BaseModel):
    """Parameters for modify_component action."""
    componentKey: str = Field(..., description="Unique key of the component to modify")
    props: dict[str, Any] = Field(..., description="Props to update (merged with existing)")
    replace: bool = Field(False, description="Replace all props instead of merge")


class ApplyThemeParams(BaseModel):
    """Parameters for apply_theme action."""
    themeName: Literal[
        "default", "christmas", "valentines", "halloween",
        "summer", "dark", "blackFriday", "sale", "custom"
    ] = Field(..., description="Preset theme name or 'custom'")
    customTheme: Optional[dict[str, Any]] = Field(None, description="Custom theme when themeName is 'custom'")
    scope: Literal["global", "component"] = Field("global", description="Apply to all or specific components")
    targetComponents: Optional[list[str]] = Field(None, description="Component keys when scope is 'component'")


class GenerateImageParams(BaseModel):
    """Parameters for generate_image action."""
    prompt: str = Field(..., description="Detailed prompt for image generation")
    style: Literal["product", "banner", "icon", "background"] = Field("banner")
    width: int = Field(1200)
    height: int = Field(400)
    targetComponent: str = Field(..., description="Component key to apply image to")
    targetProp: str = Field("imageUrl", description="Prop name to set (default: imageUrl)")


class AddComponentParams(BaseModel):
    """Parameters for add_component action."""
    parentKey: str = Field(..., description="Parent component key")
    componentType: str = Field(..., description="Type of component to add")
    props: dict[str, Any] = Field(default_factory=dict, description="Initial props for the component")
    insertIndex: Optional[int] = Field(None, description="Index to insert at (default: end)")
    key: Optional[str] = Field(None, description="Custom key for the component")


class RemoveComponentParams(BaseModel):
    """Parameters for remove_component action."""
    componentKey: str = Field(..., description="Key of component to remove")
    removeChildren: bool = Field(True, description="Also remove all children")


class ReorderComponentsParams(BaseModel):
    """Parameters for reorder_components action."""
    parentKey: str = Field(..., description="Parent component key")
    childKeys: list[str] = Field(..., description="New order of child keys")


class ResizeComponentParams(BaseModel):
    """Parameters for resize_component action."""
    componentKey: str = Field(..., description="Component key to resize")
    width: Optional[int] = Field(None)
    height: Optional[int] = Field(None)
    flex: Optional[int] = Field(None)


class MoveComponentParams(BaseModel):
    """Parameters for move_component action."""
    componentKey: str = Field(..., description="Component key to move")
    newParentKey: str = Field(..., description="New parent component key")
    insertIndex: Optional[int] = Field(None, description="Index in new parent")


class TrackEventParams(BaseModel):
    """Parameters for track_event action."""
    eventName: str = Field(..., description="PostHog event name")
    properties: dict[str, Any] = Field(default_factory=dict, description="Event properties")


class NavigateParams(BaseModel):
    """Parameters for navigate action (user interaction)."""
    screen: str = Field(..., description="Screen to navigate to")
    params: Optional[dict[str, Any]] = Field(None, description="Navigation params")


class AddToCartParams(BaseModel):
    """Parameters for add_to_cart action (user interaction)."""
    productId: str = Field(..., description="Product ID to add")
    quantity: int = Field(1)


class ToggleWishlistParams(BaseModel):
    """Parameters for toggle_wishlist action (user interaction)."""
    productId: str = Field(..., description="Product ID to toggle")


class CreatePaletteParams(BaseModel):
    """Parameters for create_palette action - define color scheme first."""
    dominant: str = Field(..., description="60% - Main background color (e.g., #ffffff, #1a1a1a)")
    secondary: str = Field(..., description="30% - Headers, nav, cards (e.g., #2d2d2d)")
    accent: str = Field(..., description="10% - CTAs, highlights only (e.g., #ff0000)")
    textPrimary: str = Field(..., description="Main text color (e.g., #000000, #ffffff)")
    textSecondary: str = Field(..., description="Secondary text color (e.g., #666666)")
    success: Optional[str] = Field("#22c55e", description="Success/discount color")
    warning: Optional[str] = Field("#f59e0b", description="Warning color")
    error: Optional[str] = Field("#ef4444", description="Error color")


class ValidateDesignParams(BaseModel):
    """Parameters for validate_design action - self-check design quality."""
    checks: list[Literal["contrast", "harmony", "readability", "hierarchy"]] = Field(
        default=["contrast", "harmony"],
        description="Which design checks to run"
    )
    autoFix: bool = Field(True, description="Automatically fix issues found")


# =============================================================================
# ACTION SCHEMAS FOR OPENAI FUNCTION CALLING
# =============================================================================

ACTION_SCHEMAS: dict[str, dict[str, Any]] = {
    "create_plan": {
        "name": "create_plan",
        "description": "Create a step-by-step plan for implementing the user's customization request",
        "parameters": {
            "type": "object",
            "properties": {
                "steps": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of specific steps to execute",
                },
                "estimatedChanges": {
                    "type": "integer",
                    "description": "Estimated number of component changes",
                },
            },
            "required": ["steps"],
        },
    },

    "modify_component": {
        "name": "modify_component",
        "description": "Modify properties of an existing component in the UI tree",
        "parameters": {
            "type": "object",
            "properties": {
                "componentKey": {
                    "type": "string",
                    "description": "Unique key of the component to modify",
                },
                "props": {
                    "type": "object",
                    "description": "Props to update (will be merged with existing props)",
                },
                "replace": {
                    "type": "boolean",
                    "description": "If true, replace all props instead of merging",
                    "default": False,
                },
            },
            "required": ["componentKey", "props"],
        },
    },

    "apply_theme": {
        "name": "apply_theme",
        "description": "Apply a theme preset or custom theme to the app",
        "parameters": {
            "type": "object",
            "properties": {
                "themeName": {
                    "type": "string",
                    "enum": ["default", "christmas", "valentines", "halloween", "summer", "dark", "blackFriday", "sale", "custom"],
                    "description": "Theme preset name or 'custom' for custom theme",
                },
                "customTheme": {
                    "type": "object",
                    "description": "Custom theme definition (required when themeName is 'custom')",
                },
                "scope": {
                    "type": "string",
                    "enum": ["global", "component"],
                    "description": "Apply to entire app or specific components",
                    "default": "global",
                },
                "targetComponents": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Component keys to apply theme to (when scope is 'component')",
                },
            },
            "required": ["themeName"],
        },
    },

    "generate_image": {
        "name": "generate_image",
        "description": "Generate an image using Gemini AI (Nano Banana). ALWAYS use this instead of external URLs. The image will be automatically applied to the target component.",
        "parameters": {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "Detailed prompt for the image (e.g., 'Christmas themed banner with snow and gifts')",
                },
                "style": {
                    "type": "string",
                    "enum": ["product", "banner", "icon", "background"],
                    "description": "Type of image",
                    "default": "banner",
                },
                "width": {"type": "integer", "default": 1200, "description": "Image width"},
                "height": {"type": "integer", "default": 400, "description": "Image height"},
                "targetComponent": {
                    "type": "string",
                    "description": "Component key to apply image to (e.g., 'main-banner')",
                },
                "targetProp": {
                    "type": "string",
                    "description": "Which prop to set (default: 'imageUrl' for banners, 'source' for images)",
                    "default": "imageUrl",
                },
            },
            "required": ["prompt", "targetComponent"],
        },
    },

    "add_component": {
        "name": "add_component",
        "description": "Add a new component as a child of an existing component",
        "parameters": {
            "type": "object",
            "properties": {
                "parentKey": {
                    "type": "string",
                    "description": "Key of the parent component",
                },
                "componentType": {
                    "type": "string",
                    "description": "Type of component to add (Button, Text, Badge, etc.)",
                },
                "props": {
                    "type": "object",
                    "description": "Initial props for the new component",
                },
                "insertIndex": {
                    "type": "integer",
                    "description": "Index to insert at (default: append to end)",
                },
                "key": {
                    "type": "string",
                    "description": "Custom key for the component (auto-generated if not provided)",
                },
            },
            "required": ["parentKey", "componentType", "props"],
        },
    },

    "remove_component": {
        "name": "remove_component",
        "description": "Remove a component from the UI tree",
        "parameters": {
            "type": "object",
            "properties": {
                "componentKey": {
                    "type": "string",
                    "description": "Key of the component to remove",
                },
                "removeChildren": {
                    "type": "boolean",
                    "description": "Also remove all child components",
                    "default": True,
                },
            },
            "required": ["componentKey"],
        },
    },

    "reorder_components": {
        "name": "reorder_components",
        "description": "Change the order of child components within a parent",
        "parameters": {
            "type": "object",
            "properties": {
                "parentKey": {
                    "type": "string",
                    "description": "Key of the parent component",
                },
                "childKeys": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "New order of child component keys",
                },
            },
            "required": ["parentKey", "childKeys"],
        },
    },

    "resize_component": {
        "name": "resize_component",
        "description": "Resize a component by changing its dimensions",
        "parameters": {
            "type": "object",
            "properties": {
                "componentKey": {
                    "type": "string",
                    "description": "Key of the component to resize",
                },
                "width": {"type": "integer", "description": "New width in pixels"},
                "height": {"type": "integer", "description": "New height in pixels"},
                "flex": {"type": "integer", "description": "Flex value for flexible sizing"},
            },
            "required": ["componentKey"],
        },
    },

    "move_component": {
        "name": "move_component",
        "description": "Move a component to a different parent",
        "parameters": {
            "type": "object",
            "properties": {
                "componentKey": {
                    "type": "string",
                    "description": "Key of the component to move",
                },
                "newParentKey": {
                    "type": "string",
                    "description": "Key of the new parent component",
                },
                "insertIndex": {
                    "type": "integer",
                    "description": "Index in the new parent's children",
                },
            },
            "required": ["componentKey", "newParentKey"],
        },
    },

    "track_event": {
        "name": "track_event",
        "description": "Track an analytics event via PostHog",
        "parameters": {
            "type": "object",
            "properties": {
                "eventName": {
                    "type": "string",
                    "description": "Name of the event to track",
                },
                "properties": {
                    "type": "object",
                    "description": "Event properties/metadata",
                },
            },
            "required": ["eventName"],
        },
    },

    "capture_screenshot": {
        "name": "capture_screenshot",
        "description": "Capture a screenshot of the current UI state for validation",
        "parameters": {
            "type": "object",
            "properties": {
                "componentKey": {
                    "type": "string",
                    "description": "Specific component to capture (optional, default: full screen)",
                },
            },
        },
    },

    "validate_changes": {
        "name": "validate_changes",
        "description": "Validate component changes against schemas",
        "parameters": {
            "type": "object",
            "properties": {
                "checkType": {
                    "type": "string",
                    "enum": ["schema", "visual", "accessibility"],
                    "default": "schema",
                },
                "targetComponents": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Specific components to validate",
                },
            },
        },
    },

    "create_palette": {
        "name": "create_palette",
        "description": "FIRST STEP: Define a cohesive color palette before making any changes. Use the 60-30-10 rule.",
        "parameters": {
            "type": "object",
            "properties": {
                "dominant": {
                    "type": "string",
                    "description": "60% - Main background color (e.g., '#ffffff' for light, '#1a1a1a' for dark)",
                },
                "secondary": {
                    "type": "string",
                    "description": "30% - Headers, navigation, cards (e.g., '#2d2d2d', '#c41e3a')",
                },
                "accent": {
                    "type": "string",
                    "description": "10% - CTA buttons, highlights ONLY (e.g., '#ff0000', '#ffd700')",
                },
                "textPrimary": {
                    "type": "string",
                    "description": "Main text color - must contrast with dominant (e.g., '#000000' on light, '#ffffff' on dark)",
                },
                "textSecondary": {
                    "type": "string",
                    "description": "Secondary/muted text color (e.g., '#666666', '#cccccc')",
                },
                "success": {
                    "type": "string",
                    "description": "Success/discount color (default: '#22c55e')",
                    "default": "#22c55e",
                },
            },
            "required": ["dominant", "secondary", "accent", "textPrimary", "textSecondary"],
        },
    },

    "validate_design": {
        "name": "validate_design",
        "description": "FINAL STEP: Self-check design quality. Verifies contrast ratios, color harmony, and visual hierarchy.",
        "parameters": {
            "type": "object",
            "properties": {
                "checks": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["contrast", "harmony", "readability", "hierarchy"],
                    },
                    "description": "Which design checks to run",
                    "default": ["contrast", "harmony"],
                },
                "autoFix": {
                    "type": "boolean",
                    "description": "Automatically fix issues found",
                    "default": True,
                },
            },
        },
    },
}

# All agent actions as OpenAI tools format
AGENT_ACTIONS = [
    {"type": "function", "function": schema}
    for schema in ACTION_SCHEMAS.values()
]
