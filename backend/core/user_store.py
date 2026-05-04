"""
User storage abstraction. Uses Supabase when configured, otherwise in-memory (dev mode).
"""
import os
from typing import TypedDict


class UserRecord(TypedDict):
    id: str
    email: str
    username: str
    password_hash: str


# In-memory fallback store
_memory_users: dict[str, UserRecord] = {}
# Pre-seed mock admin account
import uuid
from core.auth import hash_password

_admin_id = str(uuid.uuid4())
_memory_users[_admin_id] = {
    "id": _admin_id,
    "email": "admin@test.com",
    "username": "admin",
    "password_hash": hash_password("admin123"),
}

SUPABASE_AVAILABLE = False


def _get_supabase():
    try:
        from core.supabase import get_supabase
        client = get_supabase()
        # Test if Supabase is actually configured (not placeholder)
        if os.getenv("SUPABASE_URL", ""):
            return client
    except Exception:
        pass
    return None


def find_user_by_email(email: str) -> UserRecord | None:
    supabase = _get_supabase()
    if supabase:
        result = supabase.table("users").select("*").eq("email", email).execute()
        if result.data:
            return result.data[0]
        return None
    # In-memory fallback
    for u in _memory_users.values():
        if u["email"] == email:
            return u
    return None


def find_user_by_username(username: str) -> UserRecord | None:
    supabase = _get_supabase()
    if supabase:
        result = supabase.table("users").select("*").eq("username", username).execute()
        if result.data:
            return result.data[0]
        return None
    # In-memory fallback
    for u in _memory_users.values():
        if u["username"] == username:
            return u
    return None


def find_user_by_account(account: str) -> UserRecord | None:
    """Find user by email or username."""
    return find_user_by_email(account) or find_user_by_username(account)


def create_user(email: str, username: str, password_hash: str) -> UserRecord:
    supabase = _get_supabase()
    if supabase:
        result = supabase.table("users").insert({
            "email": email,
            "username": username,
            "password_hash": password_hash,
        }).execute()
        return result.data[0]

    # In-memory fallback
    user_id = str(uuid.uuid4())
    record: UserRecord = {
        "id": user_id,
        "email": email,
        "username": username,
        "password_hash": password_hash,
    }
    _memory_users[user_id] = record
    return record


def find_user_by_id(user_id: str) -> UserRecord | None:
    supabase = _get_supabase()
    if supabase:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if result.data:
            return result.data[0]
        return None
    return _memory_users.get(user_id)


def seed_admin():
    """Ensure admin account exists in the active store (memory or Supabase)."""
    supabase = _get_supabase()
    if supabase:
        # Upsert: insert if not exists, update password hash if exists
        result = supabase.table("users").upsert({
            "email": "admin@test.com",
            "username": "admin",
            "password_hash": hash_password("admin123"),
        }, on_conflict="username").execute()
        if result.data:
            print(f"[DB] Admin account ready (id={result.data[0].get('id', '?')})")


# Supabase users table migration SQL:
"""
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
"""
