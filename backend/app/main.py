from fastapi import FastAPI
from app.core import logging
from app.api.routes import matches, schedules
from app.api.routes import waitlist
from app.services.live_snapshot_service import poll_and_store_live_matches
from app.infrastructure.db import SessionLocal
from app.services.schedule_service import sync_schedules_to_db
import os
import asyncio
import logging

logging.basicConfig(level = logging.INFO)
origins = os.getenv("CORS_ORIGINS","").split(',')

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title = "Stryker MVP API",
    redirect_slashes=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status":"ok"}

app.include_router(matches.router)
app.include_router(schedules.router)
app.include_router(waitlist.router)

@app.on_event("startup")
async def startup_event():
    async def start_live_polling():
        async def poller():
            while True:
                try:
                    await poll_and_store_live_matches()
                except Exception:
                    pass
                await asyncio.sleep(30)
        asyncio.create_task(poller())
    asyncio.create_task(start_live_polling())
    
    db = SessionLocal()
    try:
        await sync_schedules_to_db(db)
    finally:
        db.close()





