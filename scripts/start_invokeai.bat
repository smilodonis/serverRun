@echo off
echo Starting InvokeAI Web UI...

REM --- IMPORTANT ---
REM You must edit this file to provide the correct path to your InvokeAI installation.
REM
REM 1. Find the path to the "activate.bat" file inside your InvokeAI's virtual environment.
REM    It's usually in a location like: C:\Users\YourUser\invokeai\.venv\Scripts\activate.bat
REM
REM 2. Replace the placeholder path below with your actual path.

set "INVOKEAI_VENV_ACTIVATE=C:\$Andy\AI\.venv\Scripts\activate.bat"

REM --- Do not edit below this line ---

if not exist "%INVOKEAI_VENV_ACTIVATE%" (
    echo ERROR: The path to InvokeAI's activate.bat is incorrect.
    echo Please edit this file: %~dp0start_invokeai.bat
    pause
    exit /b
)

call "%INVOKEAI_VENV_ACTIVATE%"
python -m invokeai.app.run_configure --web 