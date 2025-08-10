from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class SessionStatus(enum.Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    FINISHED = "finished"


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_code = Column(String(10), unique=True, index=True, nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.WAITING)
    current_question_index = Column(Integer, default=0)
    question_time_limit = Column(Integer, default=30)  # seconds per question
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    current_question_started_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    quiz = relationship("Quiz", back_populates="game_sessions")
    host = relationship("User", back_populates="game_sessions")
    player_answers = relationship("PlayerAnswer", back_populates="session")
    participants = relationship("SessionParticipant", back_populates="session")


class SessionParticipant(Base):
    __tablename__ = "session_participants"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    session = relationship("GameSession", back_populates="participants")
    user = relationship("User", back_populates="session_participations")


class PlayerAnswer(Base):
    __tablename__ = "player_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    answer_time = Column(Integer, nullable=True)  # time taken in seconds
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("GameSession", back_populates="player_answers")
    player = relationship("User", back_populates="player_answers")
    question = relationship("Question", back_populates="player_answers")
    selected_option = relationship("Option", back_populates="player_answers")
