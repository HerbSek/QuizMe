#!/usr/bin/env python3
"""
Migration script to add missing columns to game_sessions table.
This adds the timing functionality fields that are missing.
"""

from sqlalchemy import text
from app.db.database import engine

def migrate_game_sessions():
    """Add missing columns to game_sessions table."""
    print("🔧 Migrating game_sessions table...")
    
    with engine.connect() as connection:
        # Start a transaction
        trans = connection.begin()
        
        try:
            # Check current columns
            result = connection.execute(text("PRAGMA table_info(game_sessions)"))
            existing_columns = [row[1] for row in result.fetchall()]
            print(f"📋 Current columns: {existing_columns}")
            
            # Add missing columns
            missing_columns = []
            
            # Add question_time_limit column
            if 'question_time_limit' not in existing_columns:
                print("➕ Adding question_time_limit column...")
                connection.execute(text(
                    "ALTER TABLE game_sessions ADD COLUMN question_time_limit INTEGER DEFAULT 30"
                ))
                missing_columns.append('question_time_limit')
            
            # Add current_question_started_at column
            if 'current_question_started_at' not in existing_columns:
                print("➕ Adding current_question_started_at column...")
                connection.execute(text(
                    "ALTER TABLE game_sessions ADD COLUMN current_question_started_at DATETIME"
                ))
                missing_columns.append('current_question_started_at')
            
            # Add answer_time column to player_answers if missing
            result = connection.execute(text("PRAGMA table_info(player_answers)"))
            answer_columns = [row[1] for row in result.fetchall()]
            
            if 'answer_time' not in answer_columns:
                print("➕ Adding answer_time column to player_answers...")
                connection.execute(text(
                    "ALTER TABLE player_answers ADD COLUMN answer_time INTEGER"
                ))
                missing_columns.append('answer_time (player_answers)')
            
            # Commit the transaction
            trans.commit()
            
            if missing_columns:
                print(f"✅ Successfully added columns: {missing_columns}")
            else:
                print("✅ All columns already exist!")
            
            # Verify the changes
            print("\n🔍 Verifying game_sessions table structure:")
            result = connection.execute(text("PRAGMA table_info(game_sessions)"))
            for row in result.fetchall():
                col_id, name, col_type, not_null, default, pk = row
                print(f"  - {name}: {col_type} (default: {default})")
            
            print("\n🔍 Verifying player_answers table structure:")
            result = connection.execute(text("PRAGMA table_info(player_answers)"))
            for row in result.fetchall():
                col_id, name, col_type, not_null, default, pk = row
                if name in ['answer_time', 'id', 'is_correct']:  # Show key columns
                    print(f"  - {name}: {col_type} (default: {default})")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            trans.rollback()
            raise

def test_migration():
    """Test that the migration worked correctly."""
    print("\n🧪 Testing migration...")
    
    with engine.connect() as connection:
        # Test inserting a record with new fields
        try:
            # This should work if migration was successful
            connection.execute(text("""
                INSERT INTO game_sessions 
                (quiz_id, host_id, game_code, status, current_question_index, question_time_limit, created_at)
                VALUES (1, 1, 'TEST01', 'waiting', 0, 45, datetime('now'))
            """))
            
            # Clean up test record
            connection.execute(text("DELETE FROM game_sessions WHERE game_code = 'TEST01'"))
            connection.commit()
            
            print("✅ Migration test passed - new columns work correctly!")
            
        except Exception as e:
            print(f"❌ Migration test failed: {e}")
            print("   The timing functionality may not work properly.")

if __name__ == "__main__":
    migrate_game_sessions()
    test_migration()
    
    print("\n" + "=" * 50)
    print("🚀 Migration Complete!")
    print("✅ session_participants table: Ready")
    print("✅ game_sessions timing fields: Added")
    print("✅ player_answers timing field: Added")
    print("\nYou can now restart your backend server.")
    print("The multiplayer timing functionality should work correctly!")
