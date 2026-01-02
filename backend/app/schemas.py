from typing import List, Optional, Literal
from uuid import UUID
from pydantic import (
    BaseModel,
    Field,
    validator,
    model_validator,
)


class OptionCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    is_correct: bool


class QuestionCreate(BaseModel):
    type: Literal["single_choice", "text"]
    text: str = Field(..., min_length=1, max_length=1000)
    options: List[OptionCreate] = Field(..., min_items=2, max_items=50)
    multiple_choice: bool = False
    points: int = Field(1, ge=0)

    @validator("options")
    def unique_option_texts(cls, options):
        texts = [o.text.strip() for o in options]
        if len(set(texts)) != len(texts):
            raise ValueError("option texts must be unique within a question")
        return options

    @model_validator(mode="after")
    def validate_correct_options(self):
        correct_count = sum(1 for o in self.options if o.is_correct)

        if self.multiple_choice:
            if correct_count < 1:
                raise ValueError(
                    "multiple choice question must have at least one correct option"
                )
        else:
            if correct_count != 1:
                raise ValueError(
                    "single-choice question must have exactly one correct option"
                )

        return self


class QuizCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    questions: List[QuestionCreate] = Field(..., min_items=1)
    published: bool = False

    @model_validator(mode="after")
    def validate_questions_exist(self):
        if not self.questions:
            raise ValueError("quiz must contain at least one question")
        return self




class OptionPublic(BaseModel):
    id: UUID
    text: str


class QuestionPublic(BaseModel):
    id: UUID
    text: str
    options: List[OptionPublic]
    multiple_choice: bool = False
    points: int = 1


class QuizPublic(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    questions: List[QuestionPublic]

    @property
    def total_points(self) -> int:
        return sum(q.points for q in self.questions)



class OptionInDB(BaseModel):
    id: UUID
    text: str
    is_correct: bool


class QuestionInDB(BaseModel):
    id: UUID
    text: str
    options: List[OptionInDB]
    multiple_choice: bool = False
    points: int = 1


class QuizInDB(BaseModel):
    id: UUID
    title: str
    questions: List[QuestionInDB]
    published: bool = False




class AnswerSubmission(BaseModel):
    question_id: UUID
    selected_option_ids: List[UUID] = Field(..., min_items=1)

    @validator("selected_option_ids")
    def unique_selected_options(cls, values):
        if len(set(values)) != len(values):
            raise ValueError("selected_option_ids must be unique")
        return values


class QuizSubmission(BaseModel):
    quiz_id: UUID
    answers: List[AnswerSubmission] = Field(..., min_items=1)

    @validator("answers")
    def unique_questions(cls, answers):
        qids = [a.question_id for a in answers]
        if len(set(qids)) != len(qids):
            raise ValueError("each question may be answered only once")
        return answers




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
    per_question: List[QuestionResult]
