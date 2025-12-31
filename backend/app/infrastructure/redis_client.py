import redis
import json
import os
from typing import List

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)


def set_json(key: str, value: dict, ttl: int=60):
    redis_client.set(key, json.dumps(value, default=str), ex=ttl)


def get_json(key: str) -> dict | None:
    data = redis_client.get(key)
    return json.loads(data) if data else None

def push_event(key: str, event: dict, ttl: int = 300):
    redis_client.lpush(key, json.dumps(event, default=str))
    redis_client.ltrim(key, 0, 49)
    redis_client.expire(key, ttl)

def get_events(key: str) -> List[dict]:
    raw_list = redis_client.lrange(key, 0, -1)
    return [json.loads(item) for item in raw_list]
