from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr

from app.infrastructure.db import get_db
from app.models.sql_signup import EmailSignup

router = APIRouter(prefix="/api/v1/waitlist", tags=["waitlist"])

#Pydantic Model (Validation)
class WaitlistRequest(BaseModel):
    email: EmailStr  #Automagically validates "user@domain.com" format

#The Endpoint
@router.post("/", status_code=status.HTTP_201_CREATED)
def join_waitlist(payload: WaitlistRequest, db: Session = Depends(get_db)):
    """
    Adds a user to the email waitlist.
    Returns 409 if email already exists.
    """
    try:
        new_signup = EmailSignup(email=payload.email)
        db.add(new_signup)
        db.commit()
        db.refresh(new_signup)
        return {"message": "Welcome to the club!", "id": new_signup.id}

    except IntegrityError:
        db.rollback()
        #409 Conflict is the standard code for "Resource already exists"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already on the waitlist."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))