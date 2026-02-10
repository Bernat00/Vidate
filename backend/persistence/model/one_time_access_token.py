from sqlmodel import Field, SQLModel



class OneTimeAccessToken(SQLModel, table=True):
    __tablename__ = "one_time_access_tokens"

    token: str = Field(primary_key=True)

