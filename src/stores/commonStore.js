// src/stores/common.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref(null)   // no more hardcoded value
  const refreshToken = ref(null)

  function setToken(newToken) {
    token.value = newToken
    // optionally persist in localStorage
    localStorage.setItem('authToken', newToken)
  }

  function setRefreshToken(newRefreshToken) {
    refreshToken.value = newRefreshToken
  }

  function clearToken() {
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('authToken')
  }

  // restore token from localStorage when store is initialized
  function initToken() {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      token.value = savedToken
    }
  }

  function getToken() {
    return localStorage.getItem('authToken')
  }

  return { token, setToken, clearToken, initToken, setRefreshToken, getToken }
})
