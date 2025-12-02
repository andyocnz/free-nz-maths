document.addEventListener('DOMContentLoaded', () => {
    const registryUrlInput = document.getElementById('registry-url');
    const scoresUrlInput = document.getElementById('scores-url');
    const groupInput = document.getElementById('group-code');
    const pinInput = document.getElementById('teacher-pin');
    const loadButton = document.getElementById('load-btn');
    const globalStatus = document.getElementById('global-status');

    const registryStatus = document.getElementById('registry-status');
    const registryWarning = document.getElementById('registry-warning');
    const registryHead = document.getElementById('registry-head');
    const registryBody = document.getElementById('registry-body');
    const registryRaw = document.getElementById('registry-raw');

    const scoresStatus = document.getElementById('scores-status');
    const scoresHead = document.getElementById('scores-head');
    const scoresBody = document.getElementById('scores-body');
    const scoresRaw = document.getElementById('scores-raw');

    const requestSummary = document.getElementById('request-summary');
    const registryRequest = document.getElementById('registry-request');
    const scoresRequest = document.getElementById('scores-request');

    const sanitizeDigits = (value, maxLen) => (value || '').toString().replace(/\D/g, '').slice(0, maxLen);
    const sanitizeGroupCode = value => sanitizeDigits(value, 7);
    const sanitizePin = value => sanitizeDigits(value, 4);
    const normalizeKey = key => (key || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const getField = (row = {}, targetKey = '') => {
        if (!row || typeof row !== 'object') return '';
        if (Object.prototype.hasOwnProperty.call(row, targetKey)) return row[targetKey];
        const normalizedTarget = normalizeKey(targetKey);
        for (const key of Object.keys(row)) {
            if (normalizeKey(key) === normalizedTarget) {
                return row[key];
            }
        }
        return '';
    };

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
            if (value !== undefined && value !== null && value !== '') {
                requestUrl.searchParams.set(key, value);
            }
        });
        const response = await fetch(requestUrl.toString());
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            if (json && json.error) {
                throw new Error(json.error);
            }
            const rows = Array.isArray(json) ? json : [];
            return { rows, raw: JSON.stringify(json, null, 2), request: requestUrl.toString() };
        } catch (error) {
            throw new Error(`Invalid JSON: ${text.slice(0, 140)}${text.length > 140 ? '…' : ''}`);
        }
    };

    const explainPinMismatch = (rows, triedPin) => {
        const storedPins = rows
            .map(row => sanitizePin(getField(row, 'teacherPin')))
            .filter(Boolean);
        const uniquePins = Array.from(new Set(storedPins));
        const pinText = uniquePins.length ? uniquePins.join(', ') : 'none stored';
        return `
            PIN mismatch – you entered <strong>${triedPin || '(blank)'}</strong>,
            but the rows returned have stored PIN(s): <strong>${pinText}</strong>.
            Inspect the Raw registry JSON below to confirm what the sheet returned.
        `;
    };

    const updateStatuses = text => {
        globalStatus.textContent = text;
    };

    const loadData = async (options = {}) => {
        const registryUrlRaw = registryUrlInput.value.trim();
        const scoresUrlRaw = scoresUrlInput.value.trim();
        const registryUrl = options.registryUrl || registryUrlRaw;
        const scoresUrl = options.scoresUrl || scoresUrlRaw;
        const groupCode = options.groupCode || sanitizeGroupCode(groupInput.value.trim());
        const teacherPin = options.teacherPin || sanitizePin(pinInput.value.trim());

        if (!registryUrl || !scoresUrl) {
            updateStatuses('Provide both Registry and Scores URLs.');
            return false;
        }
        if (!groupCode) {
            updateStatuses('Enter a 7-digit group code.');
            return false;
        }

        updateStatuses(`Loading data for group ${groupCode}…`);
        registryStatus.textContent = 'Loading registry…';
        registryWarning.innerHTML = '';
        registryHead.innerHTML = '';
        registryBody.innerHTML = '<tr><td>Loading…</td></tr>';
        registryRaw.textContent = '[]';
        registryRequest.textContent = 'Loading…';

        scoresStatus.textContent = 'Waiting for registry to succeed…';
        scoresHead.innerHTML = '';
        scoresBody.innerHTML = '<tr><td>Waiting…</td></tr>';
        scoresRaw.textContent = '[]';
        scoresRequest.textContent = 'Waiting…';
        requestSummary.textContent = 'Fetching registry…';

        let registrySucceeded = false;
        try {
            const registryResult = await fetchSheet(registryUrl, { groupCode, teacherPin });
            registryRequest.textContent = registryResult.request;
            requestSummary.textContent = `Registry request: ${registryResult.request}`;
            registryRaw.textContent = registryResult.raw;
            const filtered = registryResult.rows.filter(row => {
                const code = sanitizeGroupCode(getField(row, 'groupCode'));
                return code === groupCode;
            });
            const summary = [
                `${registryResult.rows.length} row(s) returned`,
                `${filtered.length} matched group ${groupCode}`
            ];
            registryStatus.textContent = summary.join(' • ');

            if (!filtered.length) {
                registryWarning.innerHTML = `
                    <p class="warning">
                        No registry row matched the group code. Scroll down to inspect the raw JSON.
                    </p>
                `;
            } else {
                const pinMatches = filtered.filter(row => sanitizePin(getField(row, 'teacherPin')) === teacherPin);
                if (teacherPin && !pinMatches.length) {
                    registryWarning.innerHTML = `<p class="warning">${explainPinMismatch(filtered, teacherPin)}</p>`;
                } else {
                    registryWarning.innerHTML = '';
                }
            }

            renderTable(registryHead, registryBody, registryResult.rows);
            registrySucceeded = true;
        } catch (error) {
            registryStatus.textContent = `Failed: ${error.message}`;
            registryWarning.innerHTML = '';
            registryHead.innerHTML = '';
            registryBody.innerHTML = `<tr><td>${error.message}</td></tr>`;
            registryRequest.textContent = 'Error';
            updateStatuses(`Registry lookup failed: ${error.message}`);
            requestSummary.textContent = 'Registry request failed.';
            scoresStatus.textContent = 'Skipped scores because registry failed.';
            scoresHead.innerHTML = '';
            scoresBody.innerHTML = '<tr><td>Registry must load before scores.</td></tr>';
            scoresRequest.textContent = 'Skipped';
            updateStatuses(`Registry lookup failed: ${error.message}. Scores fetch skipped.`);
            return false;
        }

        if (!registrySucceeded) {
            return false;
        }

        try {
            scoresStatus.textContent = 'Loading scores…';
            const scoresResult = await fetchSheet(scoresUrl, { groupCode });
            scoresRequest.textContent = scoresResult.request;
            requestSummary.textContent = `Scores request: ${scoresResult.request}`;
            scoresRaw.textContent = scoresResult.raw;
            const filtered = scoresResult.rows.filter(row => {
                const code = sanitizeGroupCode(getField(row, 'groupCode'));
                return code === groupCode;
            });
            const summary = [
                `${scoresResult.rows.length} row(s) returned`,
                `${filtered.length} matched group ${groupCode}`
            ];
            scoresStatus.textContent = summary.join(' • ');
            renderTable(scoresHead, scoresBody, scoresResult.rows);
            updateStatuses(`Loaded registry + scores for ${groupCode}.`);
            requestSummary.textContent = `Registry + scores fetched for ${groupCode}.`;
            return true;
        } catch (error) {
            scoresStatus.textContent = `Failed: ${error.message}`;
            scoresHead.innerHTML = '';
            scoresBody.innerHTML = `<tr><td>${error.message}</td></tr>`;
            updateStatuses(`Scores lookup failed: ${error.message}`);
            scoresRequest.textContent = 'Error';
            requestSummary.textContent = 'Scores request failed.';
            return false;
        }
    };

    loadButton.addEventListener('click', loadData);
    [groupInput, pinInput].forEach(input => {
        input.addEventListener('keyup', event => {
            if (event.key === 'Enter') {
                loadData();
            }
        });
    });

    const params = new URLSearchParams(window.location.search);
    const paramGroup = sanitizeGroupCode(params.get('group'));
    const paramPin = sanitizePin(params.get('pin'));
    const paramRegistry = params.get('registryUrl') || params.get('registry');
    const paramScores = params.get('scoresUrl') || params.get('scores');
    if (paramGroup) groupInput.value = paramGroup;
    if (paramPin) pinInput.value = paramPin;
    if (paramRegistry) registryUrlInput.value = paramRegistry;
    if (paramScores) scoresUrlInput.value = paramScores;

    if (paramGroup) {
        loadData({
            groupCode: paramGroup,
            teacherPin: paramPin,
            registryUrl: paramRegistry || registryUrlInput.value.trim(),
            scoresUrl: paramScores || scoresUrlInput.value.trim()
        });
    }
});
