from src.seed import seed
from src.constants.rectify_status import RECTIFY_CLOSED


class HazardTicketRepository:
    def find_all(self):
        return seed["hazardTicket"]

    def find_by_id(self, ticket_id):
        for row in seed["hazardTicket"]:
            if row["id"] == ticket_id:
                return row
        return None

    def find_open_by_result(self, result_id):
        """每个异常巡检项在未关闭前只保留一张整改单。"""
        for row in seed["hazardTicket"]:
            if row["result_id"] == result_id and row["rectify_status"] != RECTIFY_CLOSED:
                return row
        return None

    def find_open_by_device(self, device_id):
        result_ids = {r["id"] for r in seed["inspectionResult"] if r["device_id"] == device_id}
        return [
            row for row in seed["hazardTicket"]
            if row["result_id"] in result_ids and row["rectify_status"] != RECTIFY_CLOSED
        ]

    def find_by_device(self, device_id):
        result_ids = {r["id"] for r in seed["inspectionResult"] if r["device_id"] == device_id}
        return [row for row in seed["hazardTicket"] if row["result_id"] in result_ids]

    def next_id(self):
        return max((row["id"] for row in seed["hazardTicket"]), default=0) + 1

    def insert(self, row):
        seed["hazardTicket"].append(row)
        return row

    def save(self, row):
        for index, existing in enumerate(seed["hazardTicket"]):
            if existing["id"] == row["id"]:
                seed["hazardTicket"][index] = row
                return row
        return self.insert(row)
