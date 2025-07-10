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

    let invokeai_batch_start_completed_count = -1;
    let invokeai_batch_total_items = 0;
    let currently_loaded_ollama_model = '';

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
        const ollamaToggle = document.getElementById('ollama-toggle');
        const modelSelector = document.getElementById('ollama-model-selector');
        const gpuBadge = document.getElementById('ollama-gpu-badge');

        if (!data) {
            statusEl.textContent = 'Error';
            statusEl.style.color = '#ff4d4d';
            modelsContainer.style.display = 'none';
            ollamaToggle.disabled = true;
            modelSelector.disabled = true;
            gpuBadge.style.display = 'none';
            return;
        }

        ollamaToggle.disabled = false;
        ollamaToggle.checked = data.running;

        if (data.running) {
            let statusText = 'Running';
            // This part is now handled by the badge
            // if (data.gpu_index !== undefined && data.gpu_index !== -1) {
            //     statusText += ` (GPU ${data.gpu_index})`;
            // }
            statusEl.textContent = statusText;
            statusEl.style.color = '#2ECC71';
            modelsContainer.style.display = 'block';
            modelSelector.disabled = false;
            modelsList.innerHTML = '';

            if (data.gpu_name) {
                gpuBadge.textContent = data.gpu_name;
                gpuBadge.style.display = 'inline-block';
            } else {
                gpuBadge.style.display = 'none';
            }
            
            if (data.models && data.models.length > 0) {
                currently_loaded_ollama_model = data.models[0].name; // Assuming one model loaded at a time
                data.models.forEach(model => {
                    const li = document.createElement('li');
                    li.textContent = `${model.name} (Size: ${formatBytes(model.size)})`;
                    modelsList.appendChild(li);
                });
            } else {
                currently_loaded_ollama_model = '';
                modelsList.innerHTML = '<li>No models are currently loaded.</li>';
            }

        } else {
            statusEl.textContent = 'Not Running';
            statusEl.style.color = '#ff4d4d';
            modelsContainer.style.display = 'none';
            modelSelector.disabled = true;
            gpuBadge.style.display = 'none';
        }
    };

    const populateOllamaModelSelector = async () => {
        const modelSelector = document.getElementById('ollama-model-selector');
        const models = await fetchData('/api/ollama/models');
        modelSelector.innerHTML = '<option value="">-- Select a model --</option>'; // Placeholder
        if (models) {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = model.name;
                modelSelector.appendChild(option);
            });
        }
    };

    document.getElementById('ollama-toggle').addEventListener('change', (event) => {
        const action = event.target.checked ? 'start' : 'stop';
        postData('/api/ollama/toggle', { action: action }).then(() => {
            // Re-check status after a short delay to allow the server to respond
            setTimeout(() => {
                updateOllamaInfo();
                if(action === 'start') {
                    populateOllamaModelSelector();
                }
            }, 1000);
        });
    });

    document.getElementById('ollama-model-selector').addEventListener('change', (event) => {
        const selectedModel = event.target.value;
        if (!selectedModel) return;

        const changeModel = async () => {
            // 1. Unload the old model if one is loaded
            if (currently_loaded_ollama_model) {
                await postData('/api/ollama/unload', { model: currently_loaded_ollama_model });
            }
            // 2. Load the new model
            await postData('/api/ollama/load', { model: selectedModel });
            // 3. Refresh the UI
            setTimeout(updateOllamaInfo, 1000); // Give it a second to update
        };
        
        changeModel();
    });

    const updateInvokeAIInfo = async () => {
        const data = await fetchData('/api/invokeai-info');
        const statusEl = document.getElementById('invokeai-status');
        const generatingEl = document.getElementById('invokeai-generating-status');
        const queueContainer = document.getElementById('invokeai-queue-container');
        const queueProgressEl = document.getElementById('invokeai-queue-progress');
        const invokeaiToggle = document.getElementById('invokeai-toggle');

        if (!data) {
            statusEl.textContent = 'Error';
            statusEl.style.color = '#ff4d4d';
            generatingEl.textContent = 'Unknown';
            queueContainer.style.display = 'none';
            invokeaiToggle.disabled = true;
            return;
        }

        invokeaiToggle.disabled = false;
        invokeaiToggle.checked = data.running;

        if (data.running) {
            statusEl.textContent = 'Running';
            statusEl.style.color = '#2ECC71';
            
            if (data.is_generating) {
                generatingEl.textContent = 'Yes';
                generatingEl.style.color = '#2ECC71';
            } else {
                generatingEl.textContent = 'No';
                generatingEl.style.color = 'var(--primary-text-color)';
            }

            if (data.queue) {
                const q = data.queue;
                const active_items = q.pending + q.in_progress;

                // A new batch is detected if there are active items and we were not previously tracking a batch.
                if (active_items > 0 && invokeai_batch_start_completed_count === -1) {
                    invokeai_batch_start_completed_count = q.completed + q.failed + q.canceled;
                    invokeai_batch_total_items = active_items;
                }

                // If we are tracking a batch, update the progress.
                if (invokeai_batch_start_completed_count !== -1) {
                    queueContainer.style.display = 'block';
                    const processed_in_batch = (q.completed + q.failed + q.canceled) - invokeai_batch_start_completed_count;
                    queueProgressEl.textContent = `${processed_in_batch}/${invokeai_batch_total_items}`;
                } else {
                    queueContainer.style.display = 'none';
                }

                // If the batch is finished, reset the tracking variables.
                if (active_items === 0 && invokeai_batch_start_completed_count !== -1) {
                    invokeai_batch_start_completed_count = -1;
                    invokeai_batch_total_items = 0;
                    queueContainer.style.display = 'none';
                }
            } else {
                 queueContainer.style.display = 'none';
            }

        } else {
            statusEl.textContent = 'Not Running';
            statusEl.style.color = '#ff4d4d';
            generatingEl.textContent = 'N/A';
            queueContainer.style.display = 'none';
             // Also reset batch tracking if the server goes down
            invokeai_batch_start_completed_count = -1;
            invokeai_batch_total_items = 0;
        }
    };

    document.getElementById('invokeai-toggle').addEventListener('change', (event) => {
        const action = event.target.checked ? 'start' : 'stop';
        postData('/api/invokeai/toggle', { action: action }).then(() => {
            // Re-check status after a short delay to allow the server to respond
            setTimeout(updateInvokeAIInfo, 1000);
        });
    });

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
    updateOllamaInfo().then(() => {
        if (document.getElementById('ollama-toggle').checked) {
            populateOllamaModelSelector();
        }
    });
    updateInvokeAIInfo();
    updateRunningApps();
    setInterval(updateSystemInfo, 3000);
    setInterval(updateGpuInfo, 5000);
    setInterval(updateOllamaInfo, 10000);
    setInterval(updateInvokeAIInfo, 5000);
    setInterval(updateRunningApps, 10000);
}); 