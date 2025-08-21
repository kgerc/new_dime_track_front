// src/stores/common.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref(null)   // no more hardcoded value

  function setToken(newToken) {
    token.value = newToken
    // optionally persist in localStorage
    localStorage.setItem('authToken', newToken)
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem('authToken')
  }

  // restore token from localStorage when store is initialized
  function initToken() {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return { token, setToken, clearToken, initToken }
})
