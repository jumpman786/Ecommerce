"""
UI Tree models - Core data structures for the component tree.
Mirrors the json-render TypeScript types.
"""
from typing import Any, Optional
from pydantic import BaseModel, Field


class ConfirmDialog(BaseModel):
    """Confirmation dialog for dangerous actions."""
    title: str
    message: str
    variant: str = "default"  # "default" | "danger"
    confirmLabel: Optional[str] = None
    cancelLabel: Optional[str] = None


class ActionCallback(BaseModel):
    """Callback after action execution."""
    navigate: Optional[str] = None  # Screen to navigate to
    set: Optional[dict[str, Any]] = None  # Data to set (path -> value)
    action: Optional["ActionTrigger"] = None  # Another action to execute


class ActionTrigger(BaseModel):
    """Action that can be attached to interactive components."""
    name: str  # Action name from catalog
    params: dict[str, Any] = Field(default_factory=dict)
    confirm: Optional[ConfirmDialog] = None
    onSuccess: Optional[ActionCallback] = None
    onError: Optional[ActionCallback] = None


class TrackEventProp(BaseModel):
    """Analytics tracking configuration for components."""
    eventName: str
    properties: dict[str, Any] = Field(default_factory=dict)
    trackOnMount: bool = False  # Track when component appears
    trackOnPress: bool = True   # Track when pressed


class UIElement(BaseModel):
    """
    A single UI element in the tree.
    Can be atomic (no children) or composite (has children).
    """
    key: str  # Unique identifier
    type: str  # Component type (Button, Text, View, etc.)
    props: dict[str, Any] = Field(default_factory=dict)
    children: list[str] = Field(default_factory=list)  # Keys of child elements
    parentKey: Optional[str] = None  # Key of parent element

    # Optional action and analytics
    action: Optional[ActionTrigger] = None
    trackEvent: Optional[TrackEventProp] = None

    # Visibility condition (can be bool or complex condition)
    visible: Any = True


class UITree(BaseModel):
    """
    The complete UI tree structure.
    Uses a flat map with parent-child relationships via keys.
    """
    root: str  # Key of root element
    elements: dict[str, UIElement]  # Flat map of all elements by key

    def get_element(self, key: str) -> Optional[UIElement]:
        """Get element by key."""
        return self.elements.get(key)

    def get_children(self, key: str) -> list[UIElement]:
        """Get all children of an element."""
        element = self.elements.get(key)
        if not element:
            return []
        return [self.elements[k] for k in element.children if k in self.elements]

    def get_parent(self, key: str) -> Optional[UIElement]:
        """Get parent of an element."""
        element = self.elements.get(key)
        if not element or not element.parentKey:
            return None
        return self.elements.get(element.parentKey)

    def find_by_type(self, component_type: str) -> list[UIElement]:
        """Find all elements of a specific type."""
        return [el for el in self.elements.values() if el.type == component_type]

    def find_by_prop(self, prop_name: str, prop_value: Any) -> list[UIElement]:
        """Find elements with a specific prop value."""
        return [
            el for el in self.elements.values()
            if el.props.get(prop_name) == prop_value
        ]


# Update forward references
ActionCallback.model_rebuild()
