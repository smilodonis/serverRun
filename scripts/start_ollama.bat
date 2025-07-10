@echo off
setlocal
title Ollama Server (GPU 1)

echo =======================================================
echo  Attempting to start Ollama server on a specific GPU.
echo =======================================================
echo.

rem Set the host for Ollama to be accessible over the network
set OLLAMA_HOST=0.0.0.0
echo Environment variable set: OLLAMA_HOST=%OLLAMA_HOST%
echo Ollama will be accessible on all network interfaces.
echo.

rem Set the CUDA_VISIBLE_DEVICES environment variable to use the second GPU (indexed from 0)
set CUDA_VISIBLE_DEVICES=1
echo Environment variable set: CUDA_VISIBLE_DEVICES=%CUDA_VISIBLE_DEVICES%
echo This will restrict Ollama's visibility to only the specified GPU.
echo.

echo Starting Ollama server...
echo All output from Ollama will be displayed below.
echo Close this window to stop the server.
echo.

rem Assuming 'ollama' is in the system's PATH.
rem The 'serve' command starts the Ollama server.
ollama serve

echo.
echo Ollama server has been stopped.
pause 