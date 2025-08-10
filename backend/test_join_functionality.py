#!/usr/bin/env python3
"""
Test script to verify the join game functionality works correctly.
This will help debug why players aren't appearing when they join.
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://quizme-ked0.onrender.com"  # Your backend URL
# BASE_URL = "http://localhost:8000"  # For local testing

def test_join_functionality():
    """Test the complete join game flow."""
    print("🧪 Testing Join Game Functionality")
    print("=" * 50)
    
    # You'll need to replace these with actual values from your system
    print("\n📝 To run this test, you need:")
    print("1. A valid JWT token for a user")
    print("2. An active game session code")
    print("3. The session ID")
    
    print("\n🔧 Manual Test Steps:")
    print("1. Create a game session (host)")
    print("2. Get the game code")
    print("3. Try to join with another user")
    print("4. Check participants list")
    
    print("\n📋 API Endpoints to Test:")
    
    print("\n1. Join Game:")
    print(f"   POST {BASE_URL}/api/sessions/join")
    print("   Headers: Authorization: Bearer <token>")
    print("   Body: {\"game_code\": \"XXXXXX\"}")
    
    print("\n2. Check Participants:")
    print(f"   GET {BASE_URL}/api/sessions/{{session_id}}/participants")
    print("   Headers: Authorization: Bearer <token>")
    
    print("\n3. Get Session Details:")
    print(f"   GET {BASE_URL}/api/sessions/{{session_id}}")
    print("   Headers: Authorization: Bearer <token>")
    
    print("\n🔍 What to Look For:")
    print("- Join request returns 200 status")
    print("- Participants endpoint shows the joined user")
    print("- Database has record in session_participants table")
    
    print("\n🐛 Common Issues:")
    print("- session_participants table doesn't exist")
    print("- Foreign key constraints failing")
    print("- User already exists as participant")
    print("- Session status prevents joining")
    
    print("\n💡 Database Queries to Run:")
    print("SELECT * FROM session_participants WHERE session_id = <session_id>;")
    print("SELECT * FROM game_sessions WHERE game_code = '<game_code>';")
    print("SELECT * FROM users WHERE id = <user_id>;")

def test_with_curl():
    """Generate curl commands for testing."""
    print("\n🌐 CURL Test Commands:")
    print("=" * 30)
    
    print("\n# 1. Join a game session")
    print("curl -X POST \\")
    print(f"  {BASE_URL}/api/sessions/join \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\")
    print("  -d '{\"game_code\": \"YOUR_GAME_CODE\"}'")
    
    print("\n# 2. Check participants")
    print("curl -X GET \\")
    print(f"  {BASE_URL}/api/sessions/SESSION_ID/participants \\")
    print("  -H 'Authorization: Bearer YOUR_JWT_TOKEN'")
    
    print("\n# 3. Get session details")
    print("curl -X GET \\")
    print(f"  {BASE_URL}/api/sessions/SESSION_ID \\")
    print("  -H 'Authorization: Bearer YOUR_JWT_TOKEN'")

if __name__ == "__main__":
    test_join_functionality()
    test_with_curl()
    
    print("\n" + "=" * 50)
    print("🚀 Next Steps:")
    print("1. Run: python backend/create_tables.py")
    print("2. Restart your backend server")
    print("3. Test the join functionality with real data")
    print("4. Check backend logs for any errors")
    print("5. Verify database has participant records")
