import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import QuestionResult, QuizInDB, QuizPublic, QuizSubmission, QuizSubmissionResult
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

    return QuizPublic(
        id=db_quiz.id,
        title=db_quiz.title,
        questions=[
            {
                "id": str(q.id),
                "text": q.question_text,
                "type": q.type,
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
@router.post("/quiz/{quiz_id}/submit", response_model=QuizSubmissionResult)
async def submit_quiz(
    quiz_id: UUID,
    submission: QuizSubmission,
    db: Session = Depends(get_db),
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    score = 0
    per_question = []

    for answer in submission.answers:
        question = (
            db.query(models.Question)
            .filter(models.Question.id == answer.question_id)
            .first()
        )
        if not question:
            continue

        correct_option_id = UUID(question.correct_ans)

        is_correct = correct_option_id in answer.selected_option_ids

        if is_correct:
            score += 1

        per_question.append(
            QuestionResult(
                question_id=answer.question_id,
                correct=is_correct,
                correct_option_ids=[correct_option_id],
            )
        )

    db_submission = models.Submission(
        quiz_id=quiz_id,
        answers=[a.dict() for a in submission.answers],
        score=score,
    )

    db.add(db_submission)
    db.commit()

    return QuizSubmissionResult(
        quiz_id=quiz_id,
        total_score=score,
        max_score=len(submission.answers),
        per_question=per_question,
    )
