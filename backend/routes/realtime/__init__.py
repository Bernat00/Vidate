import asyncio

from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketException, status

from backend.routes.auth import decode_token

import redis.asyncio as redis



router = APIRouter(prefix='/ws')

r = redis.Redis(host='localhost', port=6379)


class ConnectionManager:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def connect(self) -> str:
        """:return user_id"""
        await self.websocket.accept()


        jwt = ""

        async def receive_async():
            nonlocal jwt    #lehet nem a legszebb
            jwt = await self.websocket.receive_text()

        task = asyncio.create_task(receive_async())     #dark magic

        done, pending = await asyncio.wait(
            {task},
            timeout=40
        )

        if task not in done:
            task.cancel()
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason='Client is not authenticated')


        token_data = decode_token(jwt, WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason='Client is not authenticated'))

        return token_data.user_id


    def disconnect(self):
        self.websocket.close()


    async def send(self, data: Any):
        await self.websocket.send_json(data)







from .notification import router as notification_router
router.include_router(notification_router, tags=['notification'])
