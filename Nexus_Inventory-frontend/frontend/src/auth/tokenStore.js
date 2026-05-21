const TOKEN_KEY = 'nexus_token_v1';

export function getStoredToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredToken(tokenObj) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenObj));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('nexus:auth'));
}

export function decodeJwt(token) {
  // Minimal JWT decode (no signature verification). Backend already verifies.
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

