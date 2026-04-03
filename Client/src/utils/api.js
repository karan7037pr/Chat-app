import axios from 'axios'

const api = axios.create({
  baseURL: 'https://chat-app-server-7esk.onrender.com',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api