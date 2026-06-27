<template>
    <div class="user-container">
        <!-- 顶部操作栏 -->
        <div class="header">
            <h3>快递员管理</h3>
            <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon> 新增快递员
            </el-button>
        </div>

        <!-- 表格 -->
        <el-table
            :data="tableData"
            v-loading="loading"
            border
            stripe
            style="width: 100%"
        >
            <el-table-column prop="account" label="账号" min-width="100" />
            <el-table-column prop="name" label="姓名" min-width="50" />
            <el-table-column prop="phone" label="手机号" min-width="110" />
            <el-table-column
                prop="organInfoVO.organName"
                label="所属机构"
                min-width="90"
            />

            <el-table-column
                prop="appImage"
                label="头像"
                min-width="80"
                align="center"
            >
                <template #default="{ row }">
                    <el-image
                        v-if="row.appImage"
                        :src="row.appImage"
                        :preview-src-list="[row.appImage]"
                        fit="cover"
                        style="width: 40px; height: 40px; border-radius: 50%"
                        preview-teleported
                    />
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="status"
                label="状态"
                width="80"
                align="center"
            >
                <template #default="{ row }">
                    <el-tag
                        :type="row.status === 1 ? 'success' : 'danger'"
                        size="small"
                    >
                        {{ row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="180"
                fixed="right"
                align="center"
            >
                <template #default="{ row }">
                    <el-button type="primary" link @click="handleEdit(row)"
                        >编辑</el-button
                    >
                    <el-button type="danger" link @click="handleDelete(row)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="size"
                :page-sizes="[10, 20, 50]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                background
                @size-change="fetchList"
                @current-change="fetchList"
            />
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="isEdit ? '编辑快递员' : '新增快递员'"
            width="500px"
            @closed="resetForm"
            destroy-on-close
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="80px"
            >
                <el-form-item label="账号" prop="account" v-if="isEdit">
                    <el-input
                        v-model="formData.account"
                        placeholder="请输入账号"
                        :disabled="isEdit"
                    />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input
                        v-model="formData.name"
                        placeholder="请输入姓名"
                    />
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!isEdit">
                    <el-input
                        v-model="formData.password"
                        placeholder="请输入密码"
                    />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input
                        v-model="formData.phone"
                        placeholder="请输入手机号"
                    />
                </el-form-item>
                <el-form-item label="机构" prop="organBid">
                    <organ-tree
                        :defaultOrgan="formData.organBid"
                        @onOrganChecked="onOrganChecked"
                    ></organ-tree>
                </el-form-item>
                <!-- <el-form-item label="头像" prop="appImage">
                    <el-input
                        v-model="formData.appImage"
                        placeholder="请输入头像URL"
                    />
                </el-form-item> -->
                <el-form-item
                    :label="isEdit ? '修改头像' : '新增头像'"
                    size="normal"
                >
                    <ImageUpload @onGetUrl="onGetUrl"></ImageUpload>
                </el-form-item>

                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="formData.status">
                        <el-radio :value="1">启用</el-radio>
                        <el-radio :value="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :loading="submitLoading"
                    @click="submitForm"
                >
                    确 定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ImageUpload from '@/components/ImageUpload.vue'
import {
    getCourierList,
    createCourier,
    updateCourier,
    deleteCourier
} from '@/api/courier'
import OrganTree from '@/components/OrganTree.vue'

// ======================== 列表 & 分页 ========================
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

async function fetchList() {
    loading.value = true
    try {
        const res = await getCourierList({
            pageNum: page.value,
            pageSize: size.value
        })
        tableData.value = res.list || []
        total.value = res.count || 0
    } finally {
        loading.value = false
    }
}

// ======================== 弹窗 & 表单 ========================
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

const getDefaultForm = () => ({
    id: '',
    account: '',
    name: '',
    phone: '',
    appImage: '',
    status: 1,
    organBid: '',
    password: ''
})
const onOrganChecked = (organBid) => {
    formData.organBid = organBid
}

const formData = reactive(getDefaultForm())

const formRules = {
    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    organBid: [{ required: true, message: '请选择机构', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '手机号格式不正确',
            trigger: 'blur'
        }
    ]
}
const onGetUrl = (url) => {
    formData.appImage = url
}

// ======================== 新增 ========================
function handleAdd() {
    isEdit.value = false
    Object.assign(formData, getDefaultForm())
    dialogVisible.value = true
}

// ======================== 编辑 ========================
function handleEdit(row) {
    isEdit.value = true
    Object.assign(formData, {
        id: row.id,
        account: row.account,
        name: row.name,
        phone: row.phone,
        appImage: row.appImage,
        status: row.status,
        organBid: row.organInfoVO.id
    })
    dialogVisible.value = true
}

// ======================== 提交（新增 / 编辑） ========================
async function submitForm() {
    // 先过表单校验
    try {
        await formRef.value.validate()
    } catch {
        return // 校验不通过，直接返回
    }

    submitLoading.value = true
    try {
        if (isEdit.value) {
            await updateCourier({ ...formData })
            ElMessage.success('更新成功')
        } else {
            await createCourier({ ...formData })
            ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchList() // 刷新列表
    } finally {
        submitLoading.value = false
    }
}

// ======================== 删除 ========================
async function handleDelete(row) {
    try {
        await ElMessageBox.confirm(
            `确定要删除用户「${row.name}」吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
    } catch {
        return // 用户点了取消
    }

    await deleteCourier(row.id)
    ElMessage.success('删除成功')
    // 如果删的是当前页最后一条，回到上一页
    if (tableData.value.length === 1 && page.value > 1) {
        page.value--
    }
    fetchList()
}

// ======================== 重置表单 ========================
function resetForm() {
    formRef.value?.resetFields()
    Object.assign(formData, getDefaultForm())
}

// ======================== 初始化 ========================
onMounted(() => {
    fetchList()
})
</script>

<style scoped>
.user-container {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.header h3 {
    margin: 0;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}
</style>
