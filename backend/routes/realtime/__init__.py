from datetime import timedelta, datetime
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


    async def connect(self, websocket: WebSocket): #todo a szaros jsben nem lehet a ws-headert beallitani (asszem)
        timeout = datetime.now() + timedelta(seconds=10)
        await websocket.accept()

        jwt = None

        while jwt is None and timeout < datetime.now():
            jwt =  await websocket.receive_json()

        token_data = TokenData(user_id='asd') # decode_token(jwt, WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason='Client is not authenticated'))

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