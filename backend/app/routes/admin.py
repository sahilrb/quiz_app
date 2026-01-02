import uuid
import os
from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from ..schemas import QuizCreate
from ..database import get_db
from .. import models

router = APIRouter()

def admin_auth(x_admin_key: str = Header(...)):
    ADMIN_KEY = os.getenv("ADMIN_KEY", "default_admin_key")
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.post("/quiz", dependencies=[Depends(admin_auth)])
async def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    quiz_id = uuid.uuid4()

    db_quiz = models.Quiz(
        id=quiz_id,
        title=quiz.title
    )
    db.add(db_quiz)

    for q in quiz.questions:
        question_id = uuid.uuid4()

        options = []
        correct_answer = None

        for opt in q.options:
            opt_id = str(uuid.uuid4()) 
            options.append({
                "id": opt_id,        
                "text": opt.text,
                "is_correct": opt.is_correct
            })
            if opt.is_correct:
                correct_answer = opt_id

        db_question = models.Question(
            id=question_id,
            quiz_id=quiz_id,
            type=q.type,
            question_text=q.text,
            options=options,          
            correct_ans=correct_answer 
        )
        db.add(db_question)

    db.commit()

    return {
        "message": "Quiz created successfully",
        "quiz_id": str(quiz_id)
    }
