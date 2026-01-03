from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr

from app.infrastructure.db import get_db
from app.models.sql_signup import EmailSignup
from app.services.email_service import send_welcome_email

router = APIRouter(prefix="/api/v1/waitlist", tags=["waitlist"])

class WaitlistRequest(BaseModel):
    name: str 
    email: EmailStr

@router.post("/", status_code=status.HTTP_201_CREATED)
def join_waitlist(
    payload: WaitlistRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    try:
        new_signup = EmailSignup(name=payload.name, email=payload.email)
        db.add(new_signup)
        db.commit()
        db.refresh(new_signup)
        # Triggers email in background
        background_tasks.add_task(send_welcome_email, payload.name, payload.email)
        return {"message": "Welcome to the club!", "id": new_signup.id}

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, 
            detail="Email already registered."
            )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))