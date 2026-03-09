"""
Async SSE view for real-time event streaming.

Requires ASGI deployment (uvicorn) — will not work under WSGI (gunicorn).
"""

import asyncio
import json
import logging

from django.http import StreamingHttpResponse

from utils.sse import sse_bus

logger = logging.getLogger(__name__)

# Heartbeat interval in seconds (keeps connection alive through proxies)
HEARTBEAT_INTERVAL = 30


async def sse_events_view(request):
    """
    SSE endpoint: GET /api/sse/events/

    Django's AuthenticationMiddleware already populates request.user via
    SessionMiddleware, so no manual session parsing is needed.
    The browser's EventSource API auto-reconnects on disconnect.
    """
    if not request.user.is_authenticated:
        return StreamingHttpResponse("Unauthorized", status=401)

    user_id = request.user.pk
    # subscribe() captures the running event loop so publish() can use
    # call_soon_threadsafe() safely from sync view threads.
    queue = sse_bus.subscribe(user_id)

    async def event_stream():
        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=HEARTBEAT_INTERVAL)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat comment — keeps the connection alive through proxies
                    yield ": heartbeat\n\n"
        except (asyncio.CancelledError, GeneratorExit):
            # Server shutdown or client disconnect — clean exit
            pass
        finally:
            sse_bus.unsubscribe(user_id, queue)

    response = StreamingHttpResponse(
        event_stream(),
        content_type="text/event-stream",
    )
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"  # Disable nginx buffering
    return response
