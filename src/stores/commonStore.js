import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0MTQxNzYxMSwiZXhwIjoxNzQyMDIyNDExLCJpYXQiOjE3NDE0MTc2MTF9.cWjqhaHypgxMCzQwegcY7TT_tkt73OeK75or5MThYx1Ipp0Tj_c1KI9AclmkHussS4WfXvpN9hWYHb4MdLl1Ng')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
