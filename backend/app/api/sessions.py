import random
import string
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, Question, Option
from app.models.session import GameSession, SessionParticipant, PlayerAnswer, SessionStatus
from app.schemas.session import (
    GameSessionCreate,
    GameSessionJoin,
    PlayerAnswerCreate,
    GameSession as GameSessionSchema,
    SessionParticipant as SessionParticipantSchema,
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
    session_data: GameSessionCreate,
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
        status=SessionStatus.WAITING,
        question_time_limit=session_data.question_time_limit
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

    # Update session status to active and start first question
    session.status = SessionStatus.ACTIVE
    session.started_at = func.now()
    session.current_question_started_at = func.now()

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

    # Add user as participant
    participant = SessionParticipant(
        session_id=session.id,
        user_id=current_user.id
    )
    db.add(participant)
    db.commit()

    return session


@router.get("/{session_id}/participants", response_model=List[SessionParticipantSchema])
async def get_session_participants(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all participants in a game session."""
    session = db.query(GameSession).filter(GameSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found"
        )

    participants = db.query(SessionParticipant, User.username).join(
        User, SessionParticipant.user_id == User.id
    ).filter(
        SessionParticipant.session_id == session_id,
        SessionParticipant.is_active == True
    ).all()

    result = []
    for participant, username in participants:
        result.append(SessionParticipantSchema(
            id=participant.id,
            session_id=participant.session_id,
            user_id=participant.user_id,
            username=username,
            joined_at=participant.joined_at,
            is_active=participant.is_active
        ))

    return result


@router.post("/{session_id}/next-question", response_model=GameSessionSchema)
async def next_question(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Move to the next question (only host can do this)."""
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
            detail="Only the host can control question progression"
        )

    # Get quiz to check total questions
    quiz = db.query(Quiz).filter(Quiz.id == session.quiz_id).first()
    total_questions = len(quiz.questions)

    if session.current_question_index >= total_questions - 1:
        # End the session if this was the last question
        session.status = SessionStatus.FINISHED
        session.finished_at = func.now()
    else:
        # Move to next question
        session.current_question_index += 1
        session.current_question_started_at = func.now()

    db.commit()
    db.refresh(session)

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
        is_correct=option.is_correct,
        answer_time=answer_data.answer_time
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
    
    # Get leaderboard data with timing
    leaderboard_data = db.query(
        User.id,
        User.username,
        func.sum(PlayerAnswer.is_correct.cast(db.bind.dialect.name == 'postgresql' and 'integer' or 'int')).label('score'),
        func.count(PlayerAnswer.id).label('total_answers'),
        func.avg(PlayerAnswer.answer_time).label('avg_time')
    ).join(
        PlayerAnswer, User.id == PlayerAnswer.player_id
    ).filter(
        PlayerAnswer.session_id == session_id
    ).group_by(
        User.id, User.username
    ).order_by(
        func.sum(PlayerAnswer.is_correct.cast(db.bind.dialect.name == 'postgresql' and 'integer' or 'int')).desc(),
        func.avg(PlayerAnswer.answer_time).asc()  # Faster average time as tiebreaker
    ).all()

    entries = []
    for user_id, username, score, total_answers, avg_time in leaderboard_data:
        entries.append(LeaderboardEntry(
            player_id=user_id,
            username=username,
            score=score or 0,
            correct_answers=score or 0,
            total_answers=total_answers,
            average_time=avg_time
        ))
    
    return Leaderboard(session_id=session_id, entries=entries)
