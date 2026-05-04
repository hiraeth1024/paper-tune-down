import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# In-memory store: email → (code, expiry_timestamp)
_codes: dict[str, tuple[str, float]] = {}

CODE_EXPIRE_SECONDS = 300  # 5 minutes


def generate_code() -> str:
    return f"{random.randint(100000, 999999)}"


def store_code(email: str, code: str):
    import time
    _codes[email] = (code, time.time() + CODE_EXPIRE_SECONDS)


def verify_code(email: str, code: str) -> bool:
    import time
    entry = _codes.get(email)
    if not entry:
        return False
    stored_code, expiry = entry
    if time.time() > expiry:
        del _codes[email]
        return False
    if stored_code != code:
        return False
    del _codes[email]
    return True


def send_verification_code(email: str) -> str:
    """
    Send verification code to email.
    Returns the code (for dev logging) or raises on failure.
    """
    code = generate_code()
    store_code(email, code)

    provider = os.getenv("EMAIL_PROVIDER", "dev")

    if provider == "resend":
        _send_via_resend(email, code)
    elif provider == "smtp":
        _send_via_smtp(email, code)
    else:
        # Dev mode: print to console
        print(f"\n{'='*60}")
        print(f"[DEV] 验证码发送至 {email}: {code}")
        print(f"{'='*60}\n")

    return code


def _send_via_resend(email: str, code: str):
    import requests

    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY 未配置")

    resp = requests.post(
        "https://api.resend.com/emails",
        json={
            "from": os.getenv("RESEND_FROM", "PaperTune <noreply@papertune.cn>"),
            "to": [email],
            "subject": "PaperTune 验证码",
            "html": f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
                <h2 style="color:#1E3A5F">PaperTune 验证码</h2>
                <p style="font-size:16px;color:#334155">您的验证码是：</p>
                <div style="font-size:32px;font-weight:bold;color:#059669;letter-spacing:8px;padding:16px 0">{code}</div>
                <p style="font-size:14px;color:#94A3B8">验证码 5 分钟内有效，请勿泄露给他人。</p>
            </div>
            """,
        },
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        timeout=10,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Resend 发送失败: {resp.text}")


def _send_via_smtp(email: str, code: str):
    host = os.getenv("SMTP_HOST", "")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASSWORD", "")
    from_addr = os.getenv("SMTP_FROM", user)

    if not host or not user or not password:
        raise RuntimeError("SMTP 配置不完整")

    msg = MIMEMultipart()
    msg["From"] = from_addr
    msg["To"] = email
    msg["Subject"] = "PaperTune 验证码"

    body = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1E3A5F">PaperTune 验证码</h2>
        <p style="font-size:16px;color:#334155">您的验证码是：</p>
        <div style="font-size:32px;font-weight:bold;color:#059669;letter-spacing:8px;padding:16px 0">{code}</div>
        <p style="font-size:14px;color:#94A3B8">验证码 5 分钟内有效，请勿泄露给他人。</p>
    </div>
    """
    msg.attach(MIMEText(body, "html", "utf-8"))

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.sendmail(from_addr, [email], msg.as_string())
