from fastapi import APIRouter, Depends

from src.constants.roles import MAINTAINER, SUPERVISOR
from src.controllers.hazard_ticket_controller import (
    close_hazard_ticket,
    dispatch_hazard_ticket,
    list_dispatchable,
    list_hazard_ticket,
    submit_hazard_ticket,
)
from src.middlewares.rbac_middleware import allow_roles

router = APIRouter(prefix="/api/hazard-ticket", tags=["HazardTicket"])

router.get("")(list_hazard_ticket)
router.get("/dispatchable")(list_dispatchable)
router.post("/dispatch", dependencies=[Depends(allow_roles(SUPERVISOR))])(dispatch_hazard_ticket)
router.post("/{ticket_id}/submit", dependencies=[Depends(allow_roles(MAINTAINER))])(submit_hazard_ticket)
router.post("/{ticket_id}/close", dependencies=[Depends(allow_roles(SUPERVISOR))])(close_hazard_ticket)
