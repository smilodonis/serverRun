# Server Control Panel - Documentation

## 1. Project Overview

This project is a web-based control panel for a Windows server. It provides a simple one-page interface to monitor system resources (CPU, GPU, temperature), view running applications, and execute predefined actions like running `.bat` files or starting/stopping applications. It also features Ollama instance monitoring and a dark mode toggle.

## 2. Features

-   **System Monitoring**: Real-time monitoring of:
    -   CPU usage (with graphical bar)
    -   RAM usage (with graphical bar)
    -   GPU usage, temperature, memory, and fan speed (with graphical bars)
-   **Ollama Monitoring**:
    -   Shows if the Ollama service is running.
    -   Lists currently loaded models.
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
    -   `psutil` for system and CPU monitoring.
    -   `pynvml` for NVIDIA GPU monitoring.
    -   `subprocess` for running scripts and applications.
    -   `requests` for querying the Ollama API.
    -   `socket` to get the hostname.

## 4. Project Structure

```
serverRun/
|-- venv/                  # Virtual environment
|-- app.py                 # Flask server application
|-- requirements.txt       # Python dependencies
|-- documentation.md       # This file
|-- scripts/               # Directory for .bat files and other scripts
|   |-- example.bat
|-- templates/
|   |-- index.html         # Main HTML page
|-- static/
    |-- style.css          # CSS for styling
    |-- script.js          # JavaScript for frontend logic
    |-- favicon.svg        # Server-themed favicon
```

## 5. API Endpoints

The Flask server will expose the following endpoints:

-   `GET /`: Serves the main `index.html` page and passes the hostname.
-   `GET /api/system-info`: Returns a JSON object with CPU, RAM, and temperature data.
-   `GET /api/gpu-info`: Returns a JSON object with GPU data.
-   `GET /api/ollama-info`: Returns the status and loaded models of the Ollama instance.
-   `GET /api/running-apps`: Returns a list of running applications.
-   `POST /api/run-script`: Executes a predefined `.bat` script.
    -   Payload: `{ "script_name": "name_of_script.bat" }`
-   `POST /api/start-app`: Starts a predefined application.
    -   Payload: `{ "app_name": "name_of_app" }`
-   `POST /api/stop-app`: Stops a running application by name.
    -   Payload: `{ "app_name": "name_of_app" }`

## 6. Implementation Details

### Backend (`app.py`)

-   A Flask application will be created.
-   Routes will be defined for each API endpoint.
-   Functions will be implemented to gather system data using `psutil`, `pynvml`, and `socket`.
-   A function to check the Ollama API is implemented using `requests`.
-   Functions for script/application management use the `subprocess` module with proper security considerations (e.g., allow-listing scripts and applications).

### Frontend (`index.html`, `script.js`)

-   `index.html` contains the structure for the dashboard, including the dark mode switch.
-   `script.js` handles:
    -   Periodically fetching data from all API endpoints.
    -   Dynamically updating the HTML to display the latest data in text and progress bars.
    -   Sending `POST` requests to action endpoints when buttons are clicked.
    -   Managing the light/dark theme and saving the preference to local storage.

## 7. Setup and Running

1.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    ```
2.  **Activate the virtual environment**:
    -   On Windows: `venv\\Scripts\\activate`
    -   On macOS/Linux: `source venv/bin/activate`
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the Flask application**:
    As per the rules, you will have to run the server manually.
    ```bash
    flask run
    ```
    or
    ```bash
    python app.py
    ```