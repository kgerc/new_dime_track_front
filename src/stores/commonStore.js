import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0MzI1NjcxNiwiZXhwIjoxNzQzODU3OTE2LCJpYXQiOjE3NDMyNTY3MTZ9.XtO6GZOOBZ--WeBySJBY6Ii8jOxxNnsEjwvWSb9NL1RTsoNWHOyOxcpKmnSIcpT26opOEQYvNhSNPFFJzq47VQ')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
