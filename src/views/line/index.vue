<template>
    <div class="transport-line-container">
        <!-- 1. 顶部操作栏 -->
        <el-card class="box-card" shadow="never">
            <div class="toolbar">
                <span>机构管理</span>
                <el-button type="primary" @click="handleCreate"
                    >新增路线</el-button
                >
            </div>
        </el-card>

        <!-- 2. 数据表格 -->
        <el-card class="box-card" shadow="never" style="margin-top: 16px">
            <el-table
                :data="tableData"
                v-loading="loading"
                border
                style="width: 100%"
            >
                <el-table-column prop="name" label="路线名称" />
                <el-table-column label="起点" width="180">
                    <template #default="scope">
                        {{ scope.row.firstOrgan.name }}
                    </template>
                </el-table-column>
                <el-table-column label="终点" width="180">
                    <template #default="scope">
                        {{ scope.row.secondOrgan.name }}
                    </template>
                </el-table-column>
                <el-table-column label="路线类型" width="120">
                    <template #default="scope">
                        <el-tag :type="getTypeTag(scope.row.type)">{{
                            getTypeText(scope.row.type)
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="更新时间" width="180">
                    <template #default="scope">
                        {{ stampToPrettyDate(scope.row.updateTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="scope">
                        <el-button
                            type="primary"
                            link
                            @click="handleEdit(scope.row)"
                            >编辑</el-button
                        >
                        <el-button
                            type="danger"
                            link
                            @click="handleDelete(scope.row)"
                            >删除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
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
        <!-- 3. 新增/编辑 Drawer -->
        <el-drawer v-model="drawerVisible" :title="drawerTitle" size="400px">
            <el-form
                :model="form"
                :rules="rules"
                ref="formRef"
                label-width="80px"
            >
                <el-form-item label="路线名称" prop="name">
                    <el-input
                        v-model="form.name"
                        placeholder="请输入路线名称"
                    />
                </el-form-item>
                <el-form-item label="起点名称" prop="firstId">
                    <!-- <el-input
                        v-model="form.firstId"
                        placeholder="请输入起点ID (firstBid)"
                    /> -->
                    <OrganTree
                        :defaultOrgan="form.firstId"
                        @onOrganChecked="onFirstOrganChecked"
                    ></OrganTree>
                </el-form-item>

                <el-form-item label="终点名称" prop="secondId">
                    <!-- <el-input
                        v-model="form.secondId"
                        placeholder="请输入终点ID (secondBid)"
                    /> -->
                    <OrganTree
                        :defaultOrgan="form.secondId"
                        @onOrganChecked="onSecondOrganChecked"
                    ></OrganTree>
                </el-form-item>
                <el-form-item label="路线类型" prop="type">
                    <el-select
                        v-model="form.type"
                        placeholder="请选择路线类型"
                        style="width: 100%"
                    >
                        <el-option label="干线" value="1" />
                        <el-option label="支线" value="2" />
                        <el-option label="接驳路线" value="3" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="drawerVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </template>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { stampToPrettyDate } from '@/utils/date'
// 假设你的 api 文件路径如下，请根据实际情况修改
import {
    getTransportLinePage,
    deleteTransportLine,
    createTransportLine,
    updateTransportLine
} from '@/api/TransportLine'

import OrganTree from '@/components/OrganTree.vue'

// ================= 1. 表格与分页相关 =================
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10
})
// const stampToDate = (updateTime) => {
//     console.log('updateTime', updateTime, 'to date', new Date(updateTime))
// }

// 获取列表数据
const fetchData = async () => {
    loading.value = true
    try {
        // 按照你的要求，直接 await 获取结果
        const res = await getTransportLinePage(queryParams)
        // 根据你提供的返回结构：data: { count: 2, list: [...] }
        tableData.value = res.list
        total.value = res.count
    } catch (error) {
        console.error('获取列表失败', error)
    } finally {
        loading.value = false
    }
}

// 分页大小改变
const handleSizeChange = (val) => {
    queryParams.pageSize = val
    fetchData()
}

// 页码改变
const handleCurrentChange = (val) => {
    queryParams.pageNum = val
    fetchData()
}

// ================= 2. 字典/枚举处理 =================
const typeMap = {
    1: '干线',
    2: '支线',
    3: '接驳路线'
}

const getTypeText = (type) => typeMap[type] || '未知'

const getTypeTag = (type) => {
    if (type === 1) return 'primary' // 主线用蓝色
    if (type === 2) return 'warning' // 支线用黄色
    if (type === 3) return 'success' // 接驳用绿色
    return 'info'
}

// ================= 3. Drawer 表单相关 =================
const drawerVisible = ref(false)
const drawerTitle = ref('新增路线')
const formRef = ref(null)
const form = reactive({
    name: '',
    firstId: '',
    secondId: '',
    type: '1', // 默认主线,
    updateTime: 1
})

const rules = {
    name: [{ required: true, message: '请输入路线名称', trigger: 'blur' }],
    firstId: [{ required: true, message: '请输入起点ID', trigger: 'blur' }],
    secondId: [{ required: true, message: '请输入终点ID', trigger: 'blur' }],
    type: [{ required: true, message: '请选择路线类型', trigger: 'change' }]
}

// 打开新增抽屉
const handleCreate = () => {
    drawerTitle.value = '新增路线'
    Object.assign(form, { name: '', firstId: '', secondId: '', type: '1' })
    drawerVisible.value = true
}

// 打开编辑抽屉
const handleEdit = (row) => {
    drawerTitle.value = '编辑路线'
    // 回显数据：注意后端返回的是 firstOrgan.id，提交时需要 firstId
    console.log('row=', row, 'form=', form)
    form.firstId = row.firstOrgan.id
    form.secondId = row.secondOrgan.id
    form.name = row.name
    form.type = String(row.type)
    form.updateTime = row.updateTime
    drawerVisible.value = true
}

// 提交表单 (新增/编辑)
const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 这里有个小技巧：编辑和新增的参数结构一样，
                // 但因为你是根据起点终点来更新的，所以直接调用 update 即可
                // 如果你想严格区分，可以加个 hidden field 判断，但根据需求直接调 update 就行
                if (drawerTitle.value === '新增路线') {
                    await createTransportLine(form)
                    ElMessage.success('新增成功')
                } else {
                    await updateTransportLine(form)
                    ElMessage.success('更新成功')
                }
                drawerVisible.value = false
                fetchData() // 刷新列表
            } catch (error) {
                console.error('操作失败', error)
            }
        }
    })
}

// ================= 4. 删除功能 =================
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除路线 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            try {
                // 传入 firstBid 和 secondBid
                const params = {
                    firstBid: row.firstOrgan.id,
                    secondBid: row.secondOrgan.id
                }
                await deleteTransportLine(params)
                ElMessage.success('删除成功')
                fetchData()
            } catch (error) {
                console.error('删除失败', error)
            }
        })
        .catch(() => {
            // 取消删除
        })
}

// ================= 5. 初始化 =================
onMounted(() => {
    fetchData()
})

//6,处理机构选择
const onFirstOrganChecked = (firstId) => {
    form.firstId = firstId
}
const onSecondOrganChecked = (secondId) => {
    form.secondId = secondId
}
</script>

<style scoped>
.transport-line-container {
    padding: 20px;
}
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
