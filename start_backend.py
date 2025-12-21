#!/usr/bin/env python3
"""
AI Frogger Backend Startup Script
Run this to start the AI backend server for enhanced gameplay features.
"""

import subprocess
import sys
import os
import time

def install_requirements():
    """Install required Python packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install requirements: {e}")
        return False

def start_server():
    """Start the Flask AI backend server"""
    print("Starting AI Frogger backend server...")
    print("Server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start the Flask server
        subprocess.run([sys.executable, "ai_backend.py"])
    except KeyboardInterrupt:
        print("\n✓ Server stopped by user")
    except Exception as e:
        print(f"✗ Server error: {e}")

def main():
    print("🐸 AI Frogger Backend Setup")
    print("=" * 30)
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("✗ requirements.txt not found!")
        return
    
    # Install requirements
    if not install_requirements():
        print("Please install requirements manually: pip install -r requirements.txt")
        return
    
    print("\n🚀 Starting server...")
    time.sleep(1)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()