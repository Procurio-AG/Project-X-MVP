# Project X - Live Cricket Platform (MVP)

## Project Overview

Project X MVP is a production-grade cricket match experience platform designed around a match-centric user journey. The system provides structured access to live and historical match data with a strong focus on performance, reliability, and extensibility. The architecture separates a modern React frontend from a FastAPI backend that ingests, normalizes, and serves cricket data from external providers.

---

## Tech Stack

**Frontend**

- Vite
    
- React
    
- TypeScript
    
- React Router
    
- TanStack React Query
    
- Tailwind CSS
    
- shadcn/ui
    

**Backend**

- FastAPI
    
- SQLAlchemy
    
- Alembic
    
- Redis
    

**Database and Infrastructure**

- PostgreSQL (Supabase)
    
- Redis (Upstash)
    
- Supabase Cron Jobs
    

**External Services**

- SportMonks Cricket API
    
- Resend (Email)
    

---

## Setup Instructions

### High-Level Setup Flow

1. Set up required external services (Supabase, Upstash, SportMonks).
    
2. Configure backend environment variables and run database migrations.
    
3. Start the FastAPI backend server.
    
4. Configure frontend environment variables and start the Vite dev server.
    

---

### Backend Setup

1. Create and activate a Python virtual environment.
    
2. Install dependencies:
    
    ```
    pip install -r requirements.txt
    ```
    
3. Create a `.env` file in `backend/` and populate it using the environment variables listed below.
    

#### How to obtain backend environment variables

- **DATABASE_URL**
    
    - Create a Supabase project.
        
    - Use the provided PostgreSQL connection string.
        
    - Can be replaced with a local Postgres URL if needed.
        
- **REDIS_URL**
    
    - Create a Redis instance on Upstash.
        
    - Use the provided connection URL.
        
- **EXTERNAL_API_KEY**
    
    - Obtain an API key from SportMonks.
        
- **EXTERNAL_API_BASE_URL**
    
    - Use the SportMonks REST API base URL.
        
- **Optional keys**
    
    - Resend for transactional email.
        
    - Social platform keys if related features are enabled.
        

4. Run database migrations:
    
    ```
    alembic upgrade head
    ```
    
5. Start the backend server:
    
    ```
    uvicorn app.main:app --reload
    ```
    

The backend will be available at `http://localhost:8000`.

---

### Frontend Setup

1. Install dependencies:
    
    ```
    npm install
    ```
    
2. Create a `.env` file in `frontend/`:
    
    ```
    VITE_API_BASE_URL=http://localhost:8000
    ```
    
3. Start the development server:
    
    ```
    npm run dev
    ```
    

---

## Environment Variables

### Backend

- `DATABASE_URL`  
    PostgreSQL connection string (Supabase or local Postgres).
    
- `REDIS_URL`  
    Redis connection URL (Upstash).
    
- `EXTERNAL_API_KEY`  
    API key for SportMonks.
    
- `EXTERNAL_API_BASE_URL`  
    Base URL for the SportMonks REST API.
    
- `CORS_ORIGINS`  
    Allowed frontend origins.
    
- `RESEND_API_KEY`  
    API key for transactional emails.
    
- `CRON_SECRET`  
    Secret for securing scheduled or internal cron-triggered tasks.
    
- `RAPID_API_KEY`  
    Optional key for additional integrations.
    
- `TWITTER_HOST`  
    Social provider configuration.
    
- `YOUTUBE_API_KEY`  
    API key for YouTube integrations.
    

### Frontend

- `VITE_API_BASE_URL`  
    Backend API base URL.  
    Defaults to `http://localhost:8000` if not set.
    

---

## Known Limitations

- **External Data Provider Abstraction**  
    The system is currently integrated with SportMonks. Provider-specific logic is isolated in normalizer services, so switching providers requires changes only in the normalization layer.
    
- **Polling-Based Data Freshness**  
    Live and historical match data is refreshed using polling. This is sufficient for the current MVP and demo use cases but can be upgraded to webhook-based ingestion in the future.
    
- **Redis-Centric Caching Strategy**  
    Redis mitigates external API rate limits and enables high-speed, large-scale reads with near-zero latency for frontend consumption.
    
- **Database Hygiene via Cron Jobs**  
    Supabase cron jobs are required to clean up old match and news data to prevent database bloat. These jobs must be recreated when setting up a new Supabase project.
    
- **Observability and Testing**  
    Automated test coverage and production-grade monitoring are limited and should be expanded as the system scales.
    

---

## Next Steps and Future Work

- **Live Commentary and Chat**  
    Replace mocked data with real-time or near-real-time feeds using WebSockets or streaming-based delivery, with moderation and persistence support.
    
- **Predictions**  
    Replace frontend-only mock predictions with an external data source or internal heuristic model. Persist predictions and outcomes while maintaining clear Beta labeling.
    
- **Data Ingestion Improvements**  
    Introduce webhook-based ingestion where supported to reduce reliance on polling and external API calls during peak traffic.
    
- **Scalability and Reliability**  
    Separate ingestion into background workers, add structured logging and monitoring, and expand automated test coverage.
    
