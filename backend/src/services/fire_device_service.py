from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.utils.business_error import BusinessError


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.result_repo = InspectionResultRepository()
        self.hazard_repo = HazardTicketRepository()

    def list(self):
        return self.repo.find_all()

    def detail(self, device_id: int):
        device = self.repo.find_by_id(device_id)
        if not device:
            raise BusinessError("VALIDATION_FAILED", "设备不存在")

        building = self.building_repo.find_by_id(device["building_id"])
        results = [row for row in self.result_repo.find_all() if row["device_id"] == device_id]
        result_ids = {row["id"] for row in results}
        tickets = [
            row
            for row in self.hazard_repo.find_all()
            if row["result_id"] in result_ids
        ]
        tickets.sort(
            key=lambda row: (row["rectify_status"] != "CLOSED", row["id"]),
            reverse=True,
        )
        return {**device, "building_name": building["name"] if building else "", "results": results, "hazard_tickets": tickets}
