from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, root_validator, validator

class OptionCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)


class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    options: List[OptionCreate] = Field(..., min_items=2, max_items=50)
    multiple_choice: bool = Field(False, description="True if multiple options can be selected")
    points: int = Field(1, ge=0)

    @validator("options")
    def unique_option_texts(cls, v):
        texts = [o.text.strip() for o in v]
        if len(set(texts)) != len(texts):
            raise ValueError("option texts must be unique within a question")
        return v


class QuizCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    questions: List[QuestionCreate] = Field(..., min_items=1)
    published: bool = Field(False)

    @root_validator(skip_on_failure=True)
    def validate_questions_points(cls, values):
        questions = values.get("questions") or []
        if not questions:
            raise ValueError("quiz must contain at least one question")
        return values


# Public-facing schemas (do NOT include correct answers)
class OptionPublic(BaseModel):
    id: UUID
    text: str = Field(..., min_length=1, max_length=500)


class QuestionPublic(BaseModel):
    id: UUID
    text: str = Field(..., min_length=1, max_length=1000)
    options: List[OptionPublic] = Field(..., min_items=2)
    multiple_choice: bool = Field(False)
    points: int = Field(1, ge=0)


class QuizPublic(BaseModel):
    id: UUID
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    questions: List[QuestionPublic] = Field(..., min_items=1)

    @property
    def total_points(self) -> int:
        return sum(q.points for q in self.questions)


# Internal schema used when creating/storing question options including correct flags
class OptionInDB(BaseModel):
    id: UUID
    text: str = Field(..., min_length=1, max_length=500)
    is_correct: bool = Field(False)


class QuestionInDB(BaseModel):
    id: UUID
    text: str = Field(..., min_length=1, max_length=1000)
    options: List[OptionInDB] = Field(..., min_items=2)
    multiple_choice: bool = Field(False)
    points: int = Field(1, ge=0)

    @validator("options")
    def ensure_at_least_one_correct_for_question(cls, v, values):
        # For multiple_choice allow >=1 correct; for single choice require exactly 1 correct
        multiple = values.get("multiple_choice", False)
        correct_count = sum(1 for o in v if o.is_correct)
        if multiple:
            if correct_count < 1:
                raise ValueError("multiple choice question must have at least one correct option")
        else:
            if correct_count != 1:
                raise ValueError("single-choice question must have exactly one correct option")
        return v


class QuizInDB(BaseModel):
    id: UUID
    title: str
    questions: List[QuestionInDB]
    published: bool = Field(False)


# Submission schemas
class AnswerSubmission(BaseModel):
    question_id: UUID
    selected_option_ids: List[UUID] = Field(..., min_items=1)

    @validator("selected_option_ids")
    def unique_selected_options(cls, v):
        if len(set(v)) != len(v):
            raise ValueError("selected_option_ids must be unique")
        return v


class QuizSubmission(BaseModel):
    quiz_id: UUID
    answers: List[AnswerSubmission] = Field(..., min_items=1)

    @validator("answers")
    def unique_questions(cls, v):
        qids = [a.question_id for a in v]
        if len(set(qids)) != len(qids):
            raise ValueError("each question may be answered only once in a submission")
        return v


# Result / feedback schemas
class QuestionResult(BaseModel):
    question_id: UUID
    correct: bool
    earned_points: int = Field(ge=0)
    max_points: int = Field(ge=0)
    correct_option_ids: Optional[List[UUID]] = None


class QuizSubmissionResult(BaseModel):
    quiz_id: UUID
    total_score: int = Field(ge=0)
    max_score: int = Field(ge=0)
    per_question: List[QuestionResult] = Field(...)