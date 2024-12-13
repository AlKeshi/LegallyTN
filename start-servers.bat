@echo off
title Start Servers Script

echo Starting FastAPI server...
start cmd /k "cd C:\Users\DELL\Desktop\web rag\api && venv\Scripts\activate && python -m app.main"

echo Starting Node.js backend server...
start cmd /k "cd server && node server.js"

echo Starting frontend server...
start cmd /k "cd client && npm start"

echo All three servers are starting up. You can close this window, but keep the other three terminal windows open to keep the servers running.
pause