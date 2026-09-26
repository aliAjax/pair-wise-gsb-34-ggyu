# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>

隐患整改闭环（写操作通过 `x-role` 请求头区分角色，派单/复验关闭仅 `SUPERVISOR`，提交复验仅 `MAINTAINER`）：

```bash
# 整改单列表：逾期单排在最前面，责任人/严重程度/截止日期直接平铺
curl http://localhost:21103/api/hazard-ticket

# 可派单的异常巡检项（结果为异常且名下没有未关闭整改单）
curl http://localhost:21103/api/hazard-ticket/dispatchable

# 主管派单：异常项 → 责任人 + 严重程度 + 截止日期，设备状态随之变为 ABNORMAL
curl -X POST http://localhost:21103/api/hazard-ticket/dispatch \
  -H 'Content-Type: application/json' -H 'x-role: SUPERVISOR' \
  -d '{"result_id": 7, "severity": "MEDIUM", "owner_id": 2, "deadline": "2026-10-05"}'

# 维保人员填写处理说明并提交复验（OPEN → SUBMITTED）
curl -X POST http://localhost:21103/api/hazard-ticket/4/submit \
  -H 'Content-Type: application/json' -H 'x-role: MAINTAINER' \
  -d '{"rectify_note": "灭火器已送检并更换压力表"}'

# 主管复验确认后关闭（SUBMITTED → CLOSED）；
# 设备名下最后一张未关闭整改单关闭时，设备台账状态自动回到 NORMAL
curl -X POST http://localhost:21103/api/hazard-ticket/4/close -H 'x-role: SUPERVISOR'

# 设备详情追溯整改过程（派单 → 提交复验 → 复验关闭全记录）
curl http://localhost:21103/api/fire-device/2/hazard-tickets
```

## 隐患整改业务规则

- 每个异常巡检项在未关闭前只保留一张整改单，重复派单返回 `HAZARD_TICKET_DUPLICATE_OPEN`。
- 整改单状态机：`OPEN`（待整改）→ `SUBMITTED`（待复验）→ `CLOSED`（已关闭），跨状态操作返回 `HAZARD_TICKET_BAD_STATE`。
- 派单时设备状态置为 `ABNORMAL`；设备名下最后一张未关闭整改单关闭时，设备状态回到 `NORMAL`。
- 列表排序：逾期未关闭单在最前，其余未关闭单按截止日期升序，已关闭单垫底。
- 每张整改单记录 `history`（派单/提交复验/复验关闭），设备详情页可追溯完整整改过程。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Redux Toolkit |
| 后端 | FastAPI + Python 3.11 + SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- RectifyStatus（OPEN/SUBMITTED/CLOSED）: 前端 `constants/RectifyStatus.ts`、`types/RectifyStatus.ts`、`constants/statusText.ts`、`utils/formatters.ts`、隐患页状态筛选与 `StatusBadge`；后端 `constants/rectify_status.py`、`services/hazard_ticket_service.py`、`constructors/hazard_ticket_factory.py`、`constants/log_templates.py`、`constants/errorMessages` 均有引用。
- DeviceStatus（NORMAL/ABNORMAL）: 前端 `constants/DeviceStatus.ts`、`types/DeviceStatus.ts`、`utils/formatters.ts`、设备页状态筛选；后端 `constants/device_status.py`、`services/hazard_ticket_service.py`（整改单联动设备状态）、`constructors/fire_device_factory.py` 均有引用。
- ResultStatus（NORMAL/ABNORMAL）: 前端 `constants/ResultStatus.ts`、`types/ResultStatus.ts`、`utils/formatters.ts`；后端 `constants/result_status.py`、`services/hazard_ticket_service.py`（仅异常项可派单）、`constructors/inspection_result_factory.py` 均有引用。
- Roles（SUPERVISOR/MAINTAINER/INSPECTOR/AUDITOR）: 前端 `constants/roles.ts`、`stores/SessionStore.ts`、`utils/http.ts`（`x-role` 请求头）、页面按钮显隐；后端 `constants/roles.py`、`middlewares/auth_middleware.py`、`middlewares/rbac_middleware.py`、`routes/hazard_ticket_routes.py` 均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
