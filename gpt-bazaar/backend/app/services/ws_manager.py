from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    """Room-based WebSocket hub for real-time order & inventory broadcasts."""

    def __init__(self) -> None:
        self._rooms: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, room: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._rooms[room].add(websocket)

    def disconnect(self, room: str, websocket: WebSocket) -> None:
        self._rooms[room].discard(websocket)

    async def broadcast(self, room: str, event: str, payload: dict) -> None:
        dead: list[WebSocket] = []
        message = {"event": event, "data": payload}
        for ws in list(self._rooms[room]):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._rooms[room].discard(ws)


ws_manager = ConnectionManager()
