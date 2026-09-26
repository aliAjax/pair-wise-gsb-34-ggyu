from src.seed import seed


class StaffRepository:
    def find_all(self, role=None):
        rows = seed["staff"]
        if role:
            return [row for row in rows if row["role"] == role]
        return rows

    def find_by_id(self, staff_id):
        for row in seed["staff"]:
            if row["id"] == staff_id:
                return row
        return None
