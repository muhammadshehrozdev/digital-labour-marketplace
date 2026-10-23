import axios from 'axios';

const API = axios.create({
  baseURL: 'https://digital-labour-marketplace-1qhz.vercel.app/', // Local testing ke liye direct 5000 port
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;