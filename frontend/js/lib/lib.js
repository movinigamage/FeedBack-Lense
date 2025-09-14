// Shorthand DOM helpers
export const qs  = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

// Validation
export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

export function isStrongPassword(v) {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(v);
}

// Token helpers
const TOKEN_KEY = 'accessToken';
export const saveToken  = (t) => localStorage.setItem(TOKEN_KEY, t);
export const getToken   = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// UI helpers
export function toggleSubmitting(form, isOn) {
  const btn = form.querySelector('button[type="submit"]') || form.querySelector('.signin_signup-btn');
  if (btn) btn.disabled = !!isOn;
}

// Error helpers (your styling)
export function getErrorElement(input) {
  if (!input) return null;
  let group = input.closest('.form-group') || input.parentElement;
  if (!group) return null;
  let err = group.querySelector('.form-error-message');
  if (!err) {
    err = document.createElement('div');
    err.className = 'form-error-message';
    group.appendChild(err);
  }
  return err;
}

export function showError(input, message) {
  if (!input) return;
  const err = getErrorElement(input);
  if (err) err.textContent = message || '';
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
}

export function clearError(input) {
  if (!input) return;
  const err = getErrorElement(input);
  if (err) err.textContent = '';
  input.classList.remove('is-invalid', 'is-valid');
}

export function setValid(input) {
  clearError(input);
  input.classList.add('is-valid');
}

export function setFormError(form, message) {
  if (!form) return;
  let box = form.querySelector('.form-error-message.form-level');
  if (!box && message) {
    box = document.createElement('div');
    box.className = 'form-error-message form-level';
    const submit = form.querySelector('button[type="submit"]') || form.querySelector('.signin_signup-btn');
    if (submit) submit.insertAdjacentElement('beforebegin', box);
    else form.prepend(box);
  }
  if (box) {
    if (message) box.textContent = message;
    else box.remove();
  }
}