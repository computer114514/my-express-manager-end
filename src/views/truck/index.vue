<template>
    <div class="truck-container">
        <!-- 搜索与操作栏 -->
        <el-card class="box-card" shadow="never">
            <el-row :gutter="20" class="mb-4">
                <el-col :span="12">
                    <el-button type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>新增卡车
                    </el-button>
                </el-col>
            </el-row>

            <!-- 数据表格 -->
            <el-table
                :data="tableData"
                v-loading="loading"
                border
                stripe
                style="width: 100%"
            >
                <el-table-column prop="number" label="车牌号" width="120" />
                <el-table-column prop="type" label="车辆类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.type === 1 ? 'success' : 'info'">
                            {{
                                truckTypes.find((t) => t.value === row.type)
                                    ?.label || '未知'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="weight"
                    label="最大载重(吨)"
                    width="120"
                />
                <el-table-column
                    prop="volume"
                    label="车厢体积(m³)"
                    width="120"
                />
                <el-table-column
                    prop="organId"
                    label="所属机构"
                    min-width="180"
                >
                    <template #default="{ row }">
                        <!-- 这里简单显示ID，实际项目中建议通过机构字典或接口转为名称 -->
                        {{ row.organInfoVO.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="createTime"
                    label="创建时间"
                    width="180"
                />
                <el-table-column label="操作" width="180" fixed="right">
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
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="queryParams.pageNum"
                    v-model:page-size="queryParams.pageSize"
                    :page-sizes="[10, 20, 50]"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="fetchList"
                    @current-change="fetchList"
                />
            </div>
        </el-card>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="600px"
            @close="resetForm"
            destroy-on-close
        >
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="100px"
            >
                <el-form-item label="车牌号" prop="number">
                    <el-input
                        v-model="form.number"
                        placeholder="请输入车牌号"
                    />
                </el-form-item>

                <el-form-item label="车辆类型" prop="type">
                    <el-select
                        v-model="form.type"
                        placeholder="请选择车辆类型"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="item in truckTypes"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="最大载重" prop="weight">
                    <el-input-number
                        v-model="form.weight"
                        :min="0.1"
                        :precision="1"
                        placeholder="吨"
                        style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="车厢体积" prop="volume">
                    <el-input-number
                        v-model="form.volume"
                        :min="0.1"
                        :precision="1"
                        placeholder="立方米"
                        style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="所属机构" prop="organId">
                    <!-- 引入你的树形机构选择器组件 -->
                    <OrganTree
                        :defaultOrgan="String(form.organId || '')"
                        @onOrganChecked="handleOrganChecked"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button
                    type="primary"
                    @click="submitForm"
                    :loading="submitLoading"
                >
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
    getTruckList,
    createTruck,
    updateTruck,
    deleteTruck
} from '@/api/truck'
import OrganTree from '@/components/OrganTree.vue'

// 车辆类型字典 (根据你后端的枚举定义)
const truckTypes = [
    { value: 1, label: '微卡' },
    { value: 2, label: '轻卡' },
    { value: 3, label: '中卡' },
    { value: 4, label: '重卡' },
    { value: 5, label: '半挂车' }
]

// 表格数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const form = reactive({
    id: null,
    number: '',
    type: null,
    weight: null,
    volume: null,
    organId: ''
})

// 表单校验规则
const rules = {
    number: [
        { required: true, message: '请输入车牌号', trigger: 'blur' },
        { min: 7, max: 20, message: '车牌号长度7-20位', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请选择车辆类型', trigger: 'change' }],
    weight: [{ required: true, message: '请输入最大载重', trigger: 'blur' }],
    volume: [{ required: true, message: '请输入车厢体积', trigger: 'blur' }],
    organId: [{ required: true, message: '请选择所属机构', trigger: 'change' }]
}

// 获取列表数据
const fetchList = async () => {
    loading.value = true
    try {
        // 拦截器已处理，res 直接就是 data 里的 { count, list }
        const res = await getTruckList(queryParams)
        tableData.value = res.list || []
        total.value = Number(res.count) || 0
    } catch (error) {
        console.error('获取卡车列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 新增
const handleAdd = () => {
    dialogTitle.value = '新增卡车'
    dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
    dialogTitle.value = '编辑卡车'
    Object.assign(form, {
        id: row.id,
        number: row.number,
        type: row.type,
        weight: row.weight,
        volume: row.volume,
        organId: row.organInfoVO.id
    })
    dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除该卡车吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        // 注意：你描述里写的是传入 organId，但正常逻辑删除卡车应该传卡车的 id
        // 这里我按传 row.id 处理，如果后端确实要求传 organId，请改为 row.organId
        await deleteTruck(row.id)
        ElMessage.success('删除成功')
        fetchList()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}

// 机构选择回调
const handleOrganChecked = (organId) => {
    form.organId = organId
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) return

        submitLoading.value = true
        try {
            // 按照你的接口要求，将 type, weight, volume 转为字符串
            const data = {
                number: form.number,
                type: String(form.type),
                weight: String(form.weight),
                volume: String(form.volume),
                organId: form.organId
            }

            if (form.id) {
                data.id = form.id
                await updateTruck(data)
                ElMessage.success('更新成功')
            } else {
                await createTruck(data)
                ElMessage.success('创建成功')
            }

            dialogVisible.value = false
            fetchList()
        } catch (error) {
            ElMessage.error('操作失败')
        } finally {
            submitLoading.value = false
        }
    })
}

// 重置表单
const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
        id: null,
        number: '',
        type: null,
        weight: null,
        volume: null,
        organId: ''
    })
}

onMounted(() => {
    fetchList()
})
</script>

<style scoped>
.truck-container {
    padding: 20px;
}

.mb-4 {
    margin-bottom: 16px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
