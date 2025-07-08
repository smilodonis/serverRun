# Server Control Panel - Documentation

## 1. Project Overview

This project is a web-based control panel for a Windows server. It provides a simple one-page interface to monitor system resources (CPU, GPU, temperature), view running applications, and execute predefined actions like running `.bat` files or starting/stopping applications.

## 2. Features

-   **System Monitoring**: Real-time monitoring of:
    -   CPU usage
    -   GPU usage, temperature, and memory
    -   System temperatures
    -   RAM usage
-   **Application Management**:
    -   List currently running applications.
    -   Launch specified applications.
    -   Terminate running applications.
-   **Script Execution**:
    -   Run predefined `.bat` script files.

## 3. Tech Stack

-   **Backend**: Python with Flask
-   **Frontend**: HTML, CSS, JavaScript (no frameworks)
-   **System Interaction**:
    -   `psutil` for system and CPU monitoring.
    -   `pynvml` for NVIDIA GPU monitoring.
    -   `subprocess` for running scripts and applications.

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
```

## 5. API Endpoints

The Flask server will expose the following endpoints:

-   `GET /`: Serves the main `index.html` page.
-   `GET /api/system-info`: Returns a JSON object with CPU, RAM, and temperature data.
-   `GET /api/gpu-info`: Returns a JSON object with GPU data.
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
-   Functions will be implemented to gather system data using `psutil` and `pynvml`.
-   Functions for script/application management will use the `subprocess` module with proper security considerations (e.g., allow-listing scripts and applications).

### Frontend (`index.html`, `script.js`)

-   `index.html` will contain the basic structure of the dashboard.
-   `script.js` will handle:
    -   Periodically fetching data from the `/api/*-info` endpoints using `fetch()`.
    -   Dynamically updating the HTML to display the latest data.
    -   Sending `POST` requests to action endpoints when buttons are clicked.
    -   Updating the UI based on the responses from action endpoints.

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