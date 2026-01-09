from time import sleep
from typing import Annotated

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, status, Depends

from backend.routes.realtime import ConnectionManager

from . import r


router = APIRouter(prefix='/ws')



@router.websocket('/aa')
async def aa(conn: Annotated[ConnectionManager, Depends(ConnectionManager)]):
    pubsub = r.pubsub()

    try:
        uid = await conn.connect()
        pubsub.subscribe(f'chat:{uid}') #todo dani talald ki mi legyen ezzel


        async for msg in pubsub.listen():
            await conn.send(msg)



    except WebSocketDisconnect:
        pubsub.unsubscribe()


@router.websocket('/test')
async def test(conn: Annotated[ConnectionManager, Depends(ConnectionManager)]):
    await conn.connect()
    while True:
        tmp = await conn.receive_json()
        await conn.send(tmp)


