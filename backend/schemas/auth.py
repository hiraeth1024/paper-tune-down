from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class SendCodeRequest(BaseModel):
    email: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    code: str

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", v):
            raise ValueError("邮箱格式不正确")
        return v

    @field_validator("password")
    @classmethod
    def valid_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("密码至少 8 位")
        if not re.search(r"[a-zA-Z]", v) or not re.search(r"\d", v):
            raise ValueError("密码需包含字母和数字")
        return v

    @field_validator("code")
    @classmethod
    def valid_code(cls, v: str) -> str:
        if not re.match(r"^\d{6}$", v):
            raise ValueError("验证码为 6 位数字")
        return v


class LoginRequest(BaseModel):
    account: str  # email or username
    password: str


class AuthResponse(BaseModel):
    ok: bool = True
    token: str
    user: dict
    error: str | None = None
