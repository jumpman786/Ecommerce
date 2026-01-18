"""
ATOMIC Component Schemas - Pydantic models for primitive UI components.

Everything is a primitive. Every prop comes directly from the JSON tree.
The agent can modify any style, any text, any property on any element.
"""
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


# =============================================================================
# STYLE TYPES
# =============================================================================

class StyleProps(BaseModel):
    """Common style properties - can be applied to any component."""
    # Layout
    flex: Optional[int] = None
    flexDirection: Optional[Literal["row", "column", "row-reverse", "column-reverse"]] = None
    justifyContent: Optional[str] = None
    alignItems: Optional[str] = None
    alignSelf: Optional[str] = None
    flexWrap: Optional[str] = None
    gap: Optional[int] = None
    
    # Sizing
    width: Optional[Any] = None  # Can be int or string like "100%"
    height: Optional[Any] = None
    minWidth: Optional[int] = None
    minHeight: Optional[int] = None
    maxWidth: Optional[int] = None
    maxHeight: Optional[int] = None
    
    # Spacing
    padding: Optional[int] = None
    paddingHorizontal: Optional[int] = None
    paddingVertical: Optional[int] = None
    paddingTop: Optional[int] = None
    paddingBottom: Optional[int] = None
    paddingLeft: Optional[int] = None
    paddingRight: Optional[int] = None
    margin: Optional[int] = None
    marginHorizontal: Optional[int] = None
    marginVertical: Optional[int] = None
    marginTop: Optional[int] = None
    marginBottom: Optional[int] = None
    marginLeft: Optional[int] = None
    marginRight: Optional[int] = None
    
    # Appearance
    backgroundColor: Optional[str] = None
    borderRadius: Optional[int] = None
    borderWidth: Optional[int] = None
    borderColor: Optional[str] = None
    borderTopWidth: Optional[int] = None
    borderBottomWidth: Optional[int] = None
    borderTopColor: Optional[str] = None
    borderBottomColor: Optional[str] = None
    opacity: Optional[float] = None
    overflow: Optional[Literal["visible", "hidden", "scroll"]] = None
    
    # Positioning
    position: Optional[Literal["relative", "absolute"]] = None
    top: Optional[int] = None
    bottom: Optional[int] = None
    left: Optional[int] = None
    right: Optional[int] = None
    zIndex: Optional[int] = None

    class Config:
        extra = "allow"  # Allow any additional style properties


# =============================================================================
# PRIMITIVE COMPONENTS
# =============================================================================

class ViewProps(BaseModel):
    """View - Container with any style."""
    style: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


class TextProps(BaseModel):
    """Text - Text content with any style."""
    content: Optional[str] = None  # Text content
    style: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


class ImageProps(BaseModel):
    """Image - Image with source and any style."""
    source: str  # URL or local path
    style: Optional[dict[str, Any]] = None
    contentFit: Optional[Literal["cover", "contain", "fill", "none"]] = "cover"
    
    class Config:
        extra = "allow"


class ScrollViewProps(BaseModel):
    """ScrollView - Scrollable container."""
    style: Optional[dict[str, Any]] = None
    contentContainerStyle: Optional[dict[str, Any]] = None
    horizontal: Optional[bool] = False
    showsVerticalScrollIndicator: Optional[bool] = True
    showsHorizontalScrollIndicator: Optional[bool] = True
    
    class Config:
        extra = "allow"


class ButtonProps(BaseModel):
    """Button - Pressable with title, icon, and any style."""
    title: Optional[str] = None
    style: Optional[dict[str, Any]] = None
    textStyle: Optional[dict[str, Any]] = None
    iconName: Optional[str] = None
    iconSize: Optional[int] = None
    iconColor: Optional[str] = None
    iconPosition: Optional[Literal["left", "right"]] = "right"
    disabled: Optional[bool] = False
    action: Optional[dict[str, Any]] = None  # Action trigger
    
    class Config:
        extra = "allow"


class IconProps(BaseModel):
    """Icon - Vector icon with name, size, color."""
    name: str
    size: Optional[int] = 24
    color: Optional[str] = "#000000"
    style: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


class TouchableProps(BaseModel):
    """Touchable - Generic touchable wrapper."""
    style: Optional[dict[str, Any]] = None
    action: Optional[dict[str, Any]] = None
    activeOpacity: Optional[float] = 0.7
    
    class Config:
        extra = "allow"


class ImageBackgroundProps(BaseModel):
    """ImageBackground - View with background image."""
    source: str
    style: Optional[dict[str, Any]] = None
    imageStyle: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


class BadgeProps(BaseModel):
    """Badge - Small label/tag."""
    text: Optional[str] = None
    style: Optional[dict[str, Any]] = None
    textStyle: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


class SpacerProps(BaseModel):
    """Spacer - Empty space."""
    size: Optional[int] = 16
    horizontal: Optional[bool] = False
    style: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


class DividerProps(BaseModel):
    """Divider - Horizontal line."""
    color: Optional[str] = "#e5e5e5"
    thickness: Optional[int] = 1
    style: Optional[dict[str, Any]] = None
    
    class Config:
        extra = "allow"


# =============================================================================
# COMPONENT SCHEMA REGISTRY
# =============================================================================

COMPONENT_SCHEMAS: dict[str, type[BaseModel]] = {
    # Core primitives
    "View": ViewProps,
    "Text": TextProps,
    "Image": ImageProps,
    "ScrollView": ScrollViewProps,
    "Button": ButtonProps,
    "Icon": IconProps,
    "Touchable": TouchableProps,
    "ImageBackground": ImageBackgroundProps,
    
    # Utility primitives
    "Badge": BadgeProps,
    "Spacer": SpacerProps,
    "Divider": DividerProps,
}

# All components can have children in atomic mode
COMPOSITE_COMPONENTS = {
    "View", "ScrollView", "Button", "Touchable", "ImageBackground",
}


def validate_component_props(component_type: str, props: dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate props against component schema.
    In atomic mode, we're permissive - any extra props are allowed.
    """
    schema = COMPONENT_SCHEMAS.get(component_type)
    if not schema:
        # Unknown component types are allowed - they might be custom
        return True, None

    try:
        schema(**props)
        return True, None
    except Exception as e:
        return False, str(e)


def get_component_schema(component_type: str) -> Optional[type[BaseModel]]:
    """Get the schema for a component type."""
    return COMPONENT_SCHEMAS.get(component_type)


def has_children(component_type: str) -> bool:
    """Check if a component type can have children."""
    return component_type in COMPOSITE_COMPONENTS
