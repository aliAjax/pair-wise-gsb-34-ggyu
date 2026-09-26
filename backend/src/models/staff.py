from pydantic import BaseModel


class Staff(BaseModel):
    id: int | float
    name: str
    role: str
