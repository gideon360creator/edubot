import axios from 'axios'
import { useAuthStore } from '../auth/auth-store'
import { env } from '@/env'

const baseURL = env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      useAuthStore.getState().logout()
    }

    // Extract message from server response if available
    const serverMessage = error.response?.data?.message
    if (serverMessage) {
      error.message = serverMessage
    }

    return Promise.reject(error)
  },
)
