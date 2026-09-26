LOG_TEMPLATES = {
  "Building": [
    "Building.create",
    "Building.update",
    "Building.status",
    "Building.export"
  ],
  "FireDevice": [
    "FireDevice.create",
    "FireDevice.update",
    "FireDevice.status",
    "FireDevice.export"
  ],
  "InspectionTask": [
    "InspectionTask.create",
    "InspectionTask.update",
    "InspectionTask.status",
    "InspectionTask.export"
  ],
  "InspectionResult": [
    "InspectionResult.create",
    "InspectionResult.update",
    "InspectionResult.status",
    "InspectionResult.export"
  ],
  "HazardTicket": [
    "HazardTicket.dispatch",
    "HazardTicket.submit",
    "HazardTicket.close",
    "HazardTicket.status",
    "HazardTicket.export"
  ]
}
# 中文模板，用于工单历史与操作日志详情
LOG_TEMPLATES_ZH = {
  "HazardTicket": {
    "dispatch": "隐患整改单派单",
    "submit": "隐患整改提交复验",
    "close": "隐患整改复验关闭",
    "status": "隐患整改单状态变更",
    "export": "隐患整改单导出"
  },
  "FireDevice": {
    "status": "消防设备状态变更"
  }
}
