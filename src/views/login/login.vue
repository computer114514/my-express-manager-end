<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>后台管理系统</h2>
                <p>欢迎登录</p>
            </div>

            <!-- 登录表单 -->
            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                size="large"
                @keyup.enter="handleLogin"
            >
                <el-form-item prop="account">
                    <el-input
                        v-model="loginForm.account"
                        placeholder="请输入账号"
                        :prefix-icon="User"
                        clearable
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                        clearable
                    />
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        :loading="loading"
                        class="login-btn"
                        @click="handleLogin"
                    >
                        {{ loading ? '登录中...' : '登 录' }}
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

// 1. 引入 API 方法
import { login } from '@/api/admin'

// 2. 引入 Store（注意：你代码里导出的是 useUserStore）
import { useUserStore } from '@/store/index'

// ================= 初始化 =================
const router = useRouter()
const { setToken, setUserInfo } = useUserStore()

// ================= 表单数据 =================
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
    account: '',
    password: ''
})

// 表单校验规则
const loginRules = {
    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
}

// ================= 登录逻辑 =================
const handleLogin = async () => {
    // 1. 表单校验
    const formEl = loginFormRef.value
    if (!formEl) return
    await formEl.validate().catch(() => {
        // 校验不通过，直接中断
        throw new Error('表单校验失败')
    })

    // 2. 发起登录请求
    loading.value = true
    try {
        // 拦截器已解包，res 就是 data 层：{ token, infoVO }
        const res = await login({
            account: loginForm.account,
            password: loginForm.password
        })

        // 3. 保存 Token 和用户信息
        setToken(res.token)
        setUserInfo(res.infoVO)

        ElMessage.success('登录成功')

        // 4. 跳转到首页
        router.push('/dashboard')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    width: 420px;
    padding: 40px 36px 24px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
    text-align: center;
    margin-bottom: 32px;
}

.login-header h2 {
    font-size: 24px;
    color: #303133;
    margin: 0 0 8px;
}

.login-header p {
    font-size: 14px;
    color: #909399;
    margin: 0;
}

.login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    letter-spacing: 4px;
}
</style>
