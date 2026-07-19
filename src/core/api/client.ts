import axios from 'axios';

// Base URL dari env. Fleksibel: boleh sudah menyertakan /api/v1 atau belum.
const raw = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
export const API_BASE_URL = /\/api\/v\d+$/.test(raw) ? raw : `${raw}/api/v1`;
// Origin tanpa /api/v1 — untuk akses media publik (mis. /m/:id).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});
