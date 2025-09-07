const API_BASE = 'http://localhost:4000/api/v1';

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

// GET JSON helper
export async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  let data = null;
  try { data = await res.json(); } catch (_) {}

  return { res, data };
}