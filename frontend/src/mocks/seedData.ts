export const mockData = {
  "building": [
    { "id": 1, "name": "智造园 A 栋", "campus": "高新园区", "floor_count": "12", "fire_grade": "一级", "manager_id": 1, "address_code": "GX-A-01" },
    { "id": 2, "name": "智造园 B 栋", "campus": "高新园区", "floor_count": "8", "fire_grade": "二级", "manager_id": 1, "address_code": "GX-B-02" },
    { "id": 3, "name": "物流仓 C 区", "campus": "临港园区", "floor_count": "2", "fire_grade": "二级", "manager_id": 1, "address_code": "LG-C-03" }
  ],
  "staff": [
    { "id": 1, "name": "王莉", "role": "SUPERVISOR" },
    { "id": 2, "name": "陈刚", "role": "MAINTAINER" },
    { "id": 3, "name": "刘敏", "role": "MAINTAINER" },
    { "id": 4, "name": "赵磊", "role": "INSPECTOR" },
    { "id": 5, "name": "孙洁", "role": "AUDITOR" }
  ],
  "fireDevice": [
    { "id": 1, "building_id": 1, "device_code": "HYD-A1-001", "device_type": "HYDRANT", "floor": "1F", "location_desc": "东侧楼梯间", "install_date": "2024-03-11", "status": "NORMAL", "next_maintenance_at": "2026-10-15" },
    { "id": 2, "building_id": 1, "device_code": "EXT-A2-014", "device_type": "EXTINGUISHER", "floor": "2F", "location_desc": "配电房门口", "install_date": "2024-05-20", "status": "ABNORMAL", "next_maintenance_at": "2026-10-08" },
    { "id": 3, "building_id": 2, "device_code": "SMK-B3-006", "device_type": "SMOKE_DETECTOR", "floor": "3F", "location_desc": "走廊中段", "install_date": "2023-11-02", "status": "ABNORMAL", "next_maintenance_at": "2026-09-30" },
    { "id": 4, "building_id": 2, "device_code": "SPR-B1-002", "device_type": "SPRINKLER", "floor": "B1", "location_desc": "地下车库", "install_date": "2023-08-19", "status": "NORMAL", "next_maintenance_at": "2026-11-11" },
    { "id": 5, "building_id": 3, "device_code": "EXL-C1-009", "device_type": "EXIT_LIGHT", "floor": "1F", "location_desc": "安全出口上方", "install_date": "2025-01-26", "status": "NORMAL", "next_maintenance_at": "2026-12-01" },
    { "id": 6, "building_id": 3, "device_code": "EXT-C1-021", "device_type": "EXTINGUISHER", "floor": "1F", "location_desc": "装卸区立柱旁", "install_date": "2025-02-14", "status": "NORMAL", "next_maintenance_at": "2026-10-25" }
  ],
  "inspectionTask": [
    { "id": 1, "building_id": 1, "inspector_id": 4, "plan_date": "2026-09-10", "task_type": "ROUTINE", "status": "REVIEWED", "checklist_version": "v2026.09", "finished_at": "2026-09-10T10:30:00Z" },
    { "id": 2, "building_id": 2, "inspector_id": 4, "plan_date": "2026-09-15", "task_type": "ROUTINE", "status": "SUBMITTED", "checklist_version": "v2026.09", "finished_at": "2026-09-15T09:40:00Z" },
    { "id": 3, "building_id": 3, "inspector_id": 4, "plan_date": "2026-09-24", "task_type": "ROUTINE", "status": "IN_PROGRESS", "checklist_version": "v2026.09", "finished_at": "" }
  ],
  "inspectionResult": [
    { "id": 1, "task_id": 1, "device_id": 1, "item_code": "HYD-PRESSURE", "result_status": "NORMAL", "measured_value": "0.35MPa", "photo_url": "/mock/photo-1.png", "note": "栓口压力正常" },
    { "id": 2, "task_id": 1, "device_id": 2, "item_code": "EXT-PRESSURE", "result_status": "ABNORMAL", "measured_value": "指针红区", "photo_url": "/mock/photo-2.png", "note": "灭火器压力不足，需重新充装" },
    { "id": 3, "task_id": 2, "device_id": 3, "item_code": "SMK-ALARM", "result_status": "ABNORMAL", "measured_value": "连续误报", "photo_url": "/mock/photo-3.png", "note": "烟感探测器连续误报，疑似污染" },
    { "id": 4, "task_id": 2, "device_id": 4, "item_code": "SPR-FLOW", "result_status": "NORMAL", "measured_value": "末端试水正常", "photo_url": "/mock/photo-4.png", "note": "水流指示器动作正常" },
    { "id": 5, "task_id": 3, "device_id": 5, "item_code": "EXL-LUX", "result_status": "NORMAL", "measured_value": "1.2lx", "photo_url": "/mock/photo-5.png", "note": "应急照度达标" },
    { "id": 6, "task_id": 1, "device_id": 2, "item_code": "EXT-APPEARANCE", "result_status": "ABNORMAL", "measured_value": "铅封缺失", "photo_url": "/mock/photo-6.png", "note": "灭火器铅封缺失，喷管老化" },
    { "id": 7, "task_id": 3, "device_id": 6, "item_code": "EXT-EXPIRE", "result_status": "ABNORMAL", "measured_value": "维修期届满", "photo_url": "/mock/photo-7.png", "note": "灭火器距上次维修已满一年，需送检" }
  ],
  "hazardTicket": [
    {
      "id": 1, "result_id": 2, "severity": "HIGH", "owner_id": 3, "deadline": "2026-09-30",
      "rectify_status": "SUBMITTED", "rectify_note": "已更换灭火器钢瓶并重新充装，压力恢复正常", "closed_at": "",
      "history": [
        { "action": "DISPATCH", "actor": "王莉", "role": "SUPERVISOR", "at": "2026-09-10T11:05:00Z", "detail": "隐患整改单派单：指派给刘敏，截止 2026-09-30" },
        { "action": "SUBMIT", "actor": "刘敏", "role": "MAINTAINER", "at": "2026-09-22T08:40:00Z", "detail": "隐患整改提交复验：已更换灭火器钢瓶并重新充装，压力恢复正常" }
      ]
    },
    {
      "id": 2, "result_id": 3, "severity": "CRITICAL", "owner_id": 2, "deadline": "2026-09-20",
      "rectify_status": "OPEN", "rectify_note": "", "closed_at": "",
      "history": [
        { "action": "DISPATCH", "actor": "王莉", "role": "SUPERVISOR", "at": "2026-09-15T10:20:00Z", "detail": "隐患整改单派单：指派给陈刚，截止 2026-09-20" }
      ]
    },
    {
      "id": 3, "result_id": 6, "severity": "MEDIUM", "owner_id": 3, "deadline": "2026-09-12",
      "rectify_status": "CLOSED", "rectify_note": "已补装铅封并更换老化喷管", "closed_at": "2026-09-11T09:12:00Z",
      "history": [
        { "action": "DISPATCH", "actor": "王莉", "role": "SUPERVISOR", "at": "2026-09-10T11:08:00Z", "detail": "隐患整改单派单：指派给刘敏，截止 2026-09-12" },
        { "action": "SUBMIT", "actor": "刘敏", "role": "MAINTAINER", "at": "2026-09-11T07:30:00Z", "detail": "隐患整改提交复验：已补装铅封并更换老化喷管" },
        { "action": "CLOSE", "actor": "王莉", "role": "SUPERVISOR", "at": "2026-09-11T09:12:00Z", "detail": "隐患整改复验关闭：复验通过" }
      ]
    }
  ]
};
