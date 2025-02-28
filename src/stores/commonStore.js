import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0MDc3Mjg5MiwiZXhwIjoxNzQxMzc3NjkyLCJpYXQiOjE3NDA3NzI4OTJ9.wVAgk36BIcwO_4gNx4TdqJDnhjwpSrM1z-sDJcP3U4C4eaXZo0hscmzftoqwDC3S51vssgMeFxUoiXwlK459zQ')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
