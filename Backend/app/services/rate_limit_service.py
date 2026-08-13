from datetime import datetime, timezone

from fastapi import HTTPException, Request

from app.database.connection import db


def _naive_utc(value: datetime) -> datetime:
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


async def enforce_rate_limit(key: str, max_requests: int, window_seconds: int):
    """Fixed-window rate limiter backed by MongoDB.

    Vercel serverless functions don't share in-memory state between invocations,
    so an in-process limiter (e.g. a dict) would silently do nothing in production —
    this stores the window/count in Mongo instead, which every invocation shares.
    """
    now = datetime.now(timezone.utc)
    doc = await db["rate_limits"].find_one({"key": key})

    if doc is None or (now - _naive_utc(doc["window_start"]).replace(tzinfo=timezone.utc)).total_seconds() > window_seconds:
        await db["rate_limits"].update_one(
            {"key": key},
            {"$set": {"window_start": now, "count": 1}},
            upsert=True,
        )
        return

    if doc["count"] >= max_requests:
        retry_after = window_seconds - int((now - _naive_utc(doc["window_start"]).replace(tzinfo=timezone.utc)).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please try again in {max(retry_after, 1)} seconds.",
        )

    await db["rate_limits"].update_one({"key": key}, {"$inc": {"count": 1}})


def ip_rate_limit(prefix: str, max_requests: int, window_seconds: int):
    """Dependency factory for unauthenticated routes — keys by client IP."""
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        await enforce_rate_limit(f"{prefix}:{client_ip}", max_requests, window_seconds)

    return dependency


async def ensure_indexes():
    await db["rate_limits"].create_index("key", unique=True)
