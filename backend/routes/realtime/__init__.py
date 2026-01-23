import asyncio

from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketException, status
from fastapi.logger import logger

from backend.routes.auth import decode_token

import redis.asyncio as redis


r = redis.Redis(host='localhost', port=6379)


class ConnectionManager:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def connect(self) -> str:
        ":return user_id"
        await self.websocket.accept()

        # Expect JWT in query params: ?jwt=... (also accept ?token=... for flexibility)
        jwt_token = (
            self.websocket.query_params.get("jwt")
            or self.websocket.query_params.get("token")
        )

        if not jwt_token:
            raise WebSocketException(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Client is not authenticated",
            )

        token_data = decode_token(
            jwt_token,
            WebSocketException(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Client is not authenticated",
            ),
        )

        return token_data.user_id


    async def send(self, data: Any):
        await self.websocket.send_json(data)


    async def receive_json(self) -> Any:
        return await self.websocket.receive_json()

    async def receive_text(self) -> str:
        return await self.websocket.receive_text()


