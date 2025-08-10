from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.session import SessionStatus


class GameSessionCreate(BaseModel):
    quiz_id: int
    question_time_limit: Optional[int] = 30  # seconds per question


class GameSessionJoin(BaseModel):
    game_code: str


class PlayerAnswerCreate(BaseModel):
    question_id: int
    selected_option_id: int
    answer_time: Optional[float] = None  # time taken to answer in seconds


class PlayerAnswer(BaseModel):
    id: int
    session_id: int
    player_id: int
    question_id: int
    selected_option_id: int
    is_correct: bool
    answered_at: datetime

    class Config:
        from_attributes = True


class SessionParticipant(BaseModel):
    id: int
    session_id: int
    user_id: int
    username: str
    joined_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class GameSession(BaseModel):
    id: int
    quiz_id: int
    host_id: int
    game_code: str
    status: SessionStatus
    current_question_index: int
    question_time_limit: int
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    current_question_started_at: Optional[datetime] = None
    participants: List[SessionParticipant] = []

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    player_id: int
    username: str
    score: int
    correct_answers: int
    total_answers: int
    average_time: Optional[float] = None  # average answer time in seconds


class Leaderboard(BaseModel):
    session_id: int
    entries: List[LeaderboardEntry]
