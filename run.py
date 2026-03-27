import subprocess
import webbrowser
import time
import sys

# 🔥 Start backend using python -m (important fix)
backend_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload"],
    shell=True
)

print("🚀 Backend starting...")

# wait for backend to start
time.sleep(3)

# 🌐 Open frontend (absolute path)
webbrowser.open("http://127.0.0.1:8000/docs")  # test backend
webbrowser.open("file:///C:/Users/abhyd/OneDrive/Desktop/iplproject/frontend/index.html")

print("✅ Backend + Frontend started!")