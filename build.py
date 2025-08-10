#!/usr/bin/env python3
"""
QuizMe Application Builder
This script helps set up and build the QuizMe application.
"""
import subprocess
import sys
import os
import platform

def run_command(command, description, cwd=None):
    """Run a shell command and handle errors."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            cwd=cwd
        )
        print(f"✅ {description} completed successfully")
        if result.stdout.strip():
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"Error: {e.stderr}")
        return False

def check_prerequisites():
    """Check if required tools are installed."""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    try:
        python_version = subprocess.check_output([sys.executable, "--version"], text=True).strip()
        print(f"✅ {python_version}")
    except:
        print("❌ Python not found")
        return False
    
    # Check Node.js
    try:
        node_version = subprocess.check_output(["node", "--version"], text=True).strip()
        print(f"✅ Node.js {node_version}")
    except:
        print("❌ Node.js not found. Please install Node.js 18+")
        return False
    
    # Check npm
    try:
        npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
        print(f"✅ npm {npm_version}")
    except:
        print("❌ npm not found")
        return False
    
    return True

def setup_backend():
    """Set up the backend environment."""
    print("\n🐍 Setting up Backend...")
    
    backend_dir = "backend"
    if not os.path.exists(backend_dir):
        print(f"❌ Backend directory '{backend_dir}' not found")
        return False
    
    # Create virtual environment
    venv_command = "python -m venv venv"
    if not run_command(venv_command, "Creating virtual environment", backend_dir):
        return False
    
    # Determine activation command based on OS
    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
        python_cmd = "venv\\Scripts\\python"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
        python_cmd = "venv/bin/python"
    
    # Install dependencies
    install_cmd = f"{pip_cmd} install -r requirements.txt"
    if not run_command(install_cmd, "Installing Python dependencies", backend_dir):
        return False
    
    # Copy environment file
    env_src = os.path.join(backend_dir, ".env.example")
    env_dst = os.path.join(backend_dir, ".env")
    if os.path.exists(env_src) and not os.path.exists(env_dst):
        import shutil
        shutil.copy2(env_src, env_dst)
        print("✅ Created .env file from .env.example")
    
    # Initialize database
    init_db_cmd = f"{python_cmd} init_db.py"
    if not run_command(init_db_cmd, "Initializing database", backend_dir):
        return False
    
    return True

def setup_frontend():
    """Set up the frontend environment."""
    print("\n⚛️ Setting up Frontend...")
    
    frontend_dir = "frontend"
    if not os.path.exists(frontend_dir):
        print(f"❌ Frontend directory '{frontend_dir}' not found")
        return False
    
    # Install dependencies
    if not run_command("npm install", "Installing Node.js dependencies", frontend_dir):
        return False
    
    return True

def main():
    """Main build process."""
    print("🎯 QuizMe Application Builder")
    print("=" * 40)
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please install missing tools.")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed.")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed.")
        sys.exit(1)
    
    print("\n🎉 QuizMe application setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend server:")
    if platform.system() == "Windows":
        print("   cd backend && venv\\Scripts\\activate && uvicorn app.main:app --reload --port 8000")
    else:
        print("   cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000")
    print("\n2. In a new terminal, start the frontend server:")
    print("   cd frontend && npm run dev")
    print("\n3. Open your browser and go to http://localhost:3000")
    print("\n🚀 Happy coding!")

if __name__ == "__main__":
    main()
