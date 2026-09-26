from fastapi import HTTPException

from src.services.fire_device_service import FireDeviceService
from src.utils.exceptions import ServiceError

service = FireDeviceService()


def list_fire_device():
    return service.list()


def list_fire_device_tickets(device_id: int):
    try:
        return service.list_device_tickets(device_id)
    except ServiceError as exc:
        raise HTTPException(
            status_code=404, detail={"code": exc.code, "message": str(exc)}
        ) from exc
