import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // ================= State =================
  // 对应原 state
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  // ================= Actions =================
  // 对应原 actions，直接写成普通函数
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // ================= 导出 =================
  // 必须 return 暴露 state 和 actions
  return {
    userInfo,
    token,
    setToken,
    setUserInfo,
    logout
  }
}, { persist: true })