from src.constants.device_status import DEVICE_NORMAL


def create_fire_device_dto(**overrides):
    row = {"id": 0, "building_id": 0, "device_code": "", "device_type": "HYDRANT", "floor": "", "location_desc": "", "install_date": "", "status": DEVICE_NORMAL, "next_maintenance_at": ""}
    row.update(overrides)
    return row
