@echo off
title 한글 파닉스 브로마이드 제작기 실행기
chcp 65001 > nul
echo ===================================================
echo   한글 파닉스 브로마이드 제작기 서버를 시작합니다...
echo ===================================================
cd /d "%~dp0"
echo.
echo 1. 의존성 패키지 확인 중...
if not exist node_modules (
    echo node_modules 폴더가 없습니다. 패키지를 설치합니다...
    call npm install
)
echo.
echo 2. 로컬 웹 서버 구동 중...
echo (서버가 켜진 상태에서 브라우저가 자동으로 열립니다.)
echo.
call npm run dev
pause
