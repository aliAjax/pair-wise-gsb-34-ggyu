from src.constants.result_status import RESULT_NORMAL


def create_inspection_result_dto(**overrides):
    row = {"id": 0, "task_id": 0, "device_id": 0, "item_code": "", "result_status": RESULT_NORMAL, "measured_value": "", "photo_url": "", "note": ""}
    row.update(overrides)
    return row
