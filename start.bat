@echo off
title GuardRail — Starting Dev Server
color 0B

echo.
echo  =====================================================
echo   GuardRail — Safe Spend Infrastructure
echo   AI Fintech + Agentic Commerce Platform
echo  =====================================================
echo.
echo  Starting Vite dev server...
echo  Opening http://localhost:3000 in your browser.
echo.
echo  Press Ctrl+C to stop the server.
echo  =====================================================
echo.

cd /d "%~dp0"
npx vite

pause
