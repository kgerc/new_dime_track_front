import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from 'src/api/axiosInstance' // Import the configured Axios instance
import { useCommonStore } from './commonStore'  // <-- import commonStore

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const user = ref(null)

  const router = useRouter()
  const commonStore = useCommonStore() // <-- use commonStore

  async function register(displayName, username, email, password) {
    try {
      const response = await api.post('account/register', {
        displayName,
        username,
        email,
        password
      })

      user.value = {
        username: response.data.username,
        displayName: response.data.displayName
      }

      // set token via commonStore
      commonStore.setToken(response.data.token)
      commonStore.setRefreshToken(response.data.refreshToken)
      isLoggedIn.value = true

      router.push('/overview')
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message)
      throw err.response?.data || err
    }
  }

  async function login(email, password) {
    try {
      const response = await api.post('account/login', {
        email,
        password
      })

      user.value = {
        username: response.data.username,
        displayName: response.data.displayName
      }

      // set token via commonStore
      commonStore.setToken(response.data.token)
      commonStore.setRefreshToken(response.data.refreshToken)
      isLoggedIn.value = true

      router.push('/overview')
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message)
      throw err.response?.data || err
    }
  }

  function logout() {
    isLoggedIn.value = false
    user.value = null
    commonStore.clearToken()  // <-- clear token in commonStore
    router.push('/')
  }

  function init() {
    const token = commonStore.getToken()
    if (token) {
      isLoggedIn.value = true
    }
  }

  return {
    isLoggedIn,
    user,
    register,
    login,
    logout,
    init
  }
})
