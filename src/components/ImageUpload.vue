<template>
    <el-upload
        class="avatar-uploader"
        :action="ossData.host"
        :show-file-list="true"
        :data="ossData"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        name="file"
    >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getSign } from '../api/oss'
import { now } from '@vueuse/core'

const emit = defineEmits(['onGetUrl'])
const imageUrl = ref('')
const finalUrl = ref('')
const allowedFile = ['image/jpeg', 'image/gif', 'image/png', 'image/webp']

const handleAvatarSuccess = (response, uploadFile) => {
    console.log('response', response)
    console.log('response', uploadFile)

    imageUrl.value = URL.createObjectURL(uploadFile.raw)

    emit('onGetUrl', finalUrl.value)
}

const ossData = ref({
    host: '', //上传地址9
    OSSAccessKeyId: '', //9
    policy: '', //上传策略9
    signature: '', //后端生成的签名9
    dir: '', //允许上传的目录9
    key: '', //文件在oss里的路径
    expire: 0 //9
})

const beforeAvatarUpload = async (rawFile) => {
    // debugger
    console.log('rawFile', rawFile)
    //1,常规安检
    if (!allowedFile.includes(rawFile.type)) {
        ElMessage.error('图片类型不对!')
        return false
    } else if (rawFile.size / 1024 / 1024 > 10) {
        ElMessage.error('图片不得大于10MB!')
        return false
    }
    //2,获取ossDate数据，expire是秒级时间戳
    if (
        ossData.value.expire == null ||
        ossData.value.expire - 5 <= Date.now() / 1000
    ) {
        //过期了，重新获取
        console.log('request', await getSign())
        ossData.value = await getSign()
    }
    console.log('ossDate', ossData.value)
    //3,组装key,目录+随机名+后缀。
    const suffix = rawFile.name.substring(rawFile.name.lastIndexOf('.'))
    const randomName =
        new Date().getTime() + '_' + Math.random().toString(32).substring(2, 8) //截取六位字符串做随机
    ossData.value.key = ossData.value.dir + randomName + suffix
    //自己组装地址,host+key
    finalUrl.value = ossData.value.host + '/' + ossData.value.key
    console.log('finalUrl', finalUrl.value)
    return true
}

//暴露出一个url属性
</script>

<style scoped>
.avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}
</style>
