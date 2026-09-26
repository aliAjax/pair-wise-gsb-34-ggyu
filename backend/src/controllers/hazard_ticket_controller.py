from fastapi import HTTPException

from src.models.hazard_ticket import (
    CreateHazardTicketPayload,
    DispatchHazardTicketPayload,
    RectifyHazardTicketPayload,
)
from src.services.hazard_ticket_service import HazardTicketService
from src.utils.business_error import BusinessError

service = HazardTicketService()


def list_hazard_ticket():
    return service.list()


def create_hazard_ticket(payload: CreateHazardTicketPayload):
    try:
        return service.create_from_result(payload)
    except BusinessError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": str(exc)}) from exc


def dispatch_hazard_ticket(ticket_id: int, payload: DispatchHazardTicketPayload):
    try:
        return service.dispatch(ticket_id, payload)
    except BusinessError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": str(exc)}) from exc


def rectify_hazard_ticket(ticket_id: int, payload: RectifyHazardTicketPayload):
    try:
        return service.submit_for_review(ticket_id, payload)
    except BusinessError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": str(exc)}) from exc


def close_hazard_ticket(ticket_id: int):
    try:
        return service.close(ticket_id)
    except BusinessError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": str(exc)}) from exc
