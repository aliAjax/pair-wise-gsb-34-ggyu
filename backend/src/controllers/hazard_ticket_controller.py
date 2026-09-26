from fastapi import HTTPException, Request

from src.services.hazard_ticket_service import HazardTicketService
from src.utils.exceptions import ServiceError

service = HazardTicketService()


def _wrap(exc: ServiceError) -> HTTPException:
    status = 404 if exc.code.endswith("NOT_FOUND") else 400
    return HTTPException(status_code=status, detail={"code": exc.code, "message": str(exc)})


def list_hazard_ticket():
    return service.list()


def list_dispatchable():
    return service.list_dispatchable()


def dispatch_hazard_ticket(payload: dict, request: Request):
    try:
        return service.dispatch(payload, request.state.user)
    except ServiceError as exc:
        raise _wrap(exc) from exc


def submit_hazard_ticket(ticket_id: int, payload: dict, request: Request):
    try:
        return service.submit(ticket_id, payload, request.state.user)
    except ServiceError as exc:
        raise _wrap(exc) from exc


def close_hazard_ticket(ticket_id: int, request: Request):
    try:
        return service.close(ticket_id, request.state.user)
    except ServiceError as exc:
        raise _wrap(exc) from exc
