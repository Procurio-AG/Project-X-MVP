from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import logging
from app.api.routes import matches, schedules, waitlist, engagement, news
from app.services.live_snapshot_service import poll_and_store_live_matches
from app.infrastructure.db import SessionLocal
from app.services.schedule_service import sync_schedules_to_db
from app.services.engagement_service import fetch_and_store_engagement
from app.services.news_service import fetch_and_store_news
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
app.include_router(engagement.router)
app.include_router(news.router)

@app.on_event("startup")
async def startup_event():
    #Live Poller (Background)
    async def start_live_polling():
        while True:
            try:
                await poll_and_store_live_matches()
            except Exception as e:
                logger.error(f"Live polling error: {e}")
            await asyncio.sleep(30)

    #Twitter Poller (every 90 mins)
    async def start_twitter_polling():
        while True:
            try:
                logger.info("Scheduled Task: Fetching Tweets...")
                with SessionLocal() as db:
                    await fetch_and_store_engagement(db, "twitter")
            except Exception as e:
                logger.error(f"Twitter polling error: {e}")
            await asyncio.sleep(5400) # 90 minutes * 60s
    
    #YouTube Poller (Every 20 mins)
    async def start_youtube_polling():
        while True:
            try:
                logger.info("Scheduled Task: Fetching Videos...")
                with SessionLocal() as db:
                    await fetch_and_store_engagement(db, "youtube")
            except Exception as e:
                logger.error(f"YouTube polling error: {e}")
            await asyncio.sleep(1200) # 20 minutes * 60s

    #Schedule Sync (Background - NON-BLOCKING)
    async def run_initial_sync():
        logger.info("Starting background schedule sync...")
        db = SessionLocal()
        try:
            await sync_schedules_to_db(db)
            logger.info("Schedule sync completed successfully.")
        except Exception as e:
            logger.error(f"Startup schedule sync failed: {e}")
        finally:
            db.close()

    #News Polling(every 4 hours)
    async def start_news_polling():
        while True:
            try:
                logger.info("Scheduled Task: Fetching News...")
                with SessionLocal() as db:
                    await fetch_and_store_news(db)
            except Exception as e:
                logger.error(f"News polling error: {e}")
            
            # Sleep for 4 hours (14400 seconds)
            await asyncio.sleep(14400)

    #We use create_task so startup finishes immediately
    asyncio.create_task(start_live_polling())
    asyncio.create_task(start_twitter_polling()) 
    asyncio.create_task(start_youtube_polling())
    asyncio.create_task(start_news_polling())
    asyncio.create_task(run_initial_sync())
    
    logger.info("Server startup complete. Background tasks initiated.")





