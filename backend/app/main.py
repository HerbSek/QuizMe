from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, quizzes, sessions
from app.db.database import engine
from app.models import user, quiz, session

# Create database tables
user.Base.metadata.create_all(bind=engine)
quiz.Base.metadata.create_all(bind=engine)
session.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuizMe API",
    description="A Kahoot-like quiz application API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])


@app.get("/")
async def root():
    return {"message": "Welcome to QuizMe API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
