from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
import uuid
from .database import Base

# - Quiz: id, title, create_at
# - Question : id, quiz_id, type, question_tex, options, correct_ans
# - Submission: id, quiz_id, answers, score, create_at

class Quiz(Base):
    # id, title, create_at
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(String, server_default=func.now(), nullable=False)

class Question(Base):
    # id, quiz_id, type, question_text, options, correct_ans
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    quiz_id = Column(UUID(as_uuid=True), nullable=False)
    type = Column(String, nullable=False)  # e.g., 'multiple_choice', 'true_false'
    question_text = Column(String, nullable=False)
    options = Column(JSON, nullable=True)  # Store options as JSON
    correct_ans = Column(String, nullable=False)

class Submission(Base):
    # id, quiz_id, answers, score, create_at
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    quiz_id = Column(UUID(as_uuid=True), nullable=False)
    answers = Column(JSON, nullable=False)  # Store answers as JSON
    score = Column(Integer, nullable=False)
    created_at = Column(String, server_default=func.now(), nullable=False)