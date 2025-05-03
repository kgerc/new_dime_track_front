import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0NjI2NTI0MiwiZXhwIjoxNzQ2ODcwMDQyLCJpYXQiOjE3NDYyNjUyNDJ9.ODRHcawHiANcAMfsE0x4ZQZc1fRyvVAB8rf_IVKCnU1u7AjNs3VLXDrWVL0Qxd49ZxL_C7u3yZhv7EsQRk2vFw')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
