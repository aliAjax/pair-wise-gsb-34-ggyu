export const mockData = {
  building: [
    { id: 1, name: "A 栋研发楼", campus: "东湖科技园", floor_count: 12, fire_grade: "一级", manager_id: 1, address_code: "420100-A01" },
    { id: 2, name: "B 栋综合楼", campus: "东湖科技园", floor_count: 8, fire_grade: "二级", manager_id: 2, address_code: "420100-B01" },
    { id: 3, name: "C 栋仓储楼", campus: "东湖科技园", floor_count: 5, fire_grade: "一级", manager_id: 3, address_code: "420100-C01" }
  ],
  fireDevice: [
    { id: 1, building_id: 1, device_code: "HYD-A01-03", device_type: "HYDRANT", floor: "3F", location_desc: "东侧消防栓箱", install_date: "2024-03-18", status: "HAZARD_OPEN", next_maintenance_at: "2026-10-15" },
    { id: 2, building_id: 2, device_code: "SMK-B02-06", device_type: "SMOKE_DETECTOR", floor: "6F", location_desc: "会议室走廊", install_date: "2023-11-02", status: "HAZARD_OPEN", next_maintenance_at: "2026-10-20" },
    { id: 3, building_id: 3, device_code: "SPK-C01-01", device_type: "SPRINKLER", floor: "1F", location_desc: "货架一区上方", install_date: "2024-01-26", status: "NORMAL", next_maintenance_at: "2026-10-08" },
    { id: 4, building_id: 1, device_code: "EXT-A01-08", device_type: "EXTINGUISHER", floor: "8F", location_desc: "电梯厅", install_date: "2025-02-14", status: "HAZARD_OPEN", next_maintenance_at: "2026-11-02" }
  ],
  inspectionTask: [
    { id: 1, building_id: 1, inspector_id: 201, plan_date: "2026-09-18", task_type: "MONTHLY", status: "REVIEWED", checklist_version: "v2026.09", finished_at: "2026-09-18T16:20:00Z" },
    { id: 2, building_id: 2, inspector_id: 202, plan_date: "2026-09-22", task_type: "WEEKLY", status: "REVIEWED", checklist_version: "v2026.09", finished_at: "2026-09-22T11:05:00Z" },
    { id: 3, building_id: 3, inspector_id: 201, plan_date: "2026-09-20", task_type: "MONTHLY", status: "REVIEWED", checklist_version: "v2026.09", finished_at: "2026-09-20T15:40:00Z" },
    { id: 4, building_id: 1, inspector_id: 203, plan_date: "2026-09-25", task_type: "WEEKLY", status: "SUBMITTED", checklist_version: "v2026.09", finished_at: "2026-09-25T10:15:00Z" }
  ],
  inspectionResult: [
    { id: 1, task_id: 1, device_id: 1, item_code: "HYDRANT-PRESSURE", result_status: "ABNORMAL", measured_value: "0.18MPa", photo_url: "/mock/hydrant-pressure.png", note: "栓口水压低于 0.25MPa 标准" },
    { id: 2, task_id: 2, device_id: 2, item_code: "SMOKE-ALARM", result_status: "ABNORMAL", measured_value: "无响应", photo_url: "/mock/smoke-detector.png", note: "烟感测试未触发主机报警" },
    { id: 3, task_id: 3, device_id: 3, item_code: "SPRINKLER-SEAL", result_status: "ABNORMAL", measured_value: "轻微渗水", photo_url: "/mock/sprinkler-seal.png", note: "喷头密封件老化渗水" },
    { id: 4, task_id: 4, device_id: 4, item_code: "EXT-PRESSURE-GAUGE", result_status: "ABNORMAL", measured_value: "指针红区", photo_url: "/mock/extinguisher.png", note: "灭火器压力不足，需要更换或充压" }
  ],
  hazardTicket: [
    {
      id: 501, result_id: 1, severity: "HIGH", owner_id: 101, deadline: "2026-09-20",
      rectify_status: "ASSIGNED", rectify_note: "", closed_at: "",
      process_events: [
        { at: "2026-09-18T17:00:00Z", action: "CREATE", actor: "系统", note: "异常巡检项生成整改单" },
        { at: "2026-09-19T09:30:00Z", action: "DISPATCH", actor: "陈主管", note: "派发给张伟，截止 2026-09-20" }
      ]
    },
    {
      id: 502, result_id: 2, severity: "MEDIUM", owner_id: 102, deadline: "2026-09-30",
      rectify_status: "REVIEW_PENDING", rectify_note: "已更换烟感探测模块，并完成三次联动测试。", closed_at: "",
      process_events: [
        { at: "2026-09-22T13:20:00Z", action: "CREATE", actor: "系统", note: "异常巡检项生成整改单" },
        { at: "2026-09-23T10:00:00Z", action: "DISPATCH", actor: "陈主管", note: "派发给李娜，截止 2026-09-30" },
        { at: "2026-09-25T16:45:00Z", action: "SUBMIT_REVIEW", actor: "李娜", note: "已更换探测模块并提交复验" }
      ]
    },
    {
      id: 503, result_id: 3, severity: "LOW", owner_id: 103, deadline: "2026-09-24",
      rectify_status: "CLOSED", rectify_note: "已更换密封件，保压 30 分钟无渗漏。", closed_at: "2026-09-24T11:30:00Z",
      process_events: [
        { at: "2026-09-20T17:10:00Z", action: "CREATE", actor: "系统", note: "异常巡检项生成整改单" },
        { at: "2026-09-21T09:00:00Z", action: "DISPATCH", actor: "陈主管", note: "派发给王强，截止 2026-09-24" },
        { at: "2026-09-23T15:30:00Z", action: "SUBMIT_REVIEW", actor: "王强", note: "密封件更换完成，申请复验" },
        { at: "2026-09-24T11:30:00Z", action: "CLOSE", actor: "陈主管", note: "复验通过，设备恢复正常" }
      ]
    },
    {
      id: 504, result_id: 4, severity: "CRITICAL", owner_id: 0, deadline: "2026-10-02",
      rectify_status: "PENDING", rectify_note: "", closed_at: "",
      process_events: [
        { at: "2026-09-25T10:20:00Z", action: "CREATE", actor: "系统", note: "异常巡检项生成整改单，等待主管派单" }
      ]
    }
  ]
} as const;
