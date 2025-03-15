import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0MjAyOTQxMywiZXhwIjoxNzQyNjM0MjEzLCJpYXQiOjE3NDIwMjk0MTN9.NF6bWkcPHaeNw-nNNo2u8RX7D-Hf_E1S6jegpPf08lOtyiYnau9LgEpW0QagjJKrx7wLW3rLAKwoy4WV2QlP5w')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
