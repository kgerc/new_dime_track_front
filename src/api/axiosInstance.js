import axios from 'axios'
import { useCommonStore } from 'src/stores/commonStore'

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your actual API URL
})

// Attach Bearer token to every request
api.interceptors.request.use(config => {
  const commonStore = useCommonStore()
  const token = commonStore.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
},
async error => {
  const commonStore = useCommonStore()
  const originalRequest = error.config

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true

    // try to refresh token
    try {
      const res = await api.post('account/refresh-token', commonStore.refreshToken)
      commonStore.setToken(res.data.token)
      commonStore.setRefreshToken(res.data.refreshToken)
      originalRequest.headers['Authorization'] = `Bearer ${res.data.token}`
      return api(originalRequest)  // retry original request
    } catch (err) {
      commonStore.clearToken()
      window.location.href = '/'  // force login
    }
  }

  return Promise.reject(error)
}
)

export default api
