CREATE TABLE IF NOT EXISTS building (
  id INTEGER PRIMARY KEY,
  name TEXT,
  campus TEXT,
  floor_count INTEGER,
  fire_grade TEXT,
  manager_id INTEGER,
  address_code TEXT
);

CREATE TABLE IF NOT EXISTS fire_device (
  id INTEGER PRIMARY KEY,
  building_id INTEGER,
  device_code TEXT,
  device_type TEXT,
  floor TEXT,
  location_desc TEXT,
  install_date TEXT,
  status TEXT CHECK (status IN ('NORMAL', 'HAZARD_OPEN')),
  next_maintenance_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_task (
  id INTEGER PRIMARY KEY,
  building_id INTEGER,
  inspector_id INTEGER,
  plan_date TEXT,
  task_type TEXT,
  status TEXT,
  checklist_version TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_result (
  id INTEGER PRIMARY KEY,
  task_id INTEGER,
  device_id INTEGER,
  item_code TEXT,
  result_status TEXT,
  measured_value TEXT,
  photo_url TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id INTEGER PRIMARY KEY,
  result_id INTEGER,
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  owner_id INTEGER,
  deadline TEXT,
  rectify_status TEXT CHECK (rectify_status IN ('PENDING', 'ASSIGNED', 'RECTIFYING', 'REVIEW_PENDING', 'CLOSED')),
  rectify_note TEXT,
  closed_at TEXT,
  process_events TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_hazard_ticket_deadline ON hazard_ticket(deadline);
CREATE UNIQUE INDEX IF NOT EXISTS uq_hazard_ticket_open_result
  ON hazard_ticket(result_id)
  WHERE rectify_status <> 'CLOSED';
CREATE INDEX IF NOT EXISTS idx_hazard_ticket_result_status ON hazard_ticket(result_id, rectify_status);
CREATE INDEX IF NOT EXISTS idx_inspection_result_device ON inspection_result(device_id);
