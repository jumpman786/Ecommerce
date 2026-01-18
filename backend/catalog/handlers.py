"""
Action handlers - Implementation of all agent actions.
These execute the actual modifications to the UI tree.
"""
import uuid
from typing import Any, Callable, Optional
from datetime import datetime

from models.ui_tree import UITree, UIElement
from models.requests import PatchOperation
from .themes import get_theme, map_theme_to_component_props


class ActionContext:
    """Context passed to action handlers."""

    def __init__(
        self,
        tree: UITree,
        theme: Optional[dict[str, Any]] = None,
        on_patch: Optional[Callable[[PatchOperation], None]] = None,
        on_theme_change: Optional[Callable[[dict[str, Any]], None]] = None,
        generate_image_fn: Optional[Callable[[str, str, int, int], str]] = None,
    ):
        self.tree = tree
        self.theme = theme or {}
        self.on_patch = on_patch or (lambda p: None)
        self.on_theme_change = on_theme_change or (lambda t: None)
        self.generate_image_fn = generate_image_fn
        self.patches: list[PatchOperation] = []

    def emit_patch(self, op: str, path: str, value: Any = None):
        """Emit a patch operation."""
        patch = PatchOperation(op=op, path=path, value=value)
        self.patches.append(patch)
        self.on_patch(patch)


class ActionHandlers:
    """Collection of action handler methods."""

    @staticmethod
    async def modify_component(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Modify properties of an existing component."""
        component_key = params.get("componentKey")
        if not component_key:
            raise ValueError("componentKey is required")
        
        props = params.get("props", {})
        if not props:
            # Nothing to modify
            return {"success": True, "componentKey": component_key, "updatedProps": {}}
        
        replace = params.get("replace", False)

        element = ctx.tree.elements.get(component_key)
        if not element:
            raise ValueError(f"Component not found: {component_key}")

        if replace:
            new_props = props
        else:
            new_props = {**element.props, **props}

        # Update the tree
        ctx.tree.elements[component_key] = UIElement(
            key=element.key,
            type=element.type,
            props=new_props,
            children=element.children,
            parentKey=element.parentKey,
            action=element.action,
            trackEvent=element.trackEvent,
            visible=element.visible,
        )

        # Emit patch
        ctx.emit_patch("replace", f"/elements/{component_key}/props", new_props)

        return {
            "success": True,
            "componentKey": component_key,
            "updatedProps": new_props,
        }

    @staticmethod
    async def apply_theme(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Apply a theme to the app or specific components."""
        theme_name = params["themeName"]
        custom_theme = params.get("customTheme")
        scope = params.get("scope", "global")
        target_components = params.get("targetComponents", [])

        # Get theme
        if theme_name == "custom" and custom_theme:
            theme = custom_theme
        else:
            theme = get_theme(theme_name)
            if not theme:
                raise ValueError(f"Unknown theme: {theme_name}")

        if scope == "global":
            # Apply globally
            ctx.theme = theme
            ctx.on_theme_change(theme)

            # Also update components that depend on theme
            for key, element in ctx.tree.elements.items():
                theme_props = map_theme_to_component_props(element.type, theme)
                if theme_props:
                    await ActionHandlers.modify_component(
                        {"componentKey": key, "props": theme_props},
                        ctx
                    )
        else:
            # Apply to specific components
            for key in target_components:
                element = ctx.tree.elements.get(key)
                if element:
                    theme_props = map_theme_to_component_props(element.type, theme)
                    if theme_props:
                        await ActionHandlers.modify_component(
                            {"componentKey": key, "props": theme_props},
                            ctx
                        )

        return {
            "success": True,
            "themeName": theme.get("name", theme_name),
            "scope": scope,
        }

    @staticmethod
    async def generate_image(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Generate an image and optionally apply to a component."""
        prompt = params["prompt"]
        style = params.get("style", "product")
        width = params.get("width", 512)
        height = params.get("height", 512)
        target_component = params.get("targetComponent")
        target_prop = params.get("targetProp", "source")

        if not ctx.generate_image_fn:
            raise ValueError("Image generation not available")

        # Generate image
        image_url = await ctx.generate_image_fn(prompt, style, width, height)

        # Apply to component if specified
        if target_component and image_url:
            await ActionHandlers.modify_component(
                {"componentKey": target_component, "props": {target_prop: image_url}},
                ctx
            )

        return {
            "success": True,
            "imageUrl": image_url,
            "appliedTo": target_component,
        }

    @staticmethod
    async def add_component(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Add a new component to the tree."""
        parent_key = params["parentKey"]
        component_type = params["componentType"]
        props = params.get("props", {})
        insert_index = params.get("insertIndex")
        custom_key = params.get("key")

        parent = ctx.tree.elements.get(parent_key)
        if not parent:
            raise ValueError(f"Parent component not found: {parent_key}")

        # Generate key
        new_key = custom_key or f"{component_type.lower()}_{uuid.uuid4().hex[:8]}"

        # Create new element
        new_element = UIElement(
            key=new_key,
            type=component_type,
            props=props,
            children=[],
            parentKey=parent_key,
        )

        # Add to tree
        ctx.tree.elements[new_key] = new_element

        # Update parent's children
        parent_children = list(parent.children)
        if insert_index is not None:
            parent_children.insert(insert_index, new_key)
        else:
            parent_children.append(new_key)

        ctx.tree.elements[parent_key] = UIElement(
            key=parent.key,
            type=parent.type,
            props=parent.props,
            children=parent_children,
            parentKey=parent.parentKey,
            action=parent.action,
            trackEvent=parent.trackEvent,
            visible=parent.visible,
        )

        # Emit patches
        ctx.emit_patch("add", f"/elements/{new_key}", new_element.model_dump())
        ctx.emit_patch("replace", f"/elements/{parent_key}/children", parent_children)

        return {
            "success": True,
            "componentKey": new_key,
            "parentKey": parent_key,
        }

    @staticmethod
    async def remove_component(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Remove a component from the tree."""
        component_key = params["componentKey"]
        remove_children = params.get("removeChildren", True)

        element = ctx.tree.elements.get(component_key)
        if not element:
            raise ValueError(f"Component not found: {component_key}")

        keys_to_remove = {component_key}

        # Collect children to remove
        if remove_children and element.children:
            def collect_children(children: list[str]):
                for child_key in children:
                    keys_to_remove.add(child_key)
                    child = ctx.tree.elements.get(child_key)
                    if child and child.children:
                        collect_children(child.children)

            collect_children(element.children)

        # Remove from parent's children
        if element.parentKey:
            parent = ctx.tree.elements.get(element.parentKey)
            if parent:
                new_children = [k for k in parent.children if k != component_key]
                ctx.tree.elements[element.parentKey] = UIElement(
                    key=parent.key,
                    type=parent.type,
                    props=parent.props,
                    children=new_children,
                    parentKey=parent.parentKey,
                    action=parent.action,
                    trackEvent=parent.trackEvent,
                    visible=parent.visible,
                )
                ctx.emit_patch("replace", f"/elements/{element.parentKey}/children", new_children)

        # Remove elements
        for key in keys_to_remove:
            del ctx.tree.elements[key]
            ctx.emit_patch("remove", f"/elements/{key}")

        return {
            "success": True,
            "removed": list(keys_to_remove),
        }

    @staticmethod
    async def reorder_components(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Reorder children within a parent."""
        parent_key = params["parentKey"]
        child_keys = params["childKeys"]

        parent = ctx.tree.elements.get(parent_key)
        if not parent:
            raise ValueError(f"Parent component not found: {parent_key}")

        # Validate all children exist and remove duplicates
        seen = set()
        unique_child_keys = []
        for key in child_keys:
            if key not in ctx.tree.elements:
                raise ValueError(f"Child component not found: {key}")
            if key not in seen:
                seen.add(key)
                unique_child_keys.append(key)
        
        child_keys = unique_child_keys

        # Update parent
        ctx.tree.elements[parent_key] = UIElement(
            key=parent.key,
            type=parent.type,
            props=parent.props,
            children=child_keys,
            parentKey=parent.parentKey,
            action=parent.action,
            trackEvent=parent.trackEvent,
            visible=parent.visible,
        )

        ctx.emit_patch("replace", f"/elements/{parent_key}/children", child_keys)

        return {
            "success": True,
            "parentKey": parent_key,
            "newOrder": child_keys,
        }

    @staticmethod
    async def resize_component(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Resize a component."""
        component_key = params["componentKey"]
        width = params.get("width")
        height = params.get("height")
        flex = params.get("flex")

        resize_props = {}
        if width is not None:
            resize_props["width"] = width
        if height is not None:
            resize_props["height"] = height
        if flex is not None:
            resize_props["flex"] = flex

        if not resize_props:
            raise ValueError("At least one of width, height, or flex must be specified")

        return await ActionHandlers.modify_component(
            {"componentKey": component_key, "props": resize_props},
            ctx
        )

    @staticmethod
    async def move_component(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Move a component to a different parent."""
        component_key = params["componentKey"]
        new_parent_key = params["newParentKey"]
        insert_index = params.get("insertIndex")

        element = ctx.tree.elements.get(component_key)
        if not element:
            raise ValueError(f"Component not found: {component_key}")

        new_parent = ctx.tree.elements.get(new_parent_key)
        if not new_parent:
            raise ValueError(f"New parent not found: {new_parent_key}")

        # Remove from old parent
        old_parent_key = element.parentKey
        if old_parent_key and old_parent_key != new_parent_key:
            # Only remove from old parent if moving to a DIFFERENT parent
            old_parent = ctx.tree.elements.get(old_parent_key)
            if old_parent:
                new_children = [k for k in old_parent.children if k != component_key]
                ctx.tree.elements[old_parent_key] = UIElement(
                    key=old_parent.key,
                    type=old_parent.type,
                    props=old_parent.props,
                    children=new_children,
                    parentKey=old_parent.parentKey,
                    action=old_parent.action,
                    trackEvent=old_parent.trackEvent,
                    visible=old_parent.visible,
                )
                ctx.emit_patch("replace", f"/elements/{old_parent_key}/children", new_children)

        # Get fresh reference to new parent (may have been updated above if same as old)
        new_parent = ctx.tree.elements.get(new_parent_key)
        
        # Add to new parent - remove first if already present to avoid duplicates
        new_parent_children = [k for k in new_parent.children if k != component_key]
        if insert_index is not None:
            new_parent_children.insert(insert_index, component_key)
        else:
            new_parent_children.append(component_key)

        ctx.tree.elements[new_parent_key] = UIElement(
            key=new_parent.key,
            type=new_parent.type,
            props=new_parent.props,
            children=new_parent_children,
            parentKey=new_parent.parentKey,
            action=new_parent.action,
            trackEvent=new_parent.trackEvent,
            visible=new_parent.visible,
        )

        # Update element's parent reference
        ctx.tree.elements[component_key] = UIElement(
            key=element.key,
            type=element.type,
            props=element.props,
            children=element.children,
            parentKey=new_parent_key,
            action=element.action,
            trackEvent=element.trackEvent,
            visible=element.visible,
        )

        ctx.emit_patch("replace", f"/elements/{new_parent_key}/children", new_parent_children)
        ctx.emit_patch("replace", f"/elements/{component_key}/parentKey", new_parent_key)

        return {
            "success": True,
            "componentKey": component_key,
            "newParentKey": new_parent_key,
        }

    @staticmethod
    async def track_event(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """Track an analytics event (logged for now, would send to PostHog)."""
        event_name = params["eventName"]
        properties = params.get("properties", {})

        # In production, this would send to PostHog
        event_data = {
            "event": event_name,
            "properties": {
                **properties,
                "timestamp": datetime.utcnow().isoformat(),
                "source": "ai_agent",
            },
        }

        # For now, just return success
        return {
            "success": True,
            "eventName": event_name,
            "tracked": event_data,
        }

    @staticmethod
    async def create_palette(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """
        Create a color palette following the 60-30-10 rule.
        This should be called FIRST before any modifications.
        Stores the palette in context for use by other actions.
        """
        palette = {
            "dominant": params["dominant"],
            "secondary": params["secondary"],
            "accent": params["accent"],
            "textPrimary": params["textPrimary"],
            "textSecondary": params["textSecondary"],
            "success": params.get("success", "#22c55e"),
            "warning": params.get("warning", "#f59e0b"),
            "error": params.get("error", "#ef4444"),
        }
        
        # Store palette in context for other actions to use
        ctx.theme["palette"] = palette
        
        # Notify frontend about the palette
        ctx.on_theme_change({"palette": palette})
        
        return {
            "success": True,
            "palette": palette,
            "message": "Color palette created. Use these colors consistently across all components.",
        }

    @staticmethod
    async def validate_design(
        params: dict[str, Any],
        ctx: ActionContext
    ) -> dict[str, Any]:
        """
        Validate design quality by checking contrast, harmony, and readability.
        Optionally auto-fixes issues found.
        """
        checks = params.get("checks", ["contrast", "harmony"])
        auto_fix = params.get("autoFix", True)
        issues = []
        fixes_applied = []
        
        # Get the current palette if available
        palette = ctx.theme.get("palette", {})
        
        # Check contrast ratios
        if "contrast" in checks:
            for key, element in ctx.tree.elements.items():
                props = element.props
                bg_color = props.get("backgroundColor", "")
                text_color = props.get("textColor", props.get("color", ""))
                
                # Simple contrast check (white on light = bad)
                if bg_color and text_color:
                    # White text on light backgrounds
                    if text_color.lower() in ("#fff", "#ffffff", "white"):
                        if bg_color.lower() in ("#fff", "#ffffff", "#fdf8f3", "#f5f5f5"):
                            issues.append(f"{key}: White text on light background")
                            if auto_fix and palette.get("textPrimary"):
                                await ActionHandlers.modify_component(
                                    {"componentKey": key, "props": {"textColor": palette["textPrimary"]}},
                                    ctx
                                )
                                fixes_applied.append(f"Fixed {key} text color")
                    
                    # Black text on dark backgrounds
                    elif text_color.lower() in ("#000", "#000000", "black"):
                        if bg_color.lower() in ("#000", "#000000", "#1a1a1a", "#2d2d2d"):
                            issues.append(f"{key}: Black text on dark background")
                            if auto_fix and palette.get("textPrimary"):
                                await ActionHandlers.modify_component(
                                    {"componentKey": key, "props": {"textColor": "#ffffff"}},
                                    ctx
                                )
                                fixes_applied.append(f"Fixed {key} text color")
        
        # Check for overlay conflicts with generated images
        if "harmony" in checks:
            banner = ctx.tree.elements.get("main-banner")
            if banner:
                props = banner.props
                image_url = props.get("imageUrl", "")
                overlay = props.get("overlay", "")
                bg_color = props.get("backgroundColor", "")
                
                # If there's a generated image but also a heavy overlay
                if image_url.startswith("data:image") or image_url.startswith("http"):
                    if overlay and not overlay.startswith("rgba(0,0,0,0.") and overlay != "transparent":
                        issues.append("main-banner: Heavy overlay covering generated image")
                        if auto_fix:
                            await ActionHandlers.modify_component(
                                {"componentKey": "main-banner", "props": {"overlay": "transparent"}},
                                ctx
                            )
                            fixes_applied.append("Set banner overlay to transparent")
                    
                    if bg_color and bg_color != "transparent":
                        issues.append("main-banner: backgroundColor set on banner with image")
                        if auto_fix:
                            await ActionHandlers.modify_component(
                                {"componentKey": "main-banner", "props": {"backgroundColor": None}},
                                ctx
                            )
                            fixes_applied.append("Removed banner backgroundColor")
        
        # Check readability
        if "readability" in checks:
            for key, element in ctx.tree.elements.items():
                if element.type == "Text":
                    props = element.props
                    font_size = props.get("fontSize", 14)
                    if isinstance(font_size, int) and font_size < 12:
                        issues.append(f"{key}: Font size too small ({font_size}px)")
        
        return {
            "success": True,
            "checks": checks,
            "issues": issues,
            "fixesApplied": fixes_applied,
            "passed": len(issues) == 0 or (auto_fix and len(fixes_applied) == len(issues)),
        }


# Map action names to handler methods
ACTION_HANDLER_MAP: dict[str, Callable] = {
    "modify_component": ActionHandlers.modify_component,
    "apply_theme": ActionHandlers.apply_theme,
    "generate_image": ActionHandlers.generate_image,
    "add_component": ActionHandlers.add_component,
    "remove_component": ActionHandlers.remove_component,
    "reorder_components": ActionHandlers.reorder_components,
    "resize_component": ActionHandlers.resize_component,
    "move_component": ActionHandlers.move_component,
    "track_event": ActionHandlers.track_event,
    "create_palette": ActionHandlers.create_palette,
    "validate_design": ActionHandlers.validate_design,
}


async def execute_action(
    action_name: str,
    params: dict[str, Any],
    ctx: ActionContext
) -> dict[str, Any]:
    """Execute an action by name."""
    handler = ACTION_HANDLER_MAP.get(action_name)
    if not handler:
        raise ValueError(f"Unknown action: {action_name}")

    return await handler(params, ctx)
