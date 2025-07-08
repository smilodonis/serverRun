document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('checkbox');
    
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if(themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
    };

    if(themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    console.log('Control panel script loaded.');

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
            return null;
        }
    };

    const postData = async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            alert(result.message || result.error);
        } catch (error) {
            console.error(`Error posting to ${url}:`, error);
            alert('An error occurred.');
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const updateSystemInfo = async () => {
        const data = await fetchData('/api/system-info');
        if (!data) return;

        const cpuUsage = data.cpu_usage.toFixed(1);
        document.getElementById('cpu-usage-text').textContent = cpuUsage;
        document.getElementById('cpu-usage-bar').style.width = `${cpuUsage}%`;
        
        const ramUsage = data.ram_usage.toFixed(1);
        document.getElementById('ram-usage-text').textContent = ramUsage;
        document.getElementById('ram-usage-bar').style.width = `${ramUsage}%`;
    };

    const updateGpuInfo = async () => {
        const data = await fetchData('/api/gpu-info');
        const gpuInfoDiv = document.getElementById('gpu-info');
        gpuInfoDiv.innerHTML = '';

        if (!data || data.error) {
            gpuInfoDiv.innerHTML = `<p>${data ? data.error : 'Could not fetch GPU info.'}</p>`;
            return;
        }

        data.forEach((gpu, index) => {
            const memoryUsagePercent = (gpu.memory_used / gpu.memory_total) * 100;
            // Cap temperature at 90 for bar display, but show real value in text
            const tempPercent = Math.min((gpu.temperature / 90) * 100, 100);

            const gpuElement = document.createElement('div');
            gpuElement.className = 'stat-container';
            gpuElement.innerHTML = `
                <h4>${gpu.name}</h4>
                <p>Temperature: ${gpu.temperature}°C (Max: 90°C)</p>
                <div class="progress-bar-container">
                    <div id="gpu-temp-bar-${index}" class="progress-bar temp-bar" style="width: ${tempPercent.toFixed(1)}%;"></div>
                </div>

                <p>Fan Speed: ${gpu.fan_speed}% (Max: 100%)</p>
                <div class="progress-bar-container">
                    <div id="gpu-fan-bar-${index}" class="progress-bar" style="width: ${gpu.fan_speed}%;"></div>
                </div>

                <p>GPU Utilization: ${gpu.utilization_gpu}%</p>
                <div class="progress-bar-container">
                    <div id="gpu-utilization-bar-${index}" class="progress-bar" style="width: ${gpu.utilization_gpu}%;"></div>
                </div>
                
                <p>Memory: ${formatBytes(gpu.memory_used)} / ${formatBytes(gpu.memory_total)}</p>
                <div class="progress-bar-container">
                    <div id="gpu-memory-bar-${index}" class="progress-bar" style="width: ${memoryUsagePercent.toFixed(1)}%;"></div>
                </div>
            `;
            gpuInfoDiv.appendChild(gpuElement);
        });
    };

    const updateOllamaInfo = async () => {
        const data = await fetchData('/api/ollama-info');
        const statusEl = document.getElementById('ollama-status');
        const modelsContainer = document.getElementById('ollama-models-container');
        const modelsList = document.getElementById('ollama-models-list');

        if (!data) {
            statusEl.textContent = 'Error';
            statusEl.style.color = '#ff4d4d';
            modelsContainer.style.display = 'none';
            return;
        }

        if (data.running) {
            statusEl.textContent = 'Running';
            statusEl.style.color = '#2ECC71';
            modelsContainer.style.display = 'block';
            modelsList.innerHTML = '';
            
            if (data.models && data.models.length > 0) {
                data.models.forEach(model => {
                    const li = document.createElement('li');
                    li.textContent = `${model.name} (Size: ${formatBytes(model.size)})`;
                    modelsList.appendChild(li);
                });
            } else {
                modelsList.innerHTML = '<li>No models are currently loaded.</li>';
            }

        } else {
            statusEl.textContent = 'Not Running';
            statusEl.style.color = '#ff4d4d';
            modelsContainer.style.display = 'none';
        }
    };

    const updateRunningApps = async () => {
        const data = await fetchData('/api/running-apps');
        const appListUl = document.getElementById('app-list');
        appListUl.innerHTML = '';

        if (!data) return;

        data.slice(0, 20).forEach(app => { // Limiting to first 20 for display
            const li = document.createElement('li');
            li.textContent = `${app.name} (PID: ${app.pid}, User: ${app.username}, CPU: ${app.cpu_percent.toFixed(1)}%, Mem: ${app.memory_percent.toFixed(1)}%)`;
            appListUl.appendChild(li);
        });
    };

    // Actions
    document.getElementById('run-script-btn').addEventListener('click', () => {
        postData('/api/run-script', { script_name: 'example.bat' });
    });

    // Add example start/stop buttons to actions div
    const actionsDiv = document.getElementById('actions');
    const startNotepadBtn = document.createElement('button');
    startNotepadBtn.textContent = 'Start Notepad';
    startNotepadBtn.addEventListener('click', () => {
        postData('/api/start-app', { app_name: 'notepad' });
    });
    actionsDiv.appendChild(startNotepadBtn);

    const stopNotepadBtn = document.createElement('button');
    stopNotepadBtn.textContent = 'Stop Notepad';
    stopNotepadBtn.addEventListener('click', () => {
        postData('/api/stop-app', { app_name: 'notepad' });
    });
    actionsDiv.appendChild(stopNotepadBtn);


    // Initial data fetch and periodic updates
    updateSystemInfo();
    updateGpuInfo();
    updateOllamaInfo();
    updateRunningApps();
    setInterval(updateSystemInfo, 3000);
    setInterval(updateGpuInfo, 5000);
    setInterval(updateOllamaInfo, 10000);
    setInterval(updateRunningApps, 10000);
}); 