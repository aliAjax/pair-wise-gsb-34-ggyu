from src.seed import seed


class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]

    def find_by_id(self, device_id: int):
        return next((row for row in seed["fireDevice"] if row["id"] == device_id), None)

    def update_status(self, device_id: int, status: str):
        device = self.find_by_id(device_id)
        if device:
            device["status"] = status
        return device
