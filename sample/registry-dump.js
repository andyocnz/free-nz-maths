document.addEventListener('DOMContentLoaded', () => {
    const registryStatus = document.getElementById('registry-status');
    const registryHead = document.getElementById('registry-head');
    const registryBody = document.getElementById('registry-body');
    const registryRaw = document.getElementById('registry-raw');
    const groupMeta = document.getElementById('group-meta');

    const scoresStatus = document.getElementById('scores-status');
    const scoresHead = document.getElementById('scores-head');
    const scoresBody = document.getElementById('scores-body');
    const scoresRaw = document.getElementById('scores-raw');

    const APP_SCRIPT_REGISTRY_URL = 'https://script.google.com/macros/s/AKfycbwJ-ZTs2TvnjAMDlH0keq9TZFXfhY9O2QxNpBdEBw5eg7GcTqZGpqJZyoyZh4nbJ1H9bw/exec';
    const APP_SCRIPT_SCORES_URL = 'https://script.google.com/macros/s/AKfycbxq7vSIEjjtPFoB7bbtr-wYv0dBYP1MZzQvpeIqyYSdl-9hCHOUyvblN60DEc2BBei8lw/exec';

    const sanitizeDigits = (value, limit) => (value || '').toString().replace(/\D/g, '').slice(0, limit);
    const urlParams = new URLSearchParams(window.location.search);
    const groupCode = sanitizeDigits(urlParams.get('group'), 7);
    const teacherPin = sanitizeDigits(urlParams.get('pin'), 4);

    const renderTable = (headEl, bodyEl, rows) => {
        if (!rows.length) {
            headEl.innerHTML = '';
            bodyEl.innerHTML = '<tr><td>No rows returned.</td></tr>';
            return;
        }
        const columns = Array.from(rows.reduce((set, row) => {
            Object.keys(row || {}).forEach(key => set.add(key));
            return set;
        }, new Set()));
        if (!columns.length) columns.push('value');

        const headRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headRow.appendChild(th);
        });
        headEl.innerHTML = '';
        headEl.appendChild(headRow);

        bodyEl.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                const value = row && Object.prototype.hasOwnProperty.call(row, column) ? row[column] : '';
                td.textContent = value === undefined || value === null ? '' : value;
                tr.appendChild(td);
            });
            bodyEl.appendChild(tr);
        });
    };

    const fetchSheet = async (url, params = {}) => {
        const requestUrl = new URL(url);
        Object.entries(params).forEach(([key, value]) => {
            if (value) requestUrl.searchParams.set(key, value);
        });
        const response = await fetch(requestUrl.toString());
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            if (json && json.error) {
                throw new Error(json.error);
            }
            return Array.isArray(json) ? json : [];
        } catch {
            throw new Error(`Invalid JSON: ${text.slice(0, 140)}${text.length > 140 ? '…' : ''}`);
        }
    };

    const showMissingParams = () => {
        const help = 'Add ?group=7482915&pin=1234 to the URL (replace with your values).';
        groupMeta.textContent = 'Waiting for group code. ' + help;
        registryStatus.textContent = 'Provide group/pin via URL to load registry.';
        scoresStatus.textContent = 'Provide group via URL to load scores.';
        registryHead.innerHTML = '';
        registryBody.innerHTML = `<tr><td>${help}</td></tr>`;
        scoresHead.innerHTML = '';
        scoresBody.innerHTML = `<tr><td>${help}</td></tr>`;
        registryRaw.textContent = '[]';
        scoresRaw.textContent = '[]';
    };

    const loadAll = async () => {
        if (!groupCode) {
            showMissingParams();
            return;
        }

        groupMeta.textContent = `group=${groupCode}${teacherPin ? ` • pin=${teacherPin}` : ''}`;

        try {
            registryStatus.textContent = 'Loading registry…';
            const registryRows = await fetchSheet(APP_SCRIPT_REGISTRY_URL, {
                groupCode,
                teacherPin
            });
            registryStatus.textContent = `Loaded ${registryRows.length} registry row(s).`;
            registryRaw.textContent = JSON.stringify(registryRows, null, 2);
            renderTable(registryHead, registryBody, registryRows);
        } catch (error) {
            registryStatus.textContent = `Failed to load registry: ${error.message}`;
            registryHead.innerHTML = '';
            registryBody.innerHTML = `<tr><td>${error.message}</td></tr>`;
            registryRaw.textContent = error.message;
        }

        try {
            scoresStatus.textContent = 'Loading scores…';
            const scoreRows = await fetchSheet(APP_SCRIPT_SCORES_URL, { groupCode });
            scoresStatus.textContent = `Loaded ${scoreRows.length} score row(s).`;
            scoresRaw.textContent = JSON.stringify(scoreRows, null, 2);
            renderTable(scoresHead, scoresBody, scoreRows);
        } catch (error) {
            scoresStatus.textContent = `Failed to load scores: ${error.message}`;
            scoresHead.innerHTML = '';
            scoresBody.innerHTML = `<tr><td>${error.message}</td></tr>`;
            scoresRaw.textContent = error.message;
        }
    };

    loadAll();
});
