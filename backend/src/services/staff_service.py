from src.repositories.staff_repository import StaffRepository


class StaffService:
    def __init__(self):
        self.repo = StaffRepository()

    def list(self, role=None):
        return self.repo.find_all(role)
