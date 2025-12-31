from fastapi import APIRouter
from app.infrastructure.redis_client import get_json, redis_client
from app.services.polling_service import get_raw_live_matches,get_raw_live_match
from app.services.normalizers.match_normalizer import normalize_live_match
from app.domain.models import LiveMatch

router = APIRouter(prefix="/api/v1/matches")


@router.get("/live")
async def get_live_matches():
    ids = redis_client.get("live:matches")
    if not ids:
        return {"data": []}

    result = []
    for match_id in ids.split(","):
        match = get_json(f"live:match:{match_id}")
        if match:
            result.append(match)

    return {"data": result}

@router.get("/live/raw")
async def raw_live_matches():
    return await get_raw_live_matches()

@router.get("/{match_id}/live", response_model=LiveMatch)
async def get_live_match(match_id: int):
    raw = await get_raw_live_match(match_id)
    return normalize_live_match(raw)

