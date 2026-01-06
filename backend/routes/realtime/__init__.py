import asyncio

from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketException, status

from backend.routes.auth import decode_token

import redis.asyncio as redis



router = APIRouter(prefix='/ws')



class ConnectionManager:
    def __init__(self):
        self.r = redis.Redis(host='localhost', port=6379)


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

        #todo dani itt kezd
        user_id = token_data.user_id



    def disconnect(self, websocket: WebSocket):
        pass

    async def send(self, data: Any, websocket: WebSocket):
        await websocket.send_json(data)




manager = ConnectionManager()






from .notification import router as notification_router
router.include_router(notification_router, tags=['notification'])
