from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class OptionBase(BaseModel):
    text: str
    is_correct: bool
    order: int


class OptionCreate(OptionBase):
    pass


class Option(OptionBase):
    id: int

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    text: str
    order: int


class QuestionCreate(QuestionBase):
    options: List[OptionCreate]


class Question(QuestionBase):
    id: int
    quiz_id: int
    options: List[Option] = []
    created_at: datetime

    class Config:
        from_attributes = True


class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None


class QuizCreate(QuizBase):
    questions: List[QuestionCreate]


class Quiz(QuizBase):
    id: int
    creator_id: int
    is_active: bool
    questions: List[Question] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuizSummary(QuizBase):
    id: int
    creator_id: int
    is_active: bool
    question_count: int
    created_at: datetime

    class Config:
        from_attributes = True
