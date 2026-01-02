import uuid
from uuid import UUID as UUIDType
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import QuizInDB, QuizPublic, QuizSubmissionResult
from ..database import get_db
from .. import models

router = APIRouter()

# GET /quiz/{quiz_id}
@router.get("/quiz/{quiz_id}", response_model=QuizPublic)
async def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id
    ).all()

    return QuizInDB(
        id=db_quiz.id,
        title=db_quiz.title,
        questions=[
            {
                "id": str(q.id),
                "text": q.question_text,
                "options": [
                    {
                        "id": opt["id"],
                        "text": opt["text"]
                    }
                    for opt in (q.options or [])
                ]
            }
            for q in questions
        ]
    )


# Submit Quiz Answers
@router.post("/quiz/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, answers: dict, db: Session = Depends(get_db)):
    # Logic to submit quiz answers goes here
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    # Process answers and calculate score
    score = 0

    # Iterate through the answers and calculate the score
    for question_id, answer in answers.items():
        question = db.query(models.Question).filter(models.Question.id == question_id).first()
        if not question:
            continue
        if answer == question.correct_answer:
            score += 1

    # Save submission to database
    submission = models.Submission(
        id=uuid.uuid4(),
        quiz_id=quiz_id,
        score=score
    )
    db.add(submission)
    db.commit()

    result = QuizSubmissionResult(
        quiz_id=UUIDType(str(quiz_id)),
        total_score=score,
        max_score=len(answers),
        per_question=[],
    )
    return result