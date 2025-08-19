// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const user = ref(null)

  const router = useRouter()

  function login(email, password) {
    // 👉 Here you would normally call your backend API
    // For now, just fake login
    if (email && password) {
      isLoggedIn.value = true
      user.value = { email }
      router.push('/overview') // redirect after login
    }
  }

  function register(email, password) {
    // 👉 Normally call backend to create user
    if (email && password) {
      // auto-login after register
      isLoggedIn.value = true
      user.value = { email }
      router.push('/overview')
    }
  }

  function logout() {
    isLoggedIn.value = false
    user.value = null
    router.push('/auth') // back to login page
  }

  return {
    isLoggedIn,
    user,
    login,
    register,
    logout
  }
})
