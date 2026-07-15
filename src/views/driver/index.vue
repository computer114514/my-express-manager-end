<template>
    <div class="driver-container">
        <!-- 1. 顶部搜索与操作栏 -->
        <el-card shadow="never" class="search-card">
            <el-row :gutter="20" align="middle">
                <el-col :span="6">
                    <el-input
                        v-model="searchName"
                        placeholder="搜索司机姓名"
                        clearable
                        @keyup.enter="handleSearch"
                    />
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon> 搜索
                    </el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-col>
                <el-col :span="12" style="text-align: right">
                    <el-button type="success" @click="handleAdd">
                        <el-icon><Plus /></el-icon> 新增司机
                    </el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 2. 数据表格 -->
        <el-card shadow="never" class="table-card">
            <el-table
                :data="tableData"
                v-loading="loading"
                border
                style="width: 100%"
            >
                <el-table-column
                    prop="id"
                    label="ID"
                    width="80"
                    align="center"
                />
                <el-table-column prop="name" label="司机姓名" align="center" />
                <el-table-column prop="phone" label="手机号" align="center" />
                <el-table-column
                    prop="account"
                    label="登录账号"
                    align="center"
                />
                <el-table-column label="所属机构" align="center">
                    <template #default="scope">
                        <!-- 处理机构信息可能为空的情况 -->
                        {{
                            scope.row.organInfoVO
                                ? scope.row.organInfoVO.name
                                : '未分配'
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="createTime"
                    label="创建时间"
                    width="180"
                    align="center"
                />
                <el-table-column
                    label="操作"
                    width="200"
                    align="center"
                    fixed="right"
                >
                    <template #default="scope">
                        <el-button
                            type="primary"
                            link
                            @click="handleEdit(scope.row)"
                            >编辑</el-button
                        >
                        <el-popconfirm
                            title="确定要删除该司机吗？"
                            confirm-button-text="确定"
                            cancel-button-text="取消"
                            @confirm="handleDelete(scope.row.id)"
                        >
                            <template #reference>
                                <el-button type="danger" link>删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="queryParams.pageNum"
                    v-model:page-size="queryParams.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 3. 新增/修改弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogType === 'add' ? '新增司机' : '编辑司机'"
            width="500px"
            @close="resetForm"
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                label-width="100px"
            >
                <el-form-item label="司机姓名" prop="name">
                    <el-input
                        v-model="formData.name"
                        placeholder="请输入司机姓名"
                    />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input
                        v-model="formData.phone"
                        placeholder="请输入手机号"
                    />
                </el-form-item>
                <el-form-item label="所属机构" prop="organId">
                    <!-- 引入你的机构树组件 -->
                    <OrganTree
                        :defaultOrgan="formData.organId"
                        @onOrganChecked="handleOrganChange"
                    />
                </el-form-item>

                <!-- 只有新增时才显示密码框 -->
                <el-form-item
                    v-if="dialogType === 'add'"
                    label="初始密码"
                    prop="password"
                >
                    <el-input
                        v-model="formData.password"
                        type="password"
                        show-password
                        placeholder="请输入初始密码"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm"
                        >确定</el-button
                    >
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import {
    getDriverList,
    createDriver,
    updateDriver,
    deleteDriver
} from '@/api/driver'
import OrganTree from '@/components/OrganTree.vue'

// ================= 1. 列表与分页状态 =================
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const searchName = ref('') // 搜索条件

const queryParams = reactive({
    pageNum: 1,
    pageSize: 10
})

// ================= 2. 弹窗与表单状态 =================
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)

// 表单数据模型
const formData = reactive({
    id: null,
    name: '',
    phone: '',
    organId: '',
    password: ''
})

// 表单校验规则
const rules = reactive({
    name: [{ required: true, message: '请输入司机姓名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '手机号格式不正确',
            trigger: 'blur'
        }
    ],
    organId: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
    password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }]
})

// ================= 3. 核心方法 =================

// 获取列表数据
const fetchList = async () => {
    loading.value = true
    try {
        // 根据你提供的 API，直接返回 { count, list }
        const res = await getDriverList(queryParams)
        tableData.value = res.list || []
        total.value = res.count || 0
    } catch (error) {
        console.error('获取司机列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    queryParams.pageNum = 1
    // 如果你的接口支持名字搜索，可以在 queryParams 里加上 name: searchName.value
    // queryParams.name = searchName.value
    fetchList()
}

// 重置搜索
const resetSearch = () => {
    searchName.value = ''
    queryParams.pageNum = 1
    fetchList()
}

// 分页大小改变
const handleSizeChange = (val) => {
    queryParams.pageSize = val
    queryParams.pageNum = 1
    fetchList()
}

// 页码改变
const handleCurrentChange = (val) => {
    queryParams.pageNum = val
    fetchList()
}

// 机构树选择回调
const handleOrganChange = (organId) => {
    formData.organId = organId
    // 触发表单校验，消除飘红
    formRef.value?.validateField('organId')
}

// 打开新增弹窗
const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
    dialogType.value = 'edit'
    // 赋值回显，注意 organId 要从嵌套对象里取
    formData.id = row.id
    formData.name = row.name
    formData.phone = row.phone
    formData.organId = row.organInfoVO ? row.organInfoVO.id : ''
    dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (dialogType.value === 'add') {
                    await createDriver(formData)
                    ElMessage.success('新增成功')
                } else {
                    // 编辑时不需要传密码
                    const { id, name, phone, organId } = formData
                    await updateDriver({ id, name, phone, organId })
                    ElMessage.success('修改成功')
                }
                dialogVisible.value = false
                fetchList() // 刷新列表
            } catch (error) {
                console.error('操作失败:', error)
            }
        }
    })
}

// 删除
const handleDelete = async (id) => {
    try {
        await deleteDriver(id)
        ElMessage.success('删除成功')
        fetchList()
    } catch (error) {
        console.error('删除失败:', error)
    }
}

// 重置表单
const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
        id: null,
        name: '',
        phone: '',
        organId: '',
        password: ''
    })
}

// 初始化加载
onMounted(() => {
    fetchList()
})
</script>

<style scoped>
.driver-container {
    padding: 20px;
}
.search-card {
    margin-bottom: 20px;
}
.table-card {
    margin-bottom: 20px;
}
.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
