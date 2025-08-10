#!/usr/bin/env python3
"""
Check if all necessary files exist for QuizMe frontend deployment
"""
import os

def check_file_exists(filepath):
    """Check if a file exists and print status"""
    if os.path.exists(filepath):
        print(f"✅ {filepath}")
        return True
    else:
        print(f"❌ MISSING: {filepath}")
        return False

def main():
    print("🔍 Checking QuizMe Frontend Deployment Files")
    print("=" * 50)
    
    # Critical files that must exist
    critical_files = [
        "frontend/lib/session.ts",
        "frontend/lib/auth.ts", 
        "frontend/lib/quiz.ts",
        "frontend/package.json",
        "frontend/tsconfig.json",
        "frontend/next.config.js",
        "frontend/components/Layout.tsx",
    ]
    
    # Updated pages with relative imports
    page_files = [
        "frontend/pages/_app.tsx",
        "frontend/pages/index.tsx",
        "frontend/pages/login.tsx",
        "frontend/pages/signup.tsx",
        "frontend/pages/dashboard.tsx",
        "frontend/pages/join.tsx",
        "frontend/pages/quizzes/index.tsx",
        "frontend/pages/quizzes/create.tsx",
        "frontend/pages/host/start/[quizId].tsx",
        "frontend/pages/host/[sessionId].tsx",
        "frontend/pages/play/[sessionId].tsx",
        "frontend/pages/results/[sessionId].tsx",
    ]
    
    # Store files
    store_files = [
        "frontend/store/authStore.ts",
        "frontend/store/quizStore.ts", 
        "frontend/store/sessionStore.ts",
    ]
    
    all_files = critical_files + page_files + store_files
    missing_files = []
    
    print("\n📁 Critical Files:")
    for file in critical_files:
        if not check_file_exists(file):
            missing_files.append(file)
    
    print("\n📄 Page Files:")
    for file in page_files:
        if not check_file_exists(file):
            missing_files.append(file)
            
    print("\n🏪 Store Files:")
    for file in store_files:
        if not check_file_exists(file):
            missing_files.append(file)
    
    print("\n" + "=" * 50)
    if missing_files:
        print(f"❌ {len(missing_files)} files are missing!")
        print("These files need to be added to your GitHub repository:")
        for file in missing_files:
            print(f"  - {file}")
    else:
        print("✅ All files are present!")
        print("Ready to commit and deploy to Render!")
    
    # Check package.json for export script
    print("\n🔧 Checking package.json configuration...")
    try:
        with open("frontend/package.json", "r") as f:
            content = f.read()
            if '"export"' in content:
                print("❌ package.json still contains 'export' script - this will cause deployment issues")
            else:
                print("✅ package.json export script removed")
    except FileNotFoundError:
        print("❌ frontend/package.json not found")

if __name__ == "__main__":
    main()
