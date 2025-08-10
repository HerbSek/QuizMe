#!/usr/bin/env python3
"""
Script to create/update database tables for the multiplayer quiz system.
Run this after updating the models to ensure all tables exist.
"""

from app.db.database import engine
from app.models import user, quiz, session

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    
    # Create all tables
    user.Base.metadata.create_all(bind=engine)
    quiz.Base.metadata.create_all(bind=engine)
    session.Base.metadata.create_all(bind=engine)
    
    print("✅ All tables created successfully!")
    
    # Print table information
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"\n📋 Database tables ({len(tables)}):")
    for table in sorted(tables):
        print(f"  - {table}")
    
    # Check for the new session_participants table specifically
    if "session_participants" in tables:
        print("\n✅ session_participants table exists - participant tracking will work!")
        
        # Show columns
        columns = inspector.get_columns("session_participants")
        print("   Columns:")
        for col in columns:
            print(f"     - {col['name']}: {col['type']}")
    else:
        print("\n❌ session_participants table missing - this will cause the join issue!")
    
    # Check for updated game_sessions table
    if "game_sessions" in tables:
        columns = inspector.get_columns("game_sessions")
        column_names = [col['name'] for col in columns]
        
        required_fields = ['question_time_limit', 'current_question_started_at']
        missing_fields = [field for field in required_fields if field not in column_names]
        
        if missing_fields:
            print(f"\n⚠️  game_sessions table missing fields: {missing_fields}")
            print("   This may cause issues with timing functionality.")
        else:
            print("\n✅ game_sessions table has all required fields!")

if __name__ == "__main__":
    create_tables()
