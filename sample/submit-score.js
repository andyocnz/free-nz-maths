document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('score-form');
    const scoresUrlInput = document.getElementById('scores-url');
    const groupInput = document.getElementById('group-code');
    const studentInput = document.getElementById('student-name');
    const scoreInput = document.getElementById('score');
    const totalInput = document.getElementById('total');
    const percentInput = document.getElementById('percent');
    const durationInput = document.getElementById('duration');
    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');
    const ipInput = document.getElementById('ip-address');
    const wrongInput = document.getElementById('wrong-questions');
    const sendButton = document.getElementById('send-btn');

    const formStatus = document.getElementById('form-status');
    const requestSummary = document.getElementById('request-summary');
    const payloadPreview = document.getElementById('payload-preview');
    const responsePreview = document.getElementById('response-preview');

    const sanitizeDigits = (value, limit) => (value || '').toString().replace(/\D/g, '').slice(0, limit);
    const sanitizeGroupCode = value => sanitizeDigits(value, 7);

    const buildPayload = () => {
        const startIso = startInput.value ? new Date(startInput.value).toISOString() : '';
        const endIso = endInput.value ? new Date(endInput.value).toISOString() : '';
        const payload = {
            groupCode: sanitizeGroupCode(groupInput.value),
            studentName: studentInput.value.trim() || 'Anonymous',
            score: String(scoreInput.value || '0'),
            totalQuestions: String(totalInput.value || '0'),
            percent: String(percentInput.value || '0'),
            startTime: startIso,
            endTime: endIso,
            durationSec: String(durationInput.value || '0'),
            ipAddress: ipInput.value.trim(),
            wrongQuestions: wrongInput.value.trim() || '[]'
        };
        return payload;
    };

    const updatePreview = () => {
        const payload = buildPayload();
        payloadPreview.textContent = JSON.stringify(payload, null, 2);
    };

    const sendScore = async event => {
        event.preventDefault();
        const scoresUrl = scoresUrlInput.value.trim();
        const groupCode = sanitizeGroupCode(groupInput.value);
        if (!scoresUrl) {
            formStatus.textContent = 'Enter the scores endpoint URL.';
            return;
        }
        if (!groupCode) {
            formStatus.textContent = 'Enter a 7-digit group code.';
            return;
        }

        const payload = buildPayload();
        payload.groupCode = groupCode;
        payloadPreview.textContent = JSON.stringify(payload, null, 2);

        const formData = new FormData();
        formData.append('action', 'submitScore');
        Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

        sendButton.disabled = true;
        formStatus.textContent = 'Sending score…';
        requestSummary.textContent = `POST ${scoresUrl}`;
        responsePreview.textContent = 'Waiting for response…';

        try {
            const response = await fetch(scoresUrl, {
                method: 'POST',
                body: formData
            });
            const text = await response.text();
            responsePreview.textContent = `HTTP ${response.status} ${response.statusText}\n\n${text || '(empty response)'}`;
            formStatus.textContent = response.ok ? 'Score submitted successfully.' : 'Endpoint returned an error.';
        } catch (error) {
            responsePreview.textContent = error?.message || 'Request failed.';
            formStatus.textContent = 'Network or endpoint error.';
        } finally {
            sendButton.disabled = false;
        }
    };

    [
        groupInput,
        studentInput,
        scoreInput,
        totalInput,
        percentInput,
        durationInput,
        startInput,
        endInput,
        ipInput,
        wrongInput
    ].forEach(input => input.addEventListener('input', updatePreview));

    form.addEventListener('submit', sendScore);

    const params = new URLSearchParams(window.location.search);
    const paramGroup = sanitizeGroupCode(params.get('group'));
    const paramScores = params.get('scoresUrl') || params.get('scores');
    if (paramGroup) {
        groupInput.value = paramGroup;
    }
    if (paramScores) {
        scoresUrlInput.value = paramScores;
    }

    updatePreview();
});
