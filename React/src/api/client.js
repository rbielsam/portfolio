const BASE_URL = '/api';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function csrfHeaders() {
  const token = getCookie('XSRF-TOKEN');
  return token ? { 'X-XSRF-TOKEN': token } : {};
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const isFormData = options.body instanceof FormData;

  const config = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...csrfHeaders(),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  if (response.ok) {
    return response.json();
  }

  const data = await response.json().catch(() => null);
  const mensaje = data?.message || Object.values(data?.errors || {}).flat()[0] || '';

  const error = new Error(mensaje);
  error.status = response.status;
  throw error;
}

export async function fetchCsrfCookie() {
  await fetch('/sanctum/csrf-cookie', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData, method = 'POST') => request(path, { method, body: formData }),
};

export default api;
