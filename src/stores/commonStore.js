import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0Mzg2OTI2OSwiZXhwIjoxNzQ0NDc0MDY5LCJpYXQiOjE3NDM4NjkyNjl9.RBfBvB7VVks685_M1C-8zNjconnJGxSFRqib4oZAaYm7dW6ai7lTa8cWhFQFmpoaUtuFnvRqhIwHs0S02HfSUg')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
