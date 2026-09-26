from fastapi import APIRouter

from src.controllers.fire_device_controller import list_fire_device, list_fire_device_tickets

router = APIRouter(prefix="/api/fire-device", tags=["FireDevice"])

router.get("")(list_fire_device)
router.get("/{device_id}/hazard-tickets")(list_fire_device_tickets)
