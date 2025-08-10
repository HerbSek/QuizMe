# QuizMe - A Kahoot-like Quiz Application

QuizMe is a modern quiz application built with FastAPI (backend) and Next.js (frontend) that allows users to create interactive quizzes and host live quiz sessions.

## 🚀 Features

- **User Authentication**: JWT-based signup and login
- **Quiz Management**: Create, edit, and delete quizzes with multiple-choice questions
- **Live Game Sessions**: Host real-time quiz sessions with game codes
- **Leaderboards**: Track player performance and scores
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **SQLite**: Database (PostgreSQL-compatible)
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing

### Frontend
- **Next.js**: React framework
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Axios**: HTTP client

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:
```bash
python init_db.py
```

6. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

## 🔧 Development

### Backend Development

- **API Documentation**: Visit `http://localhost:8000/docs` for interactive API docs
- **Database Migrations**: 
  ```bash
  alembic revision --autogenerate -m "Description"
  alembic upgrade head
  ```

### Frontend Development

- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## 📁 Project Structure

```
QuizMe/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication logic
│   │   ├── core/         # Configuration
│   │   ├── db/           # Database setup
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── main.py       # FastAPI app
│   ├── alembic/          # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── components/       # React components
│   ├── lib/             # Utilities
│   ├── pages/           # Next.js pages
│   ├── store/           # Zustand stores
│   └── styles/          # CSS styles
└── README.md
```

## 🎮 How to Use

1. **Sign Up**: Create a new account or log in
2. **Create Quiz**: Build quizzes with multiple-choice questions
3. **Host Session**: Start a live quiz session and share the game code
4. **Join Game**: Players can join using the game code
5. **Play**: Answer questions in real-time
6. **View Results**: Check the leaderboard after the game

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Quizzes
- `POST /api/quizzes/` - Create quiz
- `GET /api/quizzes/mine` - Get user's quizzes
- `GET /api/quizzes/{id}` - Get specific quiz
- `DELETE /api/quizzes/{id}` - Delete quiz

### Game Sessions
- `POST /api/sessions/start/{quiz_id}` - Start game session
- `POST /api/sessions/join` - Join game session
- `POST /api/sessions/{id}/answer` - Submit answer
- `GET /api/sessions/{id}/leaderboard` - Get leaderboard

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `alembic upgrade head`
4. Deploy using your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Update API base URL in production
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
