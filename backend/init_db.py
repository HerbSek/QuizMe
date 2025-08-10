#!/usr/bin/env python3
"""
Initialize the database and run migrations.
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Initialize database and run migrations."""
    print("QuizMe Database Initialization")
    print("=" * 40)
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create initial migration
    if not run_command(
        "alembic revision --autogenerate -m 'Initial migration'",
        "Creating initial migration"
    ):
        sys.exit(1)
    
    # Run migrations
    if not run_command(
        "alembic upgrade head",
        "Running migrations"
    ):
        sys.exit(1)
    
    print("\n✓ Database initialization completed successfully!")
    print("You can now start the FastAPI server with: uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()
