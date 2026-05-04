from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError

from schemas.auth import SendCodeRequest, RegisterRequest, LoginRequest, AuthResponse
from core.auth import hash_password, verify_password, create_token, get_user_id
from core.email_service import send_verification_code, verify_code
from core.user_store import (
    find_user_by_account,
    find_user_by_email,
    find_user_by_username,
    find_user_by_id,
    create_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/send-code")
def send_code(body: SendCodeRequest):
    """Send verification code to email."""
    import re
    import os
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", body.email):
        raise HTTPException(status_code=400, detail="邮箱格式不正确")

    try:
        code = send_verification_code(body.email)
        result: dict = {"ok": True, "message": "验证码已发送"}
        # Dev mode: include code in response for easy testing
        if os.getenv("EMAIL_PROVIDER", "dev") == "dev":
            result["code"] = code
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    """Register with email + verification code + password."""
    # Validate
    try:
        RegisterRequest.model_validate(body.model_dump())
    except ValidationError as e:
        msg = e.errors()[0]["msg"]
        raise HTTPException(status_code=400, detail=msg)

    # Verify code
    if not verify_code(body.email, body.code):
        raise HTTPException(status_code=400, detail="验证码错误或已过期")

    # Check duplicate
    if find_user_by_email(body.email):
        raise HTTPException(status_code=400, detail="该邮箱已被注册")

    username = body.email.split("@")[0]
    if find_user_by_username(username):
        # Append random suffix to avoid conflict
        import random
        username = f"{username}{random.randint(100, 999)}"

    # Create user
    user = create_user(body.email, username, hash_password(body.password))
    token = create_token(user["id"], user["email"])

    return AuthResponse(
        token=token,
        user={"email": user["email"], "username": user["username"]},
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    """Login with email/username + password."""
    if not body.account or not body.password:
        raise HTTPException(status_code=400, detail="请输入账号和密码")

    user = find_user_by_account(body.account)
    if not user:
        raise HTTPException(status_code=400, detail="用户名/邮箱或密码错误")

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="用户名/邮箱或密码错误")

    token = create_token(user["id"], user["email"])

    return AuthResponse(
        token=token,
        user={"email": user["email"], "username": user["username"]},
    )


@router.get("/me")
def me(request: Request):
    """Get current user info from JWT token."""
    user_id = get_user_id(request)
    user = find_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {
        "ok": True,
        "user": {"email": user["email"], "username": user["username"]},
    }
