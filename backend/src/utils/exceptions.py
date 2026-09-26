from src.constants.error_messages import ERROR_MESSAGES


class ServiceError(Exception):
    """业务异常：service 层抛出，controller 层包装为 HTTP 响应。"""

    def __init__(self, code: str, message: str | None = None):
        self.code = code
        super().__init__(message or ERROR_MESSAGES.get(code, code))
