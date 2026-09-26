from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.building_repository import BuildingRepository
from src.services.hazard_ticket_service import HazardTicketService


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.hazard_service = HazardTicketService()

    def list(self):
        """设备台账列表：平铺楼栋名称，便于列表直接展示。"""
        buildings = {row["id"]: row for row in self.building_repo.find_all()}
        views = []
        for row in self.repo.find_all():
            view = dict(row)
            building = buildings.get(row["building_id"])
            view["building_name"] = building["name"] if building else ""
            views.append(view)
        return views

    def list_device_tickets(self, device_id):
        return self.hazard_service.list_device_tickets(device_id)
