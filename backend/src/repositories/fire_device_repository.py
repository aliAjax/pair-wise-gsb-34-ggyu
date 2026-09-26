from src.seed import seed


class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]

    def find_by_id(self, device_id):
        for row in seed["fireDevice"]:
            if row["id"] == device_id:
                return row
        return None

    def update_status(self, device_id, status):
        row = self.find_by_id(device_id)
        if row is not None:
            row["status"] = status
        return row
