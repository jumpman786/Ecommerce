"""
Theme presets - Pre-defined themes for the e-commerce app.
Copied and extended from EcommerceAyush/src/theme/presets.js
"""
from typing import Any, Optional


# =============================================================================
# THEME PRESETS
# =============================================================================

THEME_PRESETS: dict[str, dict[str, Any]] = {
    "default": {
        "name": "default",
        "colors": {
            "primary": "#000000",
            "secondary": "#666666",
            "accent": "#0a7ea4",
            "background": "#ffffff",
            "surface": "#f5f5f5",
            "text": "#000000",
            "textSecondary": "#666666",
            "textInverse": "#ffffff",
            "border": "#e0e0e0",
            "success": "#22c55e",
            "warning": "#f59e0b",
            "error": "#ef4444",
        },
        "components": None,
    },

    "christmas": {
        "name": "christmas",
        "colors": {
            "primary": "#c41e3a",
            "secondary": "#165b33",
            "accent": "#f8b229",
            "background": "#fdf8f3",
            "surface": "#fff5f5",
            "text": "#1a1a1a",
            "textSecondary": "#4a4a4a",
            "textInverse": "#ffffff",
            "border": "#e8d5d5",
            "success": "#165b33",
            "warning": "#f8b229",
            "error": "#c41e3a",
        },
        "components": {
            "banner": {
                "imageUrl": "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=1200&h=400&fit=crop",
                "title": "HOLIDAY GIFT GUIDE",
                "subtitle": "Find the perfect presents for everyone on your list",
                "ctaText": "SHOP GIFTS",
                "overlay": "rgba(196, 30, 58, 0.5)",
            },
            "announcement": {
                "text": "FREE GIFT WRAPPING on all orders over $50",
                "backgroundColor": "#c41e3a",
                "textColor": "#ffffff",
            },
        },
    },

    "valentines": {
        "name": "valentines",
        "colors": {
            "primary": "#e91e63",
            "secondary": "#9c27b0",
            "accent": "#ff4081",
            "background": "#fff5f8",
            "surface": "#fce4ec",
            "text": "#2d1f2d",
            "textSecondary": "#5d4e5d",
            "textInverse": "#ffffff",
            "border": "#f8bbd9",
            "success": "#4caf50",
            "warning": "#ff9800",
            "error": "#f44336",
        },
        "components": {
            "banner": {
                "imageUrl": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&h=400&fit=crop",
                "title": "LOVE IS IN THE AIR",
                "subtitle": "Perfect gifts for your special someone",
                "ctaText": "SHOP VALENTINES",
                "overlay": "rgba(233, 30, 99, 0.5)",
            },
            "announcement": {
                "text": "FREE SHIPPING on Valentine's gifts",
                "backgroundColor": "#e91e63",
                "textColor": "#ffffff",
            },
        },
    },

    "halloween": {
        "name": "halloween",
        "colors": {
            "primary": "#ff6f00",
            "secondary": "#7b1fa2",
            "accent": "#ffc107",
            "background": "#1a1a2e",
            "surface": "#2d2d44",
            "text": "#ffffff",
            "textSecondary": "#b0b0b0",
            "textInverse": "#1a1a2e",
            "border": "#3d3d5c",
            "success": "#4caf50",
            "warning": "#ff6f00",
            "error": "#f44336",
        },
        "components": {
            "banner": {
                "imageUrl": "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&h=400&fit=crop",
                "title": "SPOOKY SEASON SALE",
                "subtitle": "Frighteningly good deals await",
                "ctaText": "SHOP HALLOWEEN",
                "overlay": "rgba(123, 31, 162, 0.6)",
            },
            "announcement": {
                "text": "BOO! 31% OFF all Halloween items",
                "backgroundColor": "#ff6f00",
                "textColor": "#1a1a2e",
            },
        },
    },

    "summer": {
        "name": "summer",
        "colors": {
            "primary": "#00bcd4",
            "secondary": "#ff9800",
            "accent": "#ffeb3b",
            "background": "#e0f7fa",
            "surface": "#b2ebf2",
            "text": "#004d40",
            "textSecondary": "#00695c",
            "textInverse": "#ffffff",
            "border": "#80deea",
            "success": "#4caf50",
            "warning": "#ff9800",
            "error": "#f44336",
        },
        "components": {
            "banner": {
                "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop",
                "title": "SUMMER VIBES",
                "subtitle": "Hot styles for the sunny season",
                "ctaText": "SHOP SUMMER",
                "overlay": "rgba(0, 188, 212, 0.4)",
            },
            "announcement": {
                "text": "SUMMER SALE: Up to 50% off",
                "backgroundColor": "#00bcd4",
                "textColor": "#ffffff",
            },
        },
    },

    "dark": {
        "name": "dark",
        "colors": {
            "primary": "#bb86fc",
            "secondary": "#03dac6",
            "accent": "#cf6679",
            "background": "#121212",
            "surface": "#1e1e1e",
            "text": "#ffffff",
            "textSecondary": "#b0b0b0",
            "textInverse": "#121212",
            "border": "#2d2d2d",
            "success": "#03dac6",
            "warning": "#ffb74d",
            "error": "#cf6679",
        },
        "components": None,
    },

    "blackFriday": {
        "name": "blackFriday",
        "colors": {
            "primary": "#000000",
            "secondary": "#ff4500",
            "accent": "#ffd700",
            "background": "#1a1a1a",
            "surface": "#2d2d2d",
            "text": "#ffffff",
            "textSecondary": "#cccccc",
            "textInverse": "#000000",
            "border": "#444444",
            "success": "#00ff00",
            "warning": "#ffd700",
            "error": "#ff0000",
        },
        "components": {
            "banner": {
                "imageUrl": "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop",
                "title": "BLACK FRIDAY DEALS",
                "subtitle": "Up to 70% OFF Everything",
                "ctaText": "SHOP NOW",
                "overlay": "rgba(0, 0, 0, 0.7)",
            },
            "announcement": {
                "text": "BLACK FRIDAY: Extra 20% OFF with code FRIDAY20",
                "backgroundColor": "#ff4500",
                "textColor": "#ffffff",
            },
            "flickerText": {
                "text": "MEGA SALE",
                "flickerColors": ["#ffd700", "#ff4500"],
                "speed": 500,
            },
        },
    },

    "sale": {
        "name": "sale",
        "colors": {
            "primary": "#ff0000",
            "secondary": "#ffffff",
            "accent": "#ffcc00",
            "background": "#ffffff",
            "surface": "#fff5f5",
            "text": "#000000",
            "textSecondary": "#666666",
            "textInverse": "#ffffff",
            "border": "#ffcccc",
            "success": "#22c55e",
            "warning": "#ffcc00",
            "error": "#ff0000",
        },
        "components": {
            "banner": {
                "title": "CLEARANCE SALE",
                "subtitle": "Everything Must Go!",
                "ctaText": "SHOP SALE",
                "overlay": "rgba(255, 0, 0, 0.4)",
            },
            "announcement": {
                "text": "FINAL SALE: Additional 50% OFF all clearance items",
                "backgroundColor": "#ff0000",
                "textColor": "#ffffff",
            },
        },
    },
}


def get_theme(name: str) -> Optional[dict[str, Any]]:
    """Get a theme by name."""
    return THEME_PRESETS.get(name)


def list_themes() -> list[str]:
    """Get list of available theme names."""
    return list(THEME_PRESETS.keys())


def map_theme_to_component_props(component_type: str, theme: dict[str, Any]) -> dict[str, Any]:
    """
    Map theme colors to component-specific props.
    Returns props that should be applied to the component.
    """
    colors = theme.get("colors", {})
    components = theme.get("components", {})

    props = {}

    if component_type == "Button":
        props["color"] = colors.get("primary", "#000000")

    elif component_type == "Header":
        props["backgroundColor"] = colors.get("background", "#ffffff")
        props["textColor"] = colors.get("text", "#000000")

    elif component_type == "MainBanner":
        banner_config = components.get("banner") if components else None
        if banner_config:
            if banner_config.get("imageUrl"):
                props["imageUrl"] = banner_config["imageUrl"]
            if banner_config.get("title"):
                props["title"] = banner_config["title"]
            if banner_config.get("subtitle"):
                props["subtitle"] = banner_config["subtitle"]
            if banner_config.get("ctaText"):
                props["ctaText"] = banner_config["ctaText"]
            if banner_config.get("overlay"):
                props["overlayColor"] = banner_config["overlay"]
        props["titleBackgroundColor"] = colors.get("background", "#ffffff")

    elif component_type == "BottomNavigation":
        props["backgroundColor"] = colors.get("background", "#ffffff")
        props["iconColor"] = colors.get("textSecondary", "#595959")
        props["activeIndicatorColor"] = colors.get("primary", "#000000")

    elif component_type == "Text":
        props["color"] = colors.get("text", "#000000")

    elif component_type == "Badge":
        props["backgroundColor"] = colors.get("primary", "#ff0000")
        props["textColor"] = colors.get("textInverse", "#ffffff")

    elif component_type == "View":
        props["backgroundColor"] = colors.get("background", "#ffffff")

    elif component_type == "Filter":
        props["activeColor"] = colors.get("primary", "#333333")

    elif component_type == "FlickerText":
        flicker_config = components.get("flickerText") if components else None
        if flicker_config:
            if flicker_config.get("flickerColors"):
                props["flickerColors"] = flicker_config["flickerColors"]
            if flicker_config.get("speed"):
                props["speed"] = flicker_config["speed"]

    return props


def create_custom_theme(
    name: str,
    colors: dict[str, str],
    components: Optional[dict[str, Any]] = None,
    base_theme: Optional[str] = None
) -> dict[str, Any]:
    """Create a custom theme, optionally based on an existing theme."""
    if base_theme:
        base = get_theme(base_theme)
        if base:
            theme = {
                "name": name,
                "colors": {**base.get("colors", {}), **colors},
                "components": {**(base.get("components") or {}), **(components or {})},
            }
            return theme

    return {
        "name": name,
        "colors": colors,
        "components": components,
    }
