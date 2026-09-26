CREATE TABLE IF NOT EXISTS building (
  id INTEGER PRIMARY KEY,
  name TEXT,
  campus TEXT,
  floor_count TEXT,
  fire_grade TEXT,
  manager_id TEXT,
  address_code TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT  -- SUPERVISOR / MAINTAINER / INSPECTOR / AUDITOR
);

CREATE TABLE IF NOT EXISTS fire_device (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  device_code TEXT,
  device_type TEXT,
  floor TEXT,
  location_desc TEXT,
  install_date TEXT,
  status TEXT,  -- NORMAL / ABNORMAL，随名下未关闭整改单联动
  next_maintenance_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_task (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  inspector_id TEXT,
  plan_date TEXT,
  task_type TEXT,
  status TEXT,
  checklist_version TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_result (
  id INTEGER PRIMARY KEY,
  task_id TEXT,
  device_id TEXT,
  item_code TEXT,
  result_status TEXT,  -- NORMAL / ABNORMAL，异常项可派整改单
  measured_value TEXT,
  photo_url TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id INTEGER PRIMARY KEY,
  result_id TEXT,
  severity TEXT,
  owner_id TEXT,
  deadline TEXT,
  rectify_status TEXT,  -- OPEN / SUBMITTED / CLOSED
  rectify_note TEXT,
  closed_at TEXT,
  history TEXT  -- JSON 数组：派单 / 提交复验 / 复验关闭事件
);

-- 每个异常巡检项在未关闭前只保留一张整改单
CREATE UNIQUE INDEX IF NOT EXISTS uq_hazard_ticket_open_result
  ON hazard_ticket (result_id)
  WHERE rectify_status <> 'CLOSED';

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
