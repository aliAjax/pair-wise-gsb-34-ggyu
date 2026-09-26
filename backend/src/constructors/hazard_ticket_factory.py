def create_hazard_ticket_dto(**overrides):
    row = {
        "id": 501,
        "result_id": 1,
        "severity": "HIGH",
        "owner_id": 101,
        "deadline": "2026-09-30",
        "rectify_status": "PENDING",
        "rectify_note": "",
        "closed_at": "",
        "process_events": []
    }
    row.update(overrides)
    return row
