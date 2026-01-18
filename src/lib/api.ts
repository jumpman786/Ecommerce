/**
 * API Configuration for AI Agent Backend
 */

// Use development endpoint when in dev mode
const DEV_ENDPOINT = 'http://localhost:8000';
const PROD_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT || 'https://api.yourdomain.com';

// @ts-ignore - __DEV__ is defined in React Native
export const API_ENDPOINT = typeof __DEV__ !== 'undefined' && __DEV__
  ? DEV_ENDPOINT
  : PROD_ENDPOINT;

/**
 * API endpoints
 */
export const ENDPOINTS = {
  customize: `${API_ENDPOINT}/api/customize`,
  generateTheme: `${API_ENDPOINT}/api/generate-theme`,
  generateImage: `${API_ENDPOINT}/api/generate-image`,
  themes: `${API_ENDPOINT}/api/themes`,
  health: `${API_ENDPOINT}/health`,
} as const;

/**
 * Check if the backend is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(ENDPOINTS.health);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch available themes from backend
 */
export async function fetchThemes(): Promise<string[]> {
  try {
    const response = await fetch(ENDPOINTS.themes);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data.themes || [];
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    return [];
  }
}

export default {
  API_ENDPOINT,
  ENDPOINTS,
  checkHealth,
  fetchThemes,
};
