from pydantic import BaseModel


class HazardProcessEvent(BaseModel):
    at: str
    action: str
    actor: str
    note: str = ""


class HazardTicket(BaseModel):
    id: int
    result_id: int
    severity: str
    owner_id: int
    deadline: str
    rectify_status: str
    rectify_note: str
    closed_at: str
    process_events: list[HazardProcessEvent] = []


class CreateHazardTicketPayload(BaseModel):
    result_id: int
    severity: str
    deadline: str
    owner_id: int = 0


class DispatchHazardTicketPayload(BaseModel):
    owner_id: int
    severity: str
    deadline: str


class RectifyHazardTicketPayload(BaseModel):
    rectify_note: str
