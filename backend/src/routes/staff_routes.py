from fastapi import APIRouter

from src.controllers.staff_controller import list_staff

router = APIRouter(prefix="/api/staff", tags=["Staff"])

router.get("")(list_staff)
