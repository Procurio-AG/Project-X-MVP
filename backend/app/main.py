from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import logging
from app.api.routes import matches, schedules, waitlist
from app.services.live_snapshot_service import poll_and_store_live_matches
from app.infrastructure.db import SessionLocal
from app.services.schedule_service import sync_schedules_to_db
import os
import asyncio
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level = logging.INFO)
origins = os.getenv("CORS_ORIGINS","").split(',')

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
    # --- Task 1: Live Poller (Background) ---
    async def start_live_polling():
        while True:
            try:
                await poll_and_store_live_matches()
            except Exception as e:
                logger.error(f"Live polling error: {e}")
            await asyncio.sleep(30)
    
    # Fire and forget the poller
    asyncio.create_task(start_live_polling())
    
    # --- Task 2: Schedule Sync (Background - NON-BLOCKING) ---
    async def run_initial_sync():
        logger.info("Starting background schedule sync...")
        db = SessionLocal()
        try:
            # If this fails (timeout), it triggers the except block
            # NOT a server crash
            await sync_schedules_to_db(db)
            logger.info("Schedule sync completed successfully.")
        except Exception as e:
            logger.error(f"Startup schedule sync failed: {e}")
        finally:
            db.close()

    # Crucial Change: We use create_task so startup finishes immediately
    asyncio.create_task(run_initial_sync())
    
    logger.info("Server startup complete. Background tasks initiated.")





