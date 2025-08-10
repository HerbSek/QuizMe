#!/usr/bin/env python3
"""
Verify that the React frontend is properly set up for deployment
"""
import os
import json

def check_file_exists(filepath):
    """Check if a file exists and print status"""
    if os.path.exists(filepath):
        print(f"✅ {filepath}")
        return True
    else:
        print(f"❌ MISSING: {filepath}")
        return False

def main():
    print("🔍 Verifying QuizMe React Frontend")
    print("=" * 50)
    
    # Essential files
    essential_files = [
        "frontend/package.json",
        "frontend/public/index.html",
        "frontend/src/index.js",
        "frontend/src/App.js",
        "frontend/src/index.css",
        "frontend/tailwind.config.js",
        "frontend/postcss.config.js",
        "frontend/.env",
        "frontend/.gitignore",
    ]
    
    # Component files
    component_files = [
        "frontend/src/components/Layout.js",
        "frontend/src/components/ProtectedRoute.js",
    ]
    
    # Page files
    page_files = [
        "frontend/src/pages/Home.js",
        "frontend/src/pages/Login.js",
        "frontend/src/pages/Signup.js",
        "frontend/src/pages/Dashboard.js",
        "frontend/src/pages/QuizList.js",
        "frontend/src/pages/CreateQuiz.js",
        "frontend/src/pages/JoinGame.js",
        "frontend/src/pages/HostGame.js",
        "frontend/src/pages/PlayGame.js",
        "frontend/src/pages/Results.js",
    ]
    
    # Store and lib files
    store_files = [
        "frontend/src/store/authStore.js",
        "frontend/src/store/quizStore.js",
        "frontend/src/store/sessionStore.js",
        "frontend/src/lib/api.js",
    ]
    
    all_files = essential_files + component_files + page_files + store_files
    missing_files = []
    
    print("\n📁 Essential Files:")
    for file in essential_files:
        if not check_file_exists(file):
            missing_files.append(file)
    
    print("\n🧩 Components:")
    for file in component_files:
        if not check_file_exists(file):
            missing_files.append(file)
            
    print("\n📄 Pages:")
    for file in page_files:
        if not check_file_exists(file):
            missing_files.append(file)
            
    print("\n🏪 Stores & API:")
    for file in store_files:
        if not check_file_exists(file):
            missing_files.append(file)
    
    # Check package.json configuration
    print("\n🔧 Checking package.json configuration...")
    try:
        with open("frontend/package.json", "r") as f:
            package_data = json.load(f)
            
        # Check for required dependencies
        required_deps = [
            "react", "react-dom", "react-router-dom", "axios", 
            "react-hook-form", "react-hot-toast", "zustand"
        ]
        
        missing_deps = []
        for dep in required_deps:
            if dep not in package_data.get("dependencies", {}):
                missing_deps.append(dep)
        
        if missing_deps:
            print(f"❌ Missing dependencies: {', '.join(missing_deps)}")
        else:
            print("✅ All required dependencies present")
            
        # Check scripts
        scripts = package_data.get("scripts", {})
        if "build" in scripts and "start" in scripts:
            print("✅ Build and start scripts configured")
        else:
            print("❌ Missing build or start scripts")
            
    except FileNotFoundError:
        print("❌ frontend/package.json not found")
    except json.JSONDecodeError:
        print("❌ frontend/package.json is not valid JSON")
    
    # Check environment configuration
    print("\n🌍 Checking environment configuration...")
    if os.path.exists("frontend/.env"):
        with open("frontend/.env", "r") as f:
            env_content = f.read()
            if "REACT_APP_API_URL" in env_content:
                print("✅ API URL configured")
            else:
                print("❌ REACT_APP_API_URL not set")
    else:
        print("❌ .env file missing")
    
    print("\n" + "=" * 50)
    if missing_files:
        print(f"❌ {len(missing_files)} files are missing!")
        print("These files need to be created:")
        for file in missing_files:
            print(f"  - {file}")
    else:
        print("✅ All files are present!")
        print("🚀 Frontend is ready for deployment!")
        print("\nTo deploy on Render:")
        print("1. Build Command: npm run build")
        print("2. Publish Directory: build")
        print("3. Environment Variable: REACT_APP_API_URL=https://quizme-ked0.onrender.com")

if __name__ == "__main__":
    main()
