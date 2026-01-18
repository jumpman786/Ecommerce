"""
Customization API endpoint - Main agent interface.
Uses Server-Sent Events (SSE) for real-time streaming.
"""
import json
import uuid
import time
import base64
from pathlib import Path
from datetime import datetime
from typing import Dict, Tuple
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.requests import CustomizeRequest, ScreenshotUpload
from models.ui_tree import UITree
from agent.agent import EcommerceAgent

# Screenshots folder
SCREENSHOTS_DIR = Path(__file__).parent.parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

router = APIRouter(prefix="/api", tags=["customize"])

# Store active agents by session ID with last access time
# Format: {session_id: (agent, last_access_timestamp)}
active_agents: Dict[str, Tuple[EcommerceAgent, float]] = {}

# Session timeout in seconds (30 minutes)
SESSION_TIMEOUT = 30 * 60


def _cleanup_expired_sessions():
    """Remove sessions that haven't been used in SESSION_TIMEOUT seconds."""
    now = time.time()
    expired = [
        sid for sid, (_, last_access) in active_agents.items()
        if now - last_access > SESSION_TIMEOUT
    ]
    for sid in expired:
        del active_agents[sid]
    if expired:
        print(f"🧹 Cleaned up {len(expired)} expired sessions")


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
    - session_id: Optional session ID for conversation persistence
    """
    async def event_stream():
        # Clean up expired sessions periodically
        _cleanup_expired_sessions()
        
        # Use provided session_id or generate new one
        session_id = request.session_id or str(uuid.uuid4())
        
        try:
            # Check if we have an existing agent for this session
            if session_id in active_agents:
                # Reuse existing agent - update its tree with current state
                agent, _ = active_agents[session_id]
                agent.tree = request.current_tree
                if request.theme:
                    agent.theme = request.theme
                # Reset todo manager for new request
                agent.todo_manager.clear()
                agent.patches.clear()
                print(f"♻️ Reusing session {session_id} (history: {len(agent.messages)} messages)")
            else:
                # Create new agent
                agent = EcommerceAgent(
                    tree=request.current_tree,
                    theme=request.theme,
                    session_id=session_id,
                )
                print(f"🆕 New session {session_id}")
            
            # Update session with current timestamp
            active_agents[session_id] = (agent, time.time())

            # Execute and stream events
            async for event in agent.execute(request.prompt):
                event_data = event.model_dump(exclude_none=True)
                yield f"data: {json.dumps(event_data)}\n\n"

        except Exception as e:
            error_event = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
        
        # Update last access time after completion
        if session_id in active_agents:
            agent, _ = active_agents[session_id]
            active_agents[session_id] = (agent, time.time())

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
    Note: Screenshot verification is skipped in sync mode.
    """
    try:
        agent = EcommerceAgent(
            tree=request.current_tree,
            theme=request.theme,
        )

        events = []
        async for event in agent.execute(request.prompt):
            # Skip screenshot requests in sync mode (no frontend to capture)
            if event.type == "screenshot_request":
                continue
            events.append(event.model_dump(exclude_none=True))

        return {"success": True, "events": events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/screenshot/{session_id}")
async def receive_screenshot(session_id: str, request: ScreenshotUpload):
    """
    Receive a screenshot from the frontend for verification.
    
    The frontend captures a screenshot when it receives a screenshot_request event,
    then POSTs the base64-encoded image here.
    """
    session_data = active_agents.get(session_id)
    
    if not session_data:
        raise HTTPException(status_code=404, detail=f"No active agent for session {session_id}")
    
    agent, _ = session_data
    
    # Save screenshot to file for debugging
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{session_id[:8]}.png"
        filepath = SCREENSHOTS_DIR / filename
        
        # Strip data URL prefix if present
        image_b64 = request.image_base64
        if image_b64.startswith('data:'):
            # Extract base64 part after the comma
            image_b64 = image_b64.split(',', 1)[1]
        
        # Decode and save
        image_data = base64.b64decode(image_b64)
        filepath.write_bytes(image_data)
        print(f"📸 Screenshot saved: {filepath}")
    except Exception as e:
        print(f"⚠️ Failed to save screenshot: {e}")
    
    # Provide screenshot data to the waiting agent
    agent.screenshot_data = request.image_base64
    agent.screenshot_event.set()
    
    return {"status": "received", "session_id": session_id, "saved_to": str(filepath) if 'filepath' in locals() else None}
