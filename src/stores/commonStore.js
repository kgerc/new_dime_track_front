import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0NDU3MDAzNSwiZXhwIjoxNzQ1MTc0ODM0LCJpYXQiOjE3NDQ1NzAwMzV9.C8k-leWbt-HIdOb7AuUxvhcUydWAuyTdS4V6BKSmtNyt2WkqKufIgrxMFgqAY4wFJhXKfrADE5MqRfnuzfTsDg')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
