"""
Customization API endpoint - Main agent interface.
Uses Server-Sent Events (SSE) for real-time streaming.
"""
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.requests import CustomizeRequest
from models.ui_tree import UITree
from agent.agent import EcommerceAgent

router = APIRouter(prefix="/api", tags=["customize"])


@router.post("/customize")
async def customize(request: CustomizeRequest):
    """
    Customize the UI based on natural language prompt.

    Streams events via Server-Sent Events (SSE):
    - status: Progress updates
    - plan: Initial plan with todos
    - todo_update: Todo status changes
    - patch: UI tree patches
    - theme_update: Theme changes
    - error: Error messages
    - complete: Customization complete

    Request body:
    - prompt: Natural language customization request
    - current_tree: Current UI tree state
    - theme: Optional current theme
    """
    async def event_stream():
        try:
            # Create agent with current tree
            agent = EcommerceAgent(
                tree=request.current_tree,
                theme=request.theme,
            )

            # Execute and stream events
            async for event in agent.execute(request.prompt):
                event_data = event.model_dump(exclude_none=True)
                yield f"data: {json.dumps(event_data)}\n\n"

        except Exception as e:
            error_event = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/customize/sync")
async def customize_sync(request: CustomizeRequest):
    """
    Synchronous version of customize (for testing).
    Returns all events at once instead of streaming.
    """
    try:
        agent = EcommerceAgent(
            tree=request.current_tree,
            theme=request.theme,
        )

        events = []
        async for event in agent.execute(request.prompt):
            events.append(event.model_dump(exclude_none=True))

        return {"success": True, "events": events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
