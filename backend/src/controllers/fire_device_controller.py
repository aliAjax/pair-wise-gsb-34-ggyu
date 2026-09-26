from fastapi import HTTPException

from src.services.fire_device_service import FireDeviceService
from src.utils.business_error import BusinessError

service = FireDeviceService()


def list_fire_device():
    return service.list()


def get_fire_device(device_id: int):
    try:
        return service.detail(device_id)
    except BusinessError as exc:
        raise HTTPException(status_code=404, detail={"code": exc.code, "message": str(exc)}) from exc
