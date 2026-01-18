"""
Tool definitions for OpenAI function calling.
Re-exports from catalog.actions for convenience.
"""
from catalog.actions import AGENT_ACTIONS, ACTION_SCHEMAS

# Re-export for convenience
AGENT_TOOLS = AGENT_ACTIONS

__all__ = ["AGENT_TOOLS", "ACTION_SCHEMAS"]
