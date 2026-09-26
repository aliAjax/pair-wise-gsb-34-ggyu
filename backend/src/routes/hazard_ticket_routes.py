from fastapi import APIRouter

from src.controllers.hazard_ticket_controller import (
    close_hazard_ticket,
    create_hazard_ticket,
    dispatch_hazard_ticket,
    list_hazard_ticket,
    rectify_hazard_ticket,
)

router = APIRouter(prefix="/api/hazard-ticket", tags=["HazardTicket"])
router.get("")(list_hazard_ticket)
router.post("")(create_hazard_ticket)
router.patch("/{ticket_id}/dispatch")(dispatch_hazard_ticket)
router.patch("/{ticket_id}/submit-review")(rectify_hazard_ticket)
router.patch("/{ticket_id}/close")(close_hazard_ticket)
