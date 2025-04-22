import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  const token = ref('eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImtyenlzIiwibmFtZWlkIjoiMmJiMjE5ZDUtYjkzZi00YmQ0LTljNmItZjRhNjlmNTEzY2Y1IiwiZW1haWwiOiJrcnp5c0B0ZXN0LmNvbSIsIm5iZiI6MTc0NTM0NTY2NCwiZXhwIjoxNzQ1OTUwNDY0LCJpYXQiOjE3NDUzNDU2NjR9.r0VHO_I5Ba4VFYNf91zVt9YlcLfmXNafHDTX_Y2ovH1JBc7yVoNFdHQl8pRO5h88YSkhjLob2be5q-pDo92vpQ')

  function setToken(newToken) {
    token.value = newToken
  }

  function clearToken() {
    token.value = null
  }

  return { token, setToken, clearToken }
})
