import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '',
  timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      if (res.code === 401) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        // 修正了 error.msg 的问题
        ElMessage.error(res.msg || '请求失败')
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res.data;
  },
  error => {
    // 补充：处理 401 未授权（Token 过期或无效）
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      // 修正了 error.msg 的问题
      ElMessage.error(error.response?.data?.msg || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)



export default request