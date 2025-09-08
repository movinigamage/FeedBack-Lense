const API_BASE = 'http://localhost:4000/api/v1';

// Import token helpers from lib
import { getToken } from '../lib/lib.js';

// Get authentication token
export function getAuthToken() {
  return getToken();
}

// Get authentication headers
export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// POST JSON helper
export async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  return { res, data };
}

// POST JSON with authentication
export async function postJSONAuth(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(body)
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  return { res, data };
}

// GET JSON helper
export async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  let data = null;
  try { data = await res.json(); } catch (_) {}

  return { res, data };
}

// GET JSON with authentication
export async function getJSONAuth(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  return { res, data };
}

// Authentication validation helper
export function validateToken() {
  const token = getAuthToken();
  if (!token) {
    return false;
  }
  
  try {
    // Check if token is expired (basic check)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Date.now() / 1000;
    
    return payload.exp > now;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

// Redirect to login if not authenticated
export function requireAuth() {
  if (!validateToken()) {
    console.log('Authentication required - redirecting to login');
    window.location.href = '../auth/signin.html';
    return false;
  }
  return true;
}

// Survey API functions
export async function createSurvey(surveyData) {
  try {
    const { res, data } = await postJSONAuth('/surveys/create', surveyData);
    return { success: res.ok, data, status: res.status };
  } catch (error) {
    console.error('API Error in createSurvey:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getUserSurveys() {
  try {
    const { res, data } = await getJSONAuth('/surveys/created');
    return { success: res.ok, data, status: res.status };
  } catch (error) {
    console.error('API Error in getUserSurveys:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Dashboard API functions
export async function getDashboardStats() {
  try {
    const { res, data } = await getJSONAuth('/dashboard/user/stats');
    return { success: res.ok, data, status: res.status };
  } catch (error) {
    console.error('API Error in getDashboardStats:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getQuickSummary() {
  try {
    const { res, data } = await getJSONAuth('/dashboard/user/summary');
    return { success: res.ok, data, status: res.status };
  } catch (error) {
    console.error('API Error in getQuickSummary:', error);
    return { success: false, error: 'Network error occurred' };
  }
}