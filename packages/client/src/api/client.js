import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;

