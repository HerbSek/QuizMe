import random
import string
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, Question, Option
from app.models.session import GameSession, PlayerAnswer, SessionStatus
from app.schemas.session import (
    GameSessionCreate,
    GameSessionJoin,
    PlayerAnswerCreate,
    GameSession as GameSessionSchema,
    Leaderboard,
    LeaderboardEntry
)
from app.auth.auth import get_current_user

router = APIRouter()


def generate_game_code() -> str:
    """Generate a unique 6-character game code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.post("/start/{quiz_id}", response_model=GameSessionSchema)
async def start_game_session(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new game session for a quiz."""
    # Check if quiz exists and belongs to user
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.creator_id == current_user.id,
        Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Generate unique game code
    game_code = generate_game_code()
    while db.query(GameSession).filter(GameSession.game_code == game_code).first():
        game_code = generate_game_code()
    
    # Create game session
    db_session = GameSession(
        quiz_id=quiz_id,
        host_id=current_user.id,
        game_code=game_code,
        status=SessionStatus.WAITING
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return db_session


@router.post("/join", response_model=GameSessionSchema)
async def join_game_session(
    join_data: GameSessionJoin,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a game session using game code."""
    session = db.query(GameSession).filter(
        GameSession.game_code == join_data.game_code,
        GameSession.status.in_([SessionStatus.WAITING, SessionStatus.ACTIVE])
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found or already finished"
        )
    
    # Optionally, you could track when users join by creating a join record
    # For now, we just return the session info

    return session


@router.post("/{session_id}/start", response_model=GameSessionSchema)
async def start_game_session_by_id(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a game session (change status from WAITING to ACTIVE). Only host can do this."""
    session = db.query(GameSession).filter(GameSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found"
        )

    # Check if current user is the host
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can start the session"
        )

    # Check if session is in waiting status
    if session.status != SessionStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not in waiting status"
        )

    # Update session status to active
    session.status = SessionStatus.ACTIVE
    session.started_at = func.now()

    db.commit()
    db.refresh(session)

    return session


@router.get("/{session_id}", response_model=GameSessionSchema)
async def get_game_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific game session by ID."""
    session = db.query(GameSession).filter(GameSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found"
        )

    return session


@router.post("/{session_id}/end", response_model=GameSessionSchema)
async def end_game_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End a game session (only host can do this)."""
    session = db.query(GameSession).filter(GameSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found"
        )

    # Check if current user is the host
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can end the session"
        )

    # Update session status to finished
    session.status = SessionStatus.FINISHED
    session.finished_at = func.now()

    db.commit()
    db.refresh(session)

    return session


@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: int,
    answer_data: PlayerAnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an answer for a question in a game session."""
    # Check if session exists and is active
    session = db.query(GameSession).filter(
        GameSession.id == session_id,
        GameSession.status == SessionStatus.ACTIVE
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found or not active"
        )
    
    # Check if question belongs to the quiz
    question = db.query(Question).filter(
        Question.id == answer_data.question_id,
        Question.quiz_id == session.quiz_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question not found in this quiz"
        )
    
    # Check if option belongs to the question
    option = db.query(Option).filter(
        Option.id == answer_data.selected_option_id,
        Option.question_id == answer_data.question_id
    ).first()
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Option not found for this question"
        )
    
    # Check if user already answered this question in this session
    existing_answer = db.query(PlayerAnswer).filter(
        PlayerAnswer.session_id == session_id,
        PlayerAnswer.player_id == current_user.id,
        PlayerAnswer.question_id == answer_data.question_id
    ).first()
    
    if existing_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already answered this question"
        )
    
    # Create player answer
    player_answer = PlayerAnswer(
        session_id=session_id,
        player_id=current_user.id,
        question_id=answer_data.question_id,
        selected_option_id=answer_data.selected_option_id,
        is_correct=option.is_correct
    )
    
    db.add(player_answer)
    db.commit()
    
    return {"message": "Answer submitted successfully", "is_correct": option.is_correct}


@router.get("/{session_id}/leaderboard", response_model=Leaderboard)
async def get_leaderboard(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the leaderboard for a game session."""
    # Check if session exists
    session = db.query(GameSession).filter(GameSession.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found"
        )
    
    # Get leaderboard data
    leaderboard_data = db.query(
        User.id,
        User.username,
        func.sum(PlayerAnswer.is_correct.cast(db.bind.dialect.name == 'postgresql' and 'integer' or 'int')).label('score'),
        func.count(PlayerAnswer.id).label('total_answers')
    ).join(
        PlayerAnswer, User.id == PlayerAnswer.player_id
    ).filter(
        PlayerAnswer.session_id == session_id
    ).group_by(
        User.id, User.username
    ).order_by(
        func.sum(PlayerAnswer.is_correct.cast(db.bind.dialect.name == 'postgresql' and 'integer' or 'int')).desc()
    ).all()
    
    entries = []
    for user_id, username, score, total_answers in leaderboard_data:
        entries.append(LeaderboardEntry(
            player_id=user_id,
            username=username,
            score=score or 0,
            correct_answers=score or 0,
            total_answers=total_answers
        ))
    
    return Leaderboard(session_id=session_id, entries=entries)
