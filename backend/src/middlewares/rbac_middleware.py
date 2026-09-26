from fastapi import HTTPException, Request

from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES


def allow_roles(*roles):
    """RBAC 依赖：request.state.user 由 auth_middleware 注入。"""

    def checker(request: Request):
        user = getattr(request.state, "user", None)
        if user is None:
            raise HTTPException(
                status_code=401,
                detail={"code": ERROR_CODES["AUTH_REQUIRED"], "message": ERROR_MESSAGES["AUTH_REQUIRED"]},
            )
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=403,
                detail={"code": ERROR_CODES["RBAC_DENIED"], "message": ERROR_MESSAGES["RBAC_DENIED"]},
            )
        return user

    return checker
