from src.services.staff_service import StaffService

service = StaffService()


def list_staff(role: str | None = None):
    return service.list(role)
