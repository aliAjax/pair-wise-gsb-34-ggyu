from src.seed import seed


async def auth_middleware(request, call_next):
    """从 x-role 请求头解析当前用户，注入 request.state.user。"""
    role = request.headers.get("x-role", "AUDITOR")
    user = next((row for row in seed["staff"] if row["role"] == role), None)
    request.state.user = user or {"id": 0, "name": "匿名", "role": role}
    return await call_next(request)
