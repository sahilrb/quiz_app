import uuid
from uuid import UUID as UUIDType
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import QuizInDB, QuizSubmissionResult
from ..database import get_db
from .. import models

router = APIRouter()

# GET /quiz/{quiz_id}
@router.get("/quiz/{quiz_id}", response_model=QuizInDB)
async def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Fetch questions for the quiz
    questions = db.query(models.Question).filter(models.Question.quiz_id == quiz_id).all()
    db_quiz.questions = questions

    # Convert db_quiz to QuizInDB schema
    quiz_data = QuizInDB(
        id=quiz_id,
        title=db_quiz.title,
        questions=[
            {
                "id": str(question.id),
                "text": question.text,
                "options": [
                    {
                        "id": str(option.id),
                        "text": option.text,
                        "is_correct": option.is_correct
                    }
                    for option in db.query(models.Option).filter(models.Option.question_id == question.id).all()
                ]
            }
            for question in questions
        ],
    )
    return quiz_data

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