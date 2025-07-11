# Server Control Panel - Documentation

## 1. Project Overview

This project is a web-based control panel for a Windows server. It provides a simple one-page interface to monitor system resources, view running applications, and control services like Ollama and InvokeAI. It also features a dark mode toggle and other UI enhancements.

## 2. Features

-   **System Monitoring**: Real-time monitoring of:
    -   CPU and RAM usage (with graphical bars).
    -   GPU usage, temperature, memory, and fan speed (with graphical bars).
-   **Ollama Monitoring**:
    -   Start/Stop toggle for the Ollama server.
    -   Shows if the service is running, including which GPU is in use (displayed as a badge).
    -   Displays the currently loaded model (as a badge).
    -   Model selector dropdown to load/unload models from all available local models.
-   **InvokeAI Monitoring**:
    -   Start/Stop toggle for the InvokeAI server.
    -   Shows if the service is running.
    -   Shows if an image is currently being generated.
    -   Tracks the progress of the current image generation batch (e.g., 1/10).
-   **Application Management**:
    -   List currently running applications.
    -   Launch specified applications.
    -   Terminate running applications.
-   **Script Execution**:
    -   Run predefined `.bat` script files.
-   **Customization & UI**:
    -   Displays the PC's hostname in the title.
    -   Light/Dark mode theme toggle (persists in local storage).
    -   Custom server-themed favicon.

## 3. Tech Stack

-   **Backend**: Python with Flask
-   **Frontend**: HTML, CSS, JavaScript (no frameworks)
-   **System Interaction**:
    -   `psutil` for system process management and monitoring.
    -   `pynvml` for NVIDIA GPU monitoring.
    -   `subprocess` for running scripts and applications.
    -   `requests` for querying the Ollama & InvokeAI APIs.
    -   `socket` to get the hostname.

## 4. Project Structure

```
serverRun/
|-- venv/
|-- app.py                 # Flask server application
|-- requirements.txt       # Python dependencies
|-- documentation.md       # This file
|-- README.md              # Project README file
|-- scripts/
|   |-- example.bat
|   |-- start_ollama.bat
|   |-- start_invokeai.bat
|-- templates/
|   |-- index.html
|-- static/
    |-- style.css
    |-- script.js
    |-- favicon.svg
```

## 5. API Endpoints

-   `GET /`: Serves the main `index.html` page and passes the hostname.
-   `GET /api/system-info`: Returns system resource data.
-   `GET /api/gpu-info`: Returns GPU data.
-   `GET /api/ollama-info`: Returns Ollama status, loaded models, and GPU usage.
-   `GET /api/invokeai-info`: Returns InvokeAI status, generation state, and queue details.
-   `GET /api/running-apps`: Returns a list of running applications.
-   `POST /api/ollama/toggle`: Starts or stops the Ollama server.
-   `POST /api/invokeai/toggle`: Starts or stops the InvokeAI server.
-   `GET /api/ollama/models`: Returns a list of all available Ollama models.
-   `POST /api/ollama/load`: Loads a specified Ollama model.
-   `POST /api/ollama/unload`: Unloads a specified Ollama model.
-   `POST /api/run-script`: Executes a predefined `.bat` script.
-   `POST /api/start-app`: Starts a predefined application.
-   `POST /api/stop-app`: Stops a running application.

## 6. Implementation Details

### Backend (`app.py`)
-   Uses helper functions to robustly check if Ollama and InvokeAI processes (including child processes) are running.
-   Starts services using configurable `.bat` files in the `scripts/` directory for maximum flexibility.
-   Provides API endpoints for starting/stopping services and managing Ollama models.
-   Detects which GPU is being used by the Ollama process and its children.

### Frontend (`index.html`, `script.js`)
-   Features toggle switches to start/stop Ollama and InvokeAI.
-   Uses badges to display the GPU in use and the currently loaded Ollama model for a clean UI.
-   Dynamically populates a dropdown with all available Ollama models.
-   Handles the logic for unloading the previous model before loading a new one.
-   Intelligently tracks the current InvokeAI image batch progress.

## 7. Setup and Running

1.  **Configure Scripts**:
    -   Edit `scripts/start_invokeai.bat` to provide the full path to your InvokeAI virtual environment's `activate.bat` file.
    -   (Optional) Edit `scripts/start_ollama.bat` if you have specific startup requirements.
2.  **Create a virtual environment**: `python -m venv venv`
3.  **Activate the virtual environment**:
    -   Windows: `venv\\Scripts\\activate`
    -   macOS/Linux: `source venv/bin/activate`
4.  **Install dependencies**: `pip install -r requirements.txt`
5.  **Run the Flask application**:
    As per the rules, you will have to run the server manually.
    ```bash
    flask run
    ```
    or
    ```bash
    python app.py
    ``` 