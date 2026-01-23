import redis.asyncio as redis
from backend.persistence.repository import get_repo


r = redis.Redis(host='localhost', port=6379)



class TmpDB:
    def __init__(self):
        r.flushdb()


    def connect(self, group, userid):
        pubsub = r.pubsub()


    def __del__(self): #todo ez nem jo mert nem fut le mindig
        generator = get_repo()
        try:
            repo = next(generator)

            #todo save messages to db from redis

        finally:
            try:
                next(generator)
            except StopIteration:
                pass
