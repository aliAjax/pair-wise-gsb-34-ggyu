from datetime import datetime, timezone

from src.constants.device_status import DeviceStatus
from src.constants.hazard_severity import HazardSeverity
from src.constants.log_templates import LOG_TEMPLATES
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.utils.business_error import BusinessError


class HazardTicketService:
    def __init__(self):
        self.repo = HazardTicketRepository()
        self.result_repo = InspectionResultRepository()
        self.device_repo = FireDeviceRepository()

    @staticmethod
    def _now():
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    @staticmethod
    def _audit(action: str, ticket_id: int, note: str):
        print("audit", LOG_TEMPLATES["HazardTicket"], action, f"HazardTicket#{ticket_id}", note)

    def _get_ticket(self, ticket_id: int):
        ticket = self.repo.find_by_id(ticket_id)
        if not ticket:
            raise BusinessError("HAZARD_NOT_FOUND")
        return ticket

    def _sync_device_status(self, result_id: int):
        result = self.result_repo.find_by_id(result_id)
        if not result:
            return
        device_id = result["device_id"]
        status = DeviceStatus.HAZARD_OPEN if self.repo.find_open_by_device_id(device_id) else DeviceStatus.NORMAL
        self.device_repo.update_status(device_id, status)

    def create_from_result(self, payload):
        result = self.result_repo.find_by_id(payload.result_id)
        if not result:
            raise BusinessError("RESULT_NOT_FOUND")
        if result["result_status"] != "ABNORMAL":
            raise BusinessError("VALIDATION_FAILED", "仅异常巡检项可以生成整改单")
        if self.repo.find_open_by_result_id(payload.result_id):
            raise BusinessError("HAZARD_ALREADY_OPEN")
        if payload.severity not in HazardSeverity:
            raise BusinessError("VALIDATION_FAILED", "请选择有效严重程度")
        try:
            datetime.fromisoformat(payload.deadline.replace("Z", "+00:00"))
        except ValueError as exc:
            raise BusinessError("VALIDATION_FAILED", "截止日期格式不正确") from exc

        next_id = max((row["id"] for row in self.repo.find_all()), default=500) + 1
        now = self._now()
        ticket = {
            "id": next_id,
            "result_id": payload.result_id,
            "severity": payload.severity,
            "owner_id": payload.owner_id,
            "deadline": payload.deadline,
            "rectify_status": "PENDING" if payload.owner_id <= 0 else "ASSIGNED",
            "rectify_note": "",
            "closed_at": "",
            "process_events": [
                {"at": now, "action": "CREATE", "actor": "系统", "note": "异常巡检项生成整改单"}
            ],
        }
        self.repo.find_all().append(ticket)
        self._sync_device_status(ticket["result_id"])
        return ticket

    def list(self):
        today = datetime.now(timezone.utc).date()

        def sort_key(row):
            is_closed = row["rectify_status"] == "CLOSED"
            deadline = datetime.fromisoformat(row["deadline"].replace("Z", "+00:00")).date()
            overdue_group = 2 if is_closed else (0 if deadline < today else 1)
            return overdue_group, deadline, row["id"]

        return sorted(self.repo.find_all(), key=sort_key)

    def dispatch(self, ticket_id: int, payload):
        if payload.owner_id <= 0:
            raise BusinessError("VALIDATION_FAILED", "请选择责任人")
        if payload.severity not in HazardSeverity:
            raise BusinessError("VALIDATION_FAILED", "请选择有效严重程度")
        try:
            datetime.fromisoformat(payload.deadline.replace("Z", "+00:00"))
        except ValueError as exc:
            raise BusinessError("VALIDATION_FAILED", "截止日期格式不正确") from exc

        ticket = self._get_ticket(ticket_id)
        if ticket["rectify_status"] not in {"PENDING", "ASSIGNED"}:
            raise BusinessError("INVALID_HAZARD_TRANSITION")

        ticket.update(
            owner_id=payload.owner_id,
            severity=payload.severity,
            deadline=payload.deadline,
            rectify_status="ASSIGNED",
        )
        self.repo.append_event(
            ticket,
            "DISPATCH",
            "陈主管",
            f"派发给责任人 {payload.owner_id}，严重程度 {payload.severity}，截止 {payload.deadline}",
            self._now(),
        )
        self._audit("dispatch", ticket_id, "隐患整改单已派单")
        self._sync_device_status(ticket["result_id"])
        return ticket

    def submit_for_review(self, ticket_id: int, payload):
        note = payload.rectify_note.strip()
        if not note:
            raise BusinessError("VALIDATION_FAILED", "请填写处理说明")

        ticket = self._get_ticket(ticket_id)
        if ticket["rectify_status"] not in {"ASSIGNED", "RECTIFYING"}:
            raise BusinessError("INVALID_HAZARD_TRANSITION")

        ticket.update(rectify_note=note, rectify_status="REVIEW_PENDING")
        self.repo.append_event(ticket, "SUBMIT_REVIEW", f"维保人员 {ticket['owner_id']}", note, self._now())
        self._audit("submit_review", ticket_id, "隐患整改单已提交复验")
        return ticket

    def close(self, ticket_id: int):
        ticket = self._get_ticket(ticket_id)
        if ticket["rectify_status"] != "REVIEW_PENDING":
            raise BusinessError("INVALID_HAZARD_TRANSITION")

        closed_at = self._now()
        ticket.update(rectify_status="CLOSED", closed_at=closed_at)
        self.repo.append_event(ticket, "CLOSE", "陈主管", "复验通过，关闭整改单", closed_at)
        self._audit("close", ticket_id, "隐患整改单已关闭")
        self._sync_device_status(ticket["result_id"])
        return ticket
