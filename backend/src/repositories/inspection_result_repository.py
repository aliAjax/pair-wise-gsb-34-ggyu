from src.seed import seed


class InspectionResultRepository:
    def find_all(self):
        return seed["inspectionResult"]

    def find_by_id(self, result_id: int):
        return next((row for row in seed["inspectionResult"] if row["id"] == result_id), None)
