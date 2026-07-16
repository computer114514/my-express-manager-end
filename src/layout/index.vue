<template>
    <el-container class="layout-container">
        <!-- 左侧菜单栏 -->
        <el-aside width="200px">
            <div class="logo">
                <h2>后台管理</h2>
            </div>
            <el-menu
                :default-active="activeMenu"
                router
                class="el-menu-vertical"
                background-color="#304156"
                text-color="#bfcbd9"
                active-text-color="#409EFF"
            >
                <el-menu-item index="/dashboard">
                    <el-icon><Odometer /></el-icon>
                    <span>仪表盘</span>
                </el-menu-item>
                <el-menu-item index="/user">
                    <el-icon><Box /></el-icon>
                    <span>快递员管理</span>
                </el-menu-item>
                <el-menu-item index="/organ">
                    <el-icon><Setting /></el-icon>
                    <span>机构管理</span>
                </el-menu-item>
                <!-- <el-menu-item index="/test">
                    <el-icon><Coordinate /></el-icon>
                    <span>测试页面</span>
                </el-menu-item> -->
                <el-menu-item index="/transportLine">
                    <el-icon><MapLocation /></el-icon>
                    <span>路线管理</span>
                </el-menu-item>
                <el-menu-item index="/driver">
                    <el-icon><TopLeft /></el-icon>
                    <span>司机管理</span>
                </el-menu-item>
                <el-menu-item index="/truck">
                    <el-icon><CaretBottom /></el-icon>
                    <span>货车管理</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- 右侧内容区 -->
        <el-container>
            <!-- 顶部导航栏 -->
            <el-header>
                <div class="header-content">
                    <span>欢迎使用后台管理系统</span>
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            管理员
                            <el-icon class="el-icon--right"
                                ><arrow-down
                            /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <!-- 主内容区 -->
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import {
    Box,
    CaretBottom,
    Coordinate,
    MapLocation,
    TopLeft
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.el-aside {
    background-color: #304156;
    color: #fff;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3a4a;
}

.logo h2 {
    color: #fff;
    margin: 0;
    font-size: 18px;
}

.el-menu-vertical {
    border-right: none;
}

.el-header {
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.el-main {
    background-color: #f0f2f5;
    padding: 20px;
}
</style>
