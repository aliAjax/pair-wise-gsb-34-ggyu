from fastapi import FastAPI
from fastapi.responses import JSONResponse

from src.middlewares.auth_middleware import auth_middleware
from src.middlewares.audit_log_middleware import audit_log_middleware
from src.middlewares.error_handler_middleware import to_error_payload
from src.routes.building_routes import router as building_router
from src.routes.fire_device_routes import router as fire_device_router
from src.routes.inspection_task_routes import router as inspection_task_router
from src.routes.inspection_result_routes import router as inspection_result_router
from src.routes.hazard_ticket_routes import router as hazard_ticket_router
from src.routes.staff_routes import router as staff_router
from src.utils.exceptions import ServiceError

app = FastAPI(title="消防设施巡检维保平台")
app.middleware("http")(auth_middleware)
app.middleware("http")(audit_log_middleware)


@app.exception_handler(ServiceError)
async def service_error_handler(request, exc: ServiceError):
    return JSONResponse(status_code=400, content=to_error_payload(exc))


@app.get("/health")
def health():
    return {"status": "ok", "service": "fire-inspect"}


app.include_router(building_router)
app.include_router(fire_device_router)
app.include_router(inspection_task_router)
app.include_router(inspection_result_router)
app.include_router(hazard_ticket_router)
app.include_router(staff_router)
