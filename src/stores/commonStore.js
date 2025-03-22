import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0MjY1MTUxOCwiZXhwIjoxNzQzMjU2MzE4LCJpYXQiOjE3NDI2NTE1MTh9.vMf32FhIzA93d1Z5C-AF4cBr0cO5PW4rSz5UFDxzI4wi5yL-vm41auPPp_AJ1cfojXPDYIGgguLwvR80z6oj6Q')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
