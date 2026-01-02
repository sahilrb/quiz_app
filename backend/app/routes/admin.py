# POST /admin/quiz
# Validate x-admin-key header
# Save quiz + questions to database

import os
from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from ..schemas import QuizInDB
from ..database import get_db
from .. import models

# admin check
def admin_auth(x_admin_key: str = Header(...)):
    ADMIN_KEY = os.getenv("ADMIN_KEY", "default_admin_key")
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
# create Quiz api
router = APIRouter()

@router.post("/quiz", dependencies=[Depends(admin_auth)])
async def create_quiz(quiz: QuizInDB, db: Session = Depends(get_db)):
    # Logic to save quiz to database goes here
    db_quiz = models.Quiz(id=quiz.id, title=quiz.title)
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    return {"message": "Quiz created successfully", "quiz_id": quiz.id}
