import axios from 'axios';

// Same-origin '/api/v1' works both in dev (Vite proxy -> Express) and
// in prod (Express serves the built frontend + API from one origin).
const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// The backend's ApiResponse envelope is { success, message, data, meta }.
// Unwrap it here so calling code just works with `data` and `meta`
// directly instead of every hook repeating `res.data.data`.
client.interceptors.response.use(
  (res) => ({ data: res.data.data, meta: res.data.meta, message: res.data.message }),
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    const details = err.response?.data?.details;
    return Promise.reject(Object.assign(new Error(message), { details, status: err.response?.status }));
  }
);

export default client;
