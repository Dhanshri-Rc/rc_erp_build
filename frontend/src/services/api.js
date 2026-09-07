import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 20000,
});
api.interceptors.response.use(
  (r) => r,
  (err) =>
    Promise.reject(
      err?.response?.data || { message: "Unable to reach server" },
    ),
);
export const unwrap = (p) => p.then((r) => r.data.data);
