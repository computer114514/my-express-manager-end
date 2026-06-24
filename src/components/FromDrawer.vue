<template>
    <el-drawer v-model="showDrawer" :title="props.title" :size="props.size">
        <div class="fromDrawer">
            <div class="body">
                <slot></slot>
            </div>
            <div class="btn">
                <el-button type="success" @click="submitMethod">{{
                    props.confirmText
                }}</el-button>
                <el-button type="primary" @click="close">取消</el-button>
            </div>
        </div>
    </el-drawer>
</template>

<script setup>
import { ref } from 'vue'
//=======================状态管理=====================
const showDrawer = ref(false)

const open = () => {
    showDrawer.value = true
}
const close = () => {
    showDrawer.value = false
}

const props = defineProps({
    title: String,
    size: { type: String, default: '45%' },
    destoryOnClose: { type: String, default: 'false' },
    confirmText: { type: String, default: '确定' }
})
const emit = defineEmits(['submit'])
const submitMethod = () => {
    submit()
}
const submit = () => emit('submit')

defineExpose({
    open,
    close
})
</script>

<style scoped>
@import 'tailwindcss';
.fromDrawer {
    @apply w-full h-full relative flex flex-col;
}
.fromDrawer .body {
    @apply flex-1 absolute right-0 left-0 top-0 bottom-15 overflow-y-auto;
}
.fromDrawer .btn {
    @apply h-15 flex items-center mt-auto;
}
</style>
