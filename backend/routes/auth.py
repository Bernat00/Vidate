from fastapi import APIRouter

router = APIRouter('/auth')



@router.get('/login')
async def login():
    