from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES


class BusinessError(Exception):
    def __init__(self, code: str, message: str | None = None):
        self.code = ERROR_CODES.get(code, code)
        super().__init__(message or ERROR_MESSAGES.get(code, "业务处理失败"))
