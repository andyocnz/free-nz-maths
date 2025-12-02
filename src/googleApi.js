// src/googleApi.js
// This module handles communication with the Google Apps Script backend.

import { config } from './config';

/**
 * Registers a new group test session with the backend.
 * @param {object} data - The data to send to the registry.
 * @returns {Promise<Response>} The response from the fetch call.
 */
export async function registerGroup(data) {
  console.log('registerGroup received data:', data)
  console.log('data.teacherPin:', data?.teacherPin, 'type:', typeof data?.teacherPin)
  const formData = new URLSearchParams();
  formData.append('action', 'createGroup');
  for (const key in data) {
    formData.append(key, data[key]);
  }
  console.log('FormData entries:')
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: "${value}"`)
  }

  return fetch(config.REGISTRY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: formData,
  });
}

/**
 * Submits a student's score to the backend.
 * @param {object} data - The score data to submit.
 * @returns {Promise<Response>} The response from the fetch call.
 */
export async function submitScore(data) {
  const formData = new FormData();
  formData.append('action', 'submitScore');
  for (const key in data) {
    formData.append(key, data[key]);
  }

  return fetch(config.SCORES_URL, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Fetches the group registry data.
 * @param {{groupCode?: string, teacherPin?: string}} params
 * @returns {Promise<any>} A promise that resolves to the JSON registry data.
 */
export async function getRegistry(params = {}) {
  const url = new URL(config.REGISTRY_URL);
  if (params.groupCode) {
    url.searchParams.set('groupCode', params.groupCode);
  }
  if (params.teacherPin) {
    url.searchParams.set('teacherPin', params.teacherPin);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch group registry');
  }
  const data = await response.json();
  if (data && data.error) {
    throw new Error(data.error);
  }
  return data;
}

/**
 * Fetches submitted scores for a specific group code.
 * @param {string} groupCode - The 7-digit group code.
 * @returns {Promise<any[]>} Parsed JSON rows from the Google Sheet.
 */
export async function fetchGroupScores(groupCode, teacherPin) {
  const url = new URL(config.SCORES_URL);
  if (groupCode) {
    url.searchParams.set('groupCode', groupCode);
  }
  if (teacherPin) {
    url.searchParams.set('teacherPin', teacherPin);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch group scores');
  }
  const data = await response.json();
  if (data && data.error) {
    throw new Error(data.error);
  }
  return data;
}
