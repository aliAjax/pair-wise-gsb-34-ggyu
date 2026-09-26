from src.constants.rectify_status import RECTIFY_OPEN, RECTIFY_CLOSED


def create_hazard_ticket_dto(**overrides):
    """整改单默认结构：新建派单时以此为基础。"""
    row = {
        "id": 0,
        "result_id": 0,
        "severity": "MEDIUM",
        "owner_id": 0,
        "deadline": "",
        "rectify_status": RECTIFY_OPEN,
        "rectify_note": "",
        "closed_at": "",
        "history": [],
    }
    row.update(overrides)
    return row


def create_hazard_ticket_event(action, actor, role, at, detail):
    """工单历史事件：派单 / 提交复验 / 复验关闭。"""
    return {"action": action, "actor": actor, "role": role, "at": at, "detail": detail}


def create_hazard_ticket_view(ticket, *, result, device, building, owner, today):
    """列表/详情响应视图：责任人、严重程度、截止日期、逾期标记直接平铺。"""
    view = dict(ticket)
    view["owner_name"] = owner["name"] if owner else ""
    view["device_id"] = device["id"] if device else 0
    view["device_code"] = device["device_code"] if device else ""
    view["device_type"] = device["device_type"] if device else ""
    view["building_name"] = building["name"] if building else ""
    view["floor"] = device["floor"] if device else ""
    view["location_desc"] = device["location_desc"] if device else ""
    view["item_code"] = result["item_code"] if result else ""
    view["result_note"] = result["note"] if result else ""
    view["overdue"] = bool(
        ticket["rectify_status"] != RECTIFY_CLOSED
        and ticket["deadline"]
        and ticket["deadline"] < today
    )
    return view


def create_dispatchable_result_view(result, *, device, building):
    """可派单异常项视图：异常巡检项且名下没有未关闭整改单。"""
    return {
        "result_id": result["id"],
        "device_id": device["id"] if device else 0,
        "device_code": device["device_code"] if device else "",
        "building_name": building["name"] if building else "",
        "floor": device["floor"] if device else "",
        "location_desc": device["location_desc"] if device else "",
        "item_code": result["item_code"],
        "note": result["note"],
        "measured_value": result["measured_value"],
    }
