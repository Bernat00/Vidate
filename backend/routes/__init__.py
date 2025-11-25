from typing import Any, Generic, List, Optional, Type, TypeVar
from sqlmodel import Session, SQLModel, inspect
from .. import engine


def get_repo():
      with Session(engine) as session:
        yield Repository(session)
      




T = TypeVar("T", bound=SQLModel)


class Repository(Generic[T]):
    model: Type[T] = SQLModel
    session: Session


    def __init__(self, session: Session):
        self.session = session

    
    def save(self, model: T, with_commit=True) -> None:
        self.session.add(model)
        if with_commit:
            self.session.commit()

    def delete(self, model: T) -> None:
        self.session.delete(model)
        self.session.commit()


    def get_by_id(self, id: int | str, joins: Optional[List[Any]] = None) -> Optional[T]: #scary type snake
        '''
        Join only works if id is the fhirst primary key in the modell!!!

        :param joins: a list of mapped columbs that you what to join with in the order of joinig
        '''

        if not joins:
            return self.session.get(self.model, id)
        

        statement = (
            self.model.select().where(inspect(self.model).primary_key[0] == id)
        )

        for join_column in joins:
            statement.join(join_column)

        return self.session.scalar(statement)

            
    
    def get_all(self)-> Optional[List[T]]:
        statement=(
            self.model.select()
        )

        return self.session.scalars(statement).all()
