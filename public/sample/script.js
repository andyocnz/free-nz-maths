document.addEventListener('DOMContentLoaded', () => {
    const registryContainer = document.getElementById('registry-data');
    const scoresContainer = document.getElementById('scores-data');
    const registryInput = document.getElementById('registryGroupCode');
    const registryPinInput = document.getElementById('registryPin');
    const registryButton = document.getElementById('registryButton');

    const APP_SCRIPT_REGISTRY_URL = 'https://script.google.com/macros/s/AKfycbxCeRbxwZLESKhge29qEY-r87RjHYnEt8-EejPwV81FNkkxGpkskLpzegoq8vFyO5PC/exec';
    const APP_SCRIPT_SCORES_URL = 'https://script.google.com/macros/s/AKfycbwm8iDHRIfMpHby7bqoq4LpGeGHTc9vqIYd6ZRHEHjcd014aj1L3t8ml3kFbWVoQuNinQ/exec';

    const displayData = (target, rows, emptyText) => {
        if (!rows.length) {
            target.innerHTML = `<p>${emptyText}</p>`;
            return;
        }
        target.innerHTML = '';
        rows.forEach(item => {
            const div = document.createElement('div');
            div.className = 'data-item';
            Object.keys(item).forEach(key => {
                const p = document.createElement('p');
                p.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
                div.appendChild(p);
            });
            target.appendChild(div);
        });
    };

    const fetchSheet = async (url, groupCode, pin) => {
        const requestUrl = new URL(url);
        requestUrl.searchParams.set('groupCode', groupCode);
        if (pin) requestUrl.searchParams.set('teacherPin', pin);
        const response = await fetch(requestUrl.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data && data.error) throw new Error(data.error);
        return Array.isArray(data) ? data : [];
    };

    const loadRegistryAndScores = async () => {
        const numericGroupCode = registryInput.value.trim().replace(/\D/g, '');
        const numericPin = registryPinInput.value.trim().replace(/\D/g, '').slice(0, 4);
        if (!numericGroupCode) {
            registryContainer.innerHTML = '<p style="color:red;">Enter a numeric group code.</p>';
            scoresContainer.innerHTML = '<p style="color:red;">Enter a numeric group code.</p>';
            return;
        }
        if (numericPin.length < 4) {
            registryContainer.innerHTML = '<p style="color:red;">Enter the 4-digit teacher PIN.</p>';
            scoresContainer.innerHTML = '<p style="color:red;">Enter the 4-digit teacher PIN.</p>';
            return;
        }

        registryContainer.innerHTML = '<p>Loading registry…</p>';
        scoresContainer.innerHTML = '<p>Waiting for registry validation…</p>';

        try {
            const registryRows = await fetchSheet(APP_SCRIPT_REGISTRY_URL, numericGroupCode);
            const filteredRegistry = registryRows.filter(row => {
                const code = (row.groupCode || row.groupcode || '').toString().replace(/\D/g, '');
                return code === numericGroupCode;
            });
            const pinMatches = filteredRegistry.filter(row => {
                const storedPin = (row.teacherPin || row.teacherpin || '').toString().replace(/\D/g, '').slice(0, 4);
                return storedPin === numericPin;
            });
            if (!pinMatches.length) {
                throw new Error('Incorrect teacher PIN or group code.');
            }
            console.log('Registry data:', pinMatches);
            displayData(registryContainer, pinMatches, 'No registry entries found.');

            scoresContainer.innerHTML = '<p>Loading student attempts…</p>';
            const scoreRows = await fetchSheet(APP_SCRIPT_SCORES_URL, numericGroupCode);
            const filteredScores = scoreRows.filter(row => {
                const code = (row.groupCode || row.groupcode || '').toString().replace(/\D/g, '');
                return code === numericGroupCode;
            });
            console.log('Score data:', filteredScores);
            displayData(scoresContainer, filteredScores, 'No student attempts yet.');
        } catch (error) {
            console.error('Lookup error:', error);
            registryContainer.innerHTML = `<p style="color:red;">Failed to load registry: ${error.message}</p>`;
            scoresContainer.innerHTML = `<p style="color:red;">Failed to load scores: ${error.message}</p>`;
        }
    };

    registryButton.addEventListener('click', loadRegistryAndScores);
    ['keyup'].forEach(eventName => {
        registryInput.addEventListener(eventName, e => {
            if (e.key === 'Enter') loadRegistryAndScores();
        });
        registryPinInput.addEventListener(eventName, e => {
            if (e.key === 'Enter') loadRegistryAndScores();
        });
    });
});
