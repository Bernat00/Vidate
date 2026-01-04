import asyncio

from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketException, status

from backend.routes.auth import decode_token
from backend.schemas.auth import TokenData





router = APIRouter(prefix='/ws')


class Connection:
    user_id: str
    websocket: WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[Connection] = []


    def get_active_connection(self, websocket: WebSocket) -> Connection | None:
        for conn in self.active_connections:
            if conn.websocket == websocket:
                return conn
        return None


    async def connect(self, websocket: WebSocket): #a szaros jsben nem lehet a ws-headert beallitani (asszem)
        await websocket.accept()


        jwt = ""

        async def receive_async():
            nonlocal jwt    #lehet nem a legszebb
            jwt = await websocket.receive_text()

        task = asyncio.create_task(receive_async())     #dark magic    todo  Dani pls adj velemenyt

        done, pending = await asyncio.wait(
            {task},
            timeout=40
        )

        if task not in done:
            task.cancel()
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason='Client is not authenticated')


        token_data = decode_token(jwt, WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason='Client is not authenticated'))

        conn = Connection()
        conn.user_id = token_data.user_id
        conn.websocket = websocket

        self.active_connections.append(conn)


    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(self.get_active_connection(websocket))

    async def send(self, data: Any, websocket: WebSocket):
        await websocket.send_json(data)

    async def broadcast(self, data: Any):
        for connection in self.active_connections:
            await connection.websocket.send_json(data)


manager = ConnectionManager()






from .notification import router as notification_router
router.include_router(notification_router, tags=['notification'])
