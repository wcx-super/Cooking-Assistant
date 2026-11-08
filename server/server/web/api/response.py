"""统一响应格式。

参考 项目的响应规范:
- code: 业务状态码 (0=成功)
- msg: 提示信息
- data: 业务数据 (单个对象或列表)

出错时由 HTTPException 返回 HTTP 状态码，不走这里。
"""

from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式。"""

    code: int = 0
    msg: str = "success"
    data: Optional[T] = None

    @classmethod
    def success(
        cls,
        data: Optional[T] = None,
        msg: str = "success",
    ) -> "ApiResponse[T]":
        """
        成功响应。

        :param data: 响应数据
        :param msg: 响应消息
        :return: ApiResponse
        """
        return cls(code=0, msg=msg, data=data)


def success_response(
    data=None,
    msg: str = "success",
) -> dict:
    """
    快捷成功响应函数。

    :param data: 响应数据
    :param msg: 响应消息
    :return: 响应字典
    """
    return {"code": 0, "msg": msg, "data": data}


def list_response(
    data: Optional[List] = None,
    msg: str = "success",
) -> dict:
    """
    快捷列表响应函数 (空数据返回空数组)。

    :param data: 列表数据
    :param msg: 响应消息
    :return: 响应字典
    """
    return {"code": 0, "msg": msg, "data": data if data is not None else []}
