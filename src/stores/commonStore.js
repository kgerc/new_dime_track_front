import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiYmM4YjM4ZTYtY2M0YS00ZWJlLTkxZTAtOWE5ZGFkYjY4OWI3IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc1NDIyODYxOCwiZXhwIjoxNzU0ODMzNDE4LCJpYXQiOjE3NTQyMjg2MTh9.-CLT2W7hMFyoQgQPvMQ2DnJtwdTcdQEKW6Qfmud_x4PUS5PQDgPfVxfl5T-DDTCGHFawPZaRUAqz_n7lgCxi-A')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
