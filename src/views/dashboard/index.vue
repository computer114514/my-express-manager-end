<template>
    <div class="dashboard">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>仪表盘</span>
                    <image-upload></image-upload>
                </div>
            </template>
            <p>欢迎来到后台管理系统！</p>
        </el-card>
    </div>
</template>

<script setup>
import ImageUpload from '../../components/ImageUpload.vue'
</script>

<style scoped>
.dashboard {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
