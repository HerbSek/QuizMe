from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, Question, Option
from app.schemas.quiz import QuizCreate, Quiz as QuizSchema, QuizSummary
from app.auth.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=QuizSchema)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new quiz."""
    # Create quiz
    db_quiz = Quiz(
        title=quiz_data.title,
        description=quiz_data.description,
        creator_id=current_user.id
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    # Create questions and options
    for question_data in quiz_data.questions:
        db_question = Question(
            quiz_id=db_quiz.id,
            text=question_data.text,
            order=question_data.order
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        # Create options
        for option_data in question_data.options:
            db_option = Option(
                question_id=db_question.id,
                text=option_data.text,
                is_correct=option_data.is_correct,
                order=option_data.order
            )
            db.add(db_option)
        
        db.commit()
    
    # Refresh quiz to get all relationships
    db.refresh(db_quiz)
    return db_quiz


@router.get("/mine", response_model=List[QuizSummary])
async def get_my_quizzes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes created by the current user."""
    quizzes = db.query(
        Quiz,
        func.count(Question.id).label("question_count")
    ).outerjoin(Question).filter(
        Quiz.creator_id == current_user.id,
        Quiz.is_active == True
    ).group_by(Quiz.id).all()
    
    result = []
    for quiz, question_count in quizzes:
        quiz_summary = QuizSummary(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            creator_id=quiz.creator_id,
            is_active=quiz.is_active,
            question_count=question_count,
            created_at=quiz.created_at
        )
        result.append(quiz_summary)
    
    return result


@router.get("/{quiz_id}", response_model=QuizSchema)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific quiz by ID."""
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
    
    return quiz


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a quiz (soft delete)."""
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
    
    quiz.is_active = False
    db.commit()
    
    return {"message": "Quiz deleted successfully"}
