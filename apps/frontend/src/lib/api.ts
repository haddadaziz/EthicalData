// Force Vercel trigger build with updated variables env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur HTTP : ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}