import axios from 'axios';

// Base URL dari env. Jika tidak ada /api, bisa disesuaikan, namun untuk kasus ini kita pakai as-is.
// PRD memakai base URL /api/tenant/*, jadi API_BASE_URL cukup origin backend + /api.
const raw = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
// PRD menyebut base URL memiliki awalan /api
export const API_BASE_URL = raw.endsWith('/api') ? raw : `${raw}/api`;
export const API_ORIGIN = raw.endsWith('/api') ? raw.replace(/\/api$/, '') : raw;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});
