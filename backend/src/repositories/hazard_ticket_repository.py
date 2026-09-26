from src.constants.hazard_status import OPEN_HAZARD_STATUS
from src.seed import seed


class HazardTicketRepository:
    def find_all(self):
        return seed["hazardTicket"]

    def find_by_id(self, ticket_id: int):
        return next((row for row in seed["hazardTicket"] if row["id"] == ticket_id), None)

    def find_open_by_result_id(self, result_id: int):
        return next(
            (
                row
                for row in seed["hazardTicket"]
                if row["result_id"] == result_id and row["rectify_status"] in OPEN_HAZARD_STATUS
            ),
            None,
        )

    def find_open_by_device_id(self, device_id: int):
        result_ids = {
            result["id"]
            for result in seed["inspectionResult"]
            if result["device_id"] == device_id
        }
        return [
            row
            for row in seed["hazardTicket"]
            if row["result_id"] in result_ids and row["rectify_status"] in OPEN_HAZARD_STATUS
        ]

    @staticmethod
    def append_event(row, action: str, actor: str, note: str, at: str):
        row.setdefault("process_events", []).append({"at": at, "action": action, "actor": actor, "note": note})
