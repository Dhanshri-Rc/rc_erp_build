import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');
if (!apiUrl) throw new Error('VITE_API_URL is required for a production build');
export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 20000,
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.data?.message) err.message = err.response.data.message;
    if (err?.response?.status === 401 && !err.config?.url?.endsWith('/auth/login')) {
      window.dispatchEvent(new Event('rcerp:session-expired'));
    }
    return Promise.reject(err);
  },
);
export const unwrap = (p) => p.then((r) => r.data.data);
export const protectedFileUrl = (storedPath) => {
  const filename = String(storedPath || '').replaceAll('\\', '/').split('/').pop();
  return `${api.defaults.baseURL}/files/${encodeURIComponent(filename)}`;
};
