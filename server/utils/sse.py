"""
In-memory SSE (Server-Sent Events) event bus for real-time notifications.

Single-worker deployment: uses asyncio.Queue per connected client.
For multi-worker deployments, replace with Redis pub/sub.
"""

import asyncio
import json
import logging
import time
from collections import defaultdict

logger = logging.getLogger(__name__)


class SSEBus:
    """In-memory event bus that routes events to connected SSE clients."""

    def __init__(self):
        # user_id -> set of asyncio.Queue instances (one per browser tab/connection)
        self._subscribers: dict[int, set[asyncio.Queue]] = defaultdict(set)
        # The running event loop, captured when the first client connects.
        # publish() is called from sync threads; it uses this to schedule
        # put_nowait() thread-safely via call_soon_threadsafe().
        self._loop: asyncio.AbstractEventLoop | None = None

    def subscribe(self, user_id: int) -> asyncio.Queue:
        """Register a new SSE client for the given user. Returns an asyncio.Queue.
        Must be called from an async context (captures the running event loop)."""
        queue: asyncio.Queue = asyncio.Queue()
        # Capture the running loop so publish() can use call_soon_threadsafe()
        self._loop = asyncio.get_running_loop()
        self._subscribers[user_id].add(queue)
        logger.debug("SSE subscribe: user=%s, connections=%d", user_id, len(self._subscribers[user_id]))
        return queue

    def unsubscribe(self, user_id: int, queue: asyncio.Queue):
        """Remove an SSE client."""
        self._subscribers[user_id].discard(queue)
        if not self._subscribers[user_id]:
            del self._subscribers[user_id]
        logger.debug("SSE unsubscribe: user=%s", user_id)

    def publish(self, event_type: str, data: dict, target_users: list[int] | None = None):
        """
        Send an event to connected clients.
        Safe to call from synchronous Django views (threads).

        Args:
            event_type: e.g. 'request_approved', 'request_created'
            data: JSON-serializable dict with event payload
            target_users: list of user IDs to notify, or None for broadcast
        """
        envelope = {
            "type": event_type,
            "timestamp": time.time(),
            **data,
        }

        targets = target_users if target_users is not None else list(self._subscribers.keys())
        loop = self._loop
        sent = 0

        for uid in targets:
            # Snapshot the set to avoid mutation while iterating
            for queue in list(self._subscribers.get(uid, set())):
                if loop is not None and loop.is_running():
                    # Thread-safe: schedule the put into the event loop
                    try:
                        loop.call_soon_threadsafe(queue.put_nowait, envelope)
                        sent += 1
                    except RuntimeError:
                        pass  # loop was closed
                else:
                    try:
                        queue.put_nowait(envelope)
                        sent += 1
                    except asyncio.QueueFull:
                        logger.warning("SSE queue full for user=%s, dropping event", uid)

        logger.debug("SSE publish: type=%s, targets=%s, delivered=%d", event_type, targets, sent)


# Module-level singleton
sse_bus = SSEBus()


def publish_sse_event(event_type: str, data: dict, target_users: list[int] | None = None):
    """Convenience wrapper for publishing from synchronous Django views."""
    sse_bus.publish(event_type, data, target_users)
