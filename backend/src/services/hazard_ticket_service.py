from datetime import date, datetime, timezone

from src.constants.device_status import DEVICE_ABNORMAL, DEVICE_NORMAL
from src.constants.error_codes import ERROR_CODES
from src.constants.log_templates import LOG_TEMPLATES_ZH
from src.constants.rectify_status import RECTIFY_CLOSED, RECTIFY_OPEN, RECTIFY_SUBMITTED
from src.constants.result_status import RESULT_ABNORMAL
from src.constants.roles import MAINTAINER
from src.constructors.hazard_ticket_factory import (
    create_dispatchable_result_view,
    create_hazard_ticket_dto,
    create_hazard_ticket_event,
    create_hazard_ticket_view,
)
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.staff_repository import StaffRepository
from src.seed import seed
from src.utils.exceptions import ServiceError
from src.utils.formatters import audit_target

TICKET_LOG = LOG_TEMPLATES_ZH["HazardTicket"]
DEVICE_LOG = LOG_TEMPLATES_ZH["FireDevice"]


class HazardTicketService:
    def __init__(self):
        self.repo = HazardTicketRepository()
        self.result_repo = InspectionResultRepository()
        self.device_repo = FireDeviceRepository()
        self.staff_repo = StaffRepository()

    # ---------- 查询 ----------

    def list(self):
        """整改单列表：逾期单排在最前面，未关闭其次，已关闭垫底。"""
        today = date.today().isoformat()
        views = [self._to_view(row, today) for row in self.repo.find_all()]
        open_views = sorted(
            (v for v in views if v["rectify_status"] != RECTIFY_CLOSED),
            key=lambda v: (not v["overdue"], v["deadline"] or "9999-12-31"),
        )
        closed_views = sorted(
            (v for v in views if v["rectify_status"] == RECTIFY_CLOSED),
            key=lambda v: v["closed_at"] or "",
            reverse=True,
        )
        return open_views + closed_views

    def list_dispatchable(self):
        """可派单的异常巡检项：结果为异常且名下没有未关闭整改单。"""
        views = []
        for result in self.result_repo.find_all():
            if result["result_status"] != RESULT_ABNORMAL:
                continue
            if self.repo.find_open_by_result(result["id"]):
                continue
            device = self.device_repo.find_by_id(result["device_id"])
            building = self._building_of(device)
            views.append(create_dispatchable_result_view(result, device=device, building=building))
        return views

    def list_device_tickets(self, device_id):
        """设备名下的整改记录，供设备详情追溯整改过程。"""
        if self.device_repo.find_by_id(device_id) is None:
            raise ServiceError(ERROR_CODES["DEVICE_NOT_FOUND"])
        today = date.today().isoformat()
        views = [self._to_view(row, today) for row in self.repo.find_by_device(device_id)]
        return sorted(views, key=lambda v: v["id"], reverse=True)

    # ---------- 写操作 ----------

    def dispatch(self, payload, user):
        """主管派单：异常项 → 责任人 + 严重程度 + 截止日期。"""
        result_id = payload.get("result_id")
        severity = (payload.get("severity") or "").strip()
        owner_id = payload.get("owner_id")
        deadline = (payload.get("deadline") or "").strip()
        if not result_id or not severity or not owner_id or not deadline:
            raise ServiceError(ERROR_CODES["VALIDATION_FAILED"])

        result = self.result_repo.find_by_id(result_id)
        if result is None:
            raise ServiceError(ERROR_CODES["RESULT_NOT_FOUND"])
        if result["result_status"] != RESULT_ABNORMAL:
            raise ServiceError(ERROR_CODES["RESULT_NOT_ABNORMAL"])
        if self.repo.find_open_by_result(result_id):
            raise ServiceError(ERROR_CODES["HAZARD_TICKET_DUPLICATE_OPEN"])
        owner = self.staff_repo.find_by_id(owner_id)
        if owner is None or owner["role"] != MAINTAINER:
            raise ServiceError(ERROR_CODES["OWNER_NOT_FOUND"])

        now = datetime.now(timezone.utc).isoformat()
        ticket = create_hazard_ticket_dto(
            id=self.repo.next_id(),
            result_id=result_id,
            severity=severity,
            owner_id=owner_id,
            deadline=deadline,
            history=[
                create_hazard_ticket_event(
                    "DISPATCH",
                    user.get("name", ""),
                    user.get("role", ""),
                    now,
                    f"{TICKET_LOG['dispatch']}：指派给{owner['name']}，截止 {deadline}",
                )
            ],
        )
        self.repo.insert(ticket)
        self._mark_device(result["device_id"], DEVICE_ABNORMAL, user, now)
        print("audit", TICKET_LOG["dispatch"], audit_target("HazardTicket", ticket["id"]))
        return self._to_view(ticket, date.today().isoformat())

    def submit(self, ticket_id, payload, user):
        """维保人员填写处理说明并提交复验：OPEN → SUBMITTED。"""
        ticket = self.repo.find_by_id(ticket_id)
        if ticket is None:
            raise ServiceError(ERROR_CODES["HAZARD_TICKET_NOT_FOUND"])
        if ticket["rectify_status"] != RECTIFY_OPEN:
            raise ServiceError(ERROR_CODES["HAZARD_TICKET_BAD_STATE"])
        rectify_note = (payload.get("rectify_note") or "").strip()
        if not rectify_note:
            raise ServiceError(ERROR_CODES["VALIDATION_FAILED"])

        now = datetime.now(timezone.utc).isoformat()
        ticket["rectify_status"] = RECTIFY_SUBMITTED
        ticket["rectify_note"] = rectify_note
        ticket["history"].append(
            create_hazard_ticket_event(
                "SUBMIT",
                user.get("name", ""),
                user.get("role", ""),
                now,
                f"{TICKET_LOG['submit']}：{rectify_note}",
            )
        )
        self.repo.save(ticket)
        print("audit", TICKET_LOG["submit"], audit_target("HazardTicket", ticket["id"]))
        return self._to_view(ticket, date.today().isoformat())

    def close(self, ticket_id, user):
        """主管复验确认后关闭：SUBMITTED → CLOSED，设备可能随之恢复正常。"""
        ticket = self.repo.find_by_id(ticket_id)
        if ticket is None:
            raise ServiceError(ERROR_CODES["HAZARD_TICKET_NOT_FOUND"])
        if ticket["rectify_status"] != RECTIFY_SUBMITTED:
            raise ServiceError(ERROR_CODES["HAZARD_TICKET_BAD_STATE"])

        now = datetime.now(timezone.utc).isoformat()
        ticket["rectify_status"] = RECTIFY_CLOSED
        ticket["closed_at"] = now
        ticket["history"].append(
            create_hazard_ticket_event(
                "CLOSE",
                user.get("name", ""),
                user.get("role", ""),
                now,
                f"{TICKET_LOG['close']}：复验通过",
            )
        )
        self.repo.save(ticket)

        result = self.result_repo.find_by_id(ticket["result_id"])
        if result is not None and not self.repo.find_open_by_device(result["device_id"]):
            # 设备名下最后一张未关闭整改单处理完毕，台账状态回到正常
            self._mark_device(result["device_id"], DEVICE_NORMAL, user, now)
        print("audit", TICKET_LOG["close"], audit_target("HazardTicket", ticket["id"]))
        return self._to_view(ticket, date.today().isoformat())

    # ---------- 内部 ----------

    def _mark_device(self, device_id, status, user, now):
        device = self.device_repo.update_status(device_id, status)
        if device is not None:
            print(
                "audit",
                DEVICE_LOG["status"],
                audit_target("FireDevice", device_id),
                f"-> {status}",
            )
        return device

    def _building_of(self, device):
        if not device:
            return None
        for row in seed["building"]:
            if row["id"] == device["building_id"]:
                return row
        return None

    def _to_view(self, ticket, today):
        result = self.result_repo.find_by_id(ticket["result_id"])
        device = self.device_repo.find_by_id(result["device_id"]) if result else None
        building = self._building_of(device)
        owner = self.staff_repo.find_by_id(ticket["owner_id"])
        return create_hazard_ticket_view(
            ticket, result=result, device=device, building=building, owner=owner, today=today
        )
