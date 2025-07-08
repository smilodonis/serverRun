document.addEventListener('DOMContentLoaded', () => {
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

        document.getElementById('cpu-usage').textContent = data.cpu_usage.toFixed(1);
        document.getElementById('ram-usage').textContent = data.ram_usage.toFixed(1);
    };

    const updateGpuInfo = async () => {
        const data = await fetchData('/api/gpu-info');
        const gpuInfoDiv = document.getElementById('gpu-info');
        gpuInfoDiv.innerHTML = '';

        if (!data || data.error) {
            gpuInfoDiv.innerHTML = `<p>${data ? data.error : 'Could not fetch GPU info.'}</p>`;
            return;
        }

        data.forEach(gpu => {
            const gpuElement = document.createElement('div');
            gpuElement.innerHTML = `
                <h4>${gpu.name}</h4>
                <p>Temperature: ${gpu.temperature}°C</p>
                <p>Fan Speed: ${gpu.fan_speed}%</p>
                <p>GPU Utilization: ${gpu.utilization_gpu}%</p>
                <p>Memory: ${formatBytes(gpu.memory_used)} / ${formatBytes(gpu.memory_total)}</p>
            `;
            gpuInfoDiv.appendChild(gpuElement);
        });
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
    updateRunningApps();
    setInterval(updateSystemInfo, 3000);
    setInterval(updateGpuInfo, 5000);
    setInterval(updateRunningApps, 10000);
}); 