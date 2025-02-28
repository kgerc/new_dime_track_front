import axios from 'axios'
import { useCommonStore } from 'src/stores/commonStore'

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your actual API URL
})

// Attach Bearer token to every request
api.interceptors.request.use(config => {
  const commonStore = useCommonStore()
  const token = commonStore.token
  debugger;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export default api
