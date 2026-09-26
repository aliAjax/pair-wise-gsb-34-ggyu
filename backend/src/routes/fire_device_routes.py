from fastapi import APIRouter

from src.controllers.fire_device_controller import get_fire_device, list_fire_device

router = APIRouter(prefix="/api/fire-device", tags=["FireDevice"])
router.get("")(list_fire_device)
router.get("/{device_id}")(get_fire_device)
