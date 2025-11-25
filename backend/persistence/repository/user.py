from . import BaseRepo
from ..model.user import User
class UserRepo(BaseRepo[User]):
    
    def __init__(self, session):
        super().__init__(session, User)


