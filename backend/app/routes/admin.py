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
    # Logic to save quiz and questions to database goes here
    db_quiz = models.Quiz(id=quiz.id, title=quiz.title)
    db.add(db_quiz)

    for question in quiz.questions:
        db_question = models.Question(
            id=question.id,
            quiz_id=quiz.id,
            type="multiple_choice" if question.multiple_choice else "single_choice",
            question_text=question.text,
            options=[option.dict() for option in question.options],
            correct_ans=",".join(str(option.id) for option in question.options if option.is_correct)
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_quiz)

    return {"message": "Quiz created successfully", "quiz_id": quiz.id}
