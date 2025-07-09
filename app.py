from flask import Flask, render_template, jsonify, request
import psutil
import pynvml
import os
import subprocess
import socket
import requests

app = Flask(__name__)
SCRIPTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scripts')

# Predefined dictionary of allowed applications to start.
# The user should configure this dictionary with the applications they want to control.
# Example: 'notepad': 'C:\\Windows\\System32\\notepad.exe'
ALLOWED_APPS = {
    'notepad': 'notepad.exe' # Using notepad as an example
}

try:
    pynvml.nvmlInit()
    NVML_AVAILABLE = True
except pynvml.NVMLError:
    NVML_AVAILABLE = False

@app.route('/')
def index():
    hostname = socket.gethostname()
    return render_template('index.html', hostname=hostname)

@app.route('/api/ollama-info')
def ollama_info():
    try:
        # Check if the Ollama server is running
        response = requests.get('http://127.0.0.1:11434/', timeout=1)
        if response.status_code == 200 and "Ollama is running" in response.text:
            # If it's running, get the list of loaded models
            ps_response = requests.get('http://127.0.0.1:11434/api/ps', timeout=2)
            ps_data = ps_response.json()
            return jsonify({
                'running': True,
                'models': ps_data.get('models', [])
            })
    except requests.ConnectionError:
        return jsonify({'running': False, 'models': []})
    except Exception as e:
        return jsonify({'running': False, 'error': str(e)}), 500
    
    return jsonify({'running': False, 'models': []})

@app.route('/api/invokeai-info')
def invokeai_info():
    invokeai_url = 'http://127.0.0.1:9090'
    try:
        # Check if the server is running by getting the version
        version_response = requests.get(f'{invokeai_url}/api/v1/app/version', timeout=1)
        if version_response.status_code == 200:
            # If running, check the queue status to see if it's busy
            queue_status_response = requests.get(f'{invokeai_url}/api/v1/queue/default/status', timeout=1)
            if queue_status_response.status_code == 200:
                queue_data = queue_status_response.json()
                queue_status = queue_data.get('queue', {})
                is_generating = queue_status.get('in_progress', 0) > 0
                return jsonify({
                    'running': True,
                    'is_generating': is_generating,
                    'queue': {
                        'total': queue_status.get('total', 0),
                        'completed': queue_status.get('completed', 0),
                        'in_progress': queue_status.get('in_progress', 0),
                        'pending': queue_status.get('pending', 0),
                        'failed': queue_status.get('failed', 0),
                        'canceled': queue_status.get('canceled', 0),
                    }
                })
            else:
                 # It's running but can't get queue status, assume not generating
                 return jsonify({'running': True, 'is_generating': False})

    except requests.ConnectionError:
        return jsonify({'running': False, 'is_generating': False})
    except Exception as e:
        return jsonify({'running': False, 'is_generating': False, 'error': str(e)}), 500
    
    return jsonify({'running': False, 'is_generating': False})

def is_ollama_running():
    """Check if the 'ollama serve' process is running on the system."""
    for proc in psutil.process_iter(['name', 'cmdline']):
        try:
            # Check for name and that cmdline is not empty
            if 'ollama' in proc.info['name'].lower() and proc.info['cmdline'] and 'serve' in proc.info['cmdline']:
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False

def is_invokeai_running():
    """Check if the InvokeAI web process is running."""
    for proc in psutil.process_iter(['name', 'cmdline']):
        try:
            cmdline = proc.info.get('cmdline')
            if cmdline and any('invokeai-web' in c for c in cmdline):
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False

@app.route('/api/ollama/toggle', methods=['POST'])
def toggle_ollama():
    action = request.json.get('action')

    if action == 'start':
        if is_ollama_running():
            return jsonify({'error': 'Ollama is already running.'}), 400
        try:
            subprocess.Popen(['ollama', 'serve'])
            return jsonify({'message': 'Ollama server started.'})
        except FileNotFoundError:
            return jsonify({'error': "The 'ollama' command was not found. Is it in your system's PATH?"}), 500
        except Exception as e:
            return jsonify({'error': f'Failed to start Ollama: {e}'}), 500

    elif action == 'stop':
        if not is_ollama_running():
            return jsonify({'error': 'Ollama is not running.'}), 400
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if 'ollama' in proc.info['name'].lower() and proc.info['cmdline'] and 'serve' in proc.info['cmdline']:
                    psutil.Process(proc.info['pid']).terminate()
                    return jsonify({'message': 'Ollama server stopped.'})
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return jsonify({'error': 'Failed to find and stop the Ollama process.'}), 500

    return jsonify({'error': 'Invalid action.'}), 400

@app.route('/api/invokeai/toggle', methods=['POST'])
def toggle_invokeai():
    action = request.json.get('action')

    if action == 'start':
        if is_invokeai_running():
            return jsonify({'error': 'InvokeAI is already running.'}), 400
        try:
            subprocess.Popen(['invokeai-web'])
            return jsonify({'message': 'InvokeAI server started.'})
        except FileNotFoundError:
            return jsonify({'error': "The 'invokeai-web' command was not found. Is it in your system's PATH?"}), 500
        except Exception as e:
            return jsonify({'error': f'Failed to start InvokeAI: {e}'}), 500

    elif action == 'stop':
        if not is_invokeai_running():
            return jsonify({'error': 'InvokeAI is not running.'}), 400
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = proc.info.get('cmdline')
                if cmdline and any('invokeai-web' in c for c in cmdline):
                    psutil.Process(proc.info['pid']).terminate()
                    return jsonify({'message': 'InvokeAI server stopped.'})
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return jsonify({'error': 'Failed to find and stop the InvokeAI process.'}), 500

    return jsonify({'error': 'Invalid action.'}), 400

@app.route('/api/system-info')
def system_info():
    cpu_usage = psutil.cpu_percent(interval=1)
    ram_usage = psutil.virtual_memory().percent
    
    temperatures = {}
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for name, entries in temps.items():
                for entry in entries:
                    temperatures[f"{name} {entry.label}"] = entry.current
    except AttributeError:
        # sensors_temperatures() not available on this platform
        pass

    return jsonify({
        'cpu_usage': cpu_usage,
        'ram_usage': ram_usage,
        'temperatures': temperatures,
    })

@app.route('/api/gpu-info')
def gpu_info():
    if not NVML_AVAILABLE:
        return jsonify({'error': 'NVIDIA driver not found or pynvml not installed.'}), 500

    gpus = []
    try:
        device_count = pynvml.nvmlDeviceGetCount()
        for i in range(device_count):
            handle = pynvml.nvmlDeviceGetHandleByIndex(i)
            name = pynvml.nvmlDeviceGetName(handle)
            temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            fan_speed = pynvml.nvmlDeviceGetFanSpeed(handle)
            memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
            utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)

            gpus.append({
                'name': name,
                'temperature': temp,
                'fan_speed': fan_speed,
                'memory_total': memory_info.total,
                'memory_used': memory_info.used,
                'memory_free': memory_info.free,
                'utilization_gpu': utilization.gpu,
                'utilization_mem': utilization.memory,
            })
    except pynvml.NVMLError as e:
        return jsonify({'error': str(e)}), 500
    
    return jsonify(gpus)

@app.route('/api/running-apps')
def running_apps():
    apps = []
    for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
        try:
            # We check for name and username to ensure we can get meaningful info
            if proc.info['name'] and proc.info['username']:
                apps.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return jsonify(apps)

@app.route('/api/run-script', methods=['POST'])
def run_script():
    data = request.get_json()
    script_name = data.get('script_name')

    if not script_name or not script_name.endswith('.bat'):
        return jsonify({'error': 'Invalid script name provided.'}), 400

    script_path = os.path.join(SCRIPTS_DIR, script_name)

    if not os.path.exists(script_path):
        return jsonify({'error': 'Script not found.'}), 404

    try:
        subprocess.Popen(script_path, cwd=SCRIPTS_DIR)
        return jsonify({'message': f'Script "{script_name}" started.'})
    except Exception as e:
        return jsonify({'error': f'Failed to run script: {e}'}), 500

@app.route('/api/start-app', methods=['POST'])
def start_app():
    data = request.get_json()
    app_name = data.get('app_name')

    if not app_name or app_name not in ALLOWED_APPS:
        return jsonify({'error': 'Invalid or not allowed application name.'}), 400
    
    app_path = ALLOWED_APPS[app_name]
    
    try:
        subprocess.Popen(app_path)
        return jsonify({'message': f'Application "{app_name}" started.'})
    except Exception as e:
        return jsonify({'error': f'Failed to start application: {e}'}), 500

@app.route('/api/stop-app', methods=['POST'])
def stop_app():
    data = request.get_json()
    app_name = data.get('app_name')

    if not app_name:
        return jsonify({'error': 'Application name not provided.'}), 400

    killed = False
    for proc in psutil.process_iter(['pid', 'name']):
        # Be careful with this, it will kill all processes with the given name.
        if proc.info['name'].lower() == app_name.lower() or proc.info['name'].lower() == app_name.lower() + ".exe":
            try:
                p = psutil.Process(proc.info['pid'])
                p.terminate()
                killed = True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
    
    if killed:
        return jsonify({'message': f'Attempted to stop application "{app_name}".'})
    else:
        return jsonify({'error': f'Application "{app_name}" not found or could not be stopped.'}), 404

# According to the rules, I, the AI, am not supposed to run the server.
# However, to run this server, you would typically use the following command in your terminal:
# flask run
# Or you can add the following block to the end of this file and run it with `python app.py`:
#
# if __name__ == '__main__':
#     app.run(debug=True) 