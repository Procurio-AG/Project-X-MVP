from fastapi import FastAPI
from app.core import logging
from app.api.routes import matches
from app.services.live_snapshot_service import poll_and_store_live_matches

import asyncio
import logging

logging.basicConfig(level = logging.INFO)

app = FastAPI(title = "Stryker MVP API")

@app.get("/health")
def health():
    return {"status":"ok"}

app.include_router(matches.router)
@app.on_event("startup")
async def start_live_polling():
    async def poller():
        while True:
            try:
                await poll_and_store_live_matches()
            except Exception:
                pass
            await asyncio.sleep(15)  # poll interval

    asyncio.create_task(poller())


