from pydantic import BaseModel


class ReportCreate(BaseModel):
    reported_user_id: str
    reason: str