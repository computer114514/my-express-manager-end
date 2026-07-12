<template>
    <el-card shadow="always" :body-style="{ padding: '20px' }">
        <template #header>
            <div class="card-header">
                <span>机构管理</span>
                <el-button type="primary" :icon="Plus" @click="openAddDrawer"
                    >新增</el-button
                >
            </div>
        </template>
        <!-- 卡片主体：左右分栏布局 -->
        <div class="organ-container">
            <!-- 左侧：树形结构 -->
            <div class="organ-tree">
                <el-tree
                    size="large"
                    :data="treeData"
                    :props="treeProps"
                    node-key="id"
                    highlight-current
                    :expand-on-click-node="false"
                    @node-click="handleNodeClick"
                />
            </div>

            <!-- 右侧：机构详细信息 -->
            <div class="organ-detail">
                <el-empty
                    v-if="!currentNode"
                    description="请在左侧选择一个机构"
                />

                <template v-else>
                    <div class="detail-header">
                        <h3 style="margin: 0">
                            {{ organDetail?.name || currentNode.label }}
                        </h3>
                        <div class="header-actions">
                            <el-button
                                type="primary"
                                :icon="MapLocation"
                                @click="handleCourierScope"
                                >作业范围</el-button
                            >
                            <el-button
                                type="primary"
                                :icon="Edit"
                                @click="openEditDrawer"
                                >编辑信息</el-button
                            >
                            <el-button
                                type="danger"
                                :icon="Delete"
                                plain
                                @click="handleDelete"
                                >删除</el-button
                            >
                        </div>
                    </div>

                    <el-divider style="margin: 15px 0" />

                    <el-skeleton :loading="loading" animated :count="1">
                        <template #template>
                            <el-skeleton-item
                                variant="h3"
                                style="
                                    width: 30%;
                                    height: 24px;
                                    margin-bottom: 20px;
                                "
                            />
                            <el-skeleton-item
                                variant="text"
                                style="width: 100%; height: 120px"
                            />
                        </template>

                        <template #default>
                            <el-descriptions :column="2" border>
                                <el-descriptions-item label="机构 ID" :span="2">
                                    <el-text class="mono-text">{{
                                        organDetail?.id
                                    }}</el-text>
                                </el-descriptions-item>
                                <el-descriptions-item label="机构名称">{{
                                    organDetail?.name
                                }}</el-descriptions-item>
                                <el-descriptions-item label="机构类型">
                                    <el-tag
                                        :type="getTypeTag(organDetail?.type)"
                                        >{{
                                            getTypeLabel(organDetail?.type)
                                        }}</el-tag
                                    >
                                </el-descriptions-item>
                                <el-descriptions-item
                                    label="父级机构 ID"
                                    :span="2"
                                >
                                    <template v-if="organDetail?.parentId">
                                        <el-text class="mono-text">{{
                                            organDetail.parentId
                                        }}</el-text>
                                    </template>
                                    <el-tag v-else type="info" size="small"
                                        >顶级机构</el-tag
                                    >
                                </el-descriptions-item>
                                <el-descriptions-item
                                    label="经度 (Longitude)"
                                    >{{
                                        organDetail?.longitude
                                    }}</el-descriptions-item
                                >
                                <el-descriptions-item label="纬度 (Latitude)">{{
                                    organDetail?.latitude
                                }}</el-descriptions-item>
                            </el-descriptions>

                            <div class="extra-section">
                                <h4>📍 地理位置预览</h4>
                                <div class="map-placeholder">
                                    <el-icon :size="40" color="#909399"
                                        ><Location
                                    /></el-icon>
                                    <p>
                                        地图组件预留位置 (可接入高德/百度地图)
                                    </p>
                                </div>
                            </div>
                        </template>
                    </el-skeleton>
                </template>
            </div>
        </div>
    </el-card>

    <!-- ==================== 新增/编辑 抽屉 (Drawer) ==================== -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="45%">
        <el-form
            :model="formData"
            label-width="100px"
            style="padding-right: 20px"
        >
            <!-- 1. 机构名称 (新增/编辑 都能改) -->
            <el-form-item label="机构名称">
                <el-input
                    v-model="formData.name"
                    placeholder="请输入机构名称"
                />
            </el-form-item>

            <!-- 2. 经度 (新增/编辑 都能改) -->
            <el-form-item label="经度">
                <el-input-number
                    v-model="formData.longitude"
                    :precision="5"
                    :step="0.1"
                    style="width: 100%"
                />
            </el-form-item>

            <!-- 3. 纬度 (新增/编辑 都能改) -->
            <el-form-item label="纬度">
                <el-input-number
                    v-model="formData.latitude"
                    :precision="5"
                    :step="0.1"
                    style="width: 100%"
                />
            </el-form-item>

            <!-- 4. 机构类型 (新增能改，编辑禁用) -->
            <el-form-item label="机构类型">
                <el-select
                    v-model="formData.type"
                    placeholder="请选择类型"
                    :disabled="isEdit"
                    style="width: 100%"
                >
                    <el-option
                        v-for="item in typeList"
                        :key="item.code"
                        :label="typeMap[item.code]?.label || item.type"
                        :value="item.code"
                    />
                </el-select>
                <!-- 编辑模式下的开发中提示 -->
                <div v-if="isEdit" class="dev-hint">
                    <el-icon><SetUp /></el-icon>
                    <span>该字段开发中，暂不可修改</span>
                </div>
            </el-form-item>

            <!-- 5. 父级机构 (新增能改，编辑禁用) -->
            <el-form-item label="父级机构">
                <el-tree-select
                    v-model="formData.parentId"
                    :data="treeData"
                    :props="{ label: 'label', children: 'children' }"
                    node-key="id"
                    placeholder="不选则为顶级机构"
                    clearable
                    check-strictly
                    :disabled="isEdit"
                    style="width: 100%"
                />
                <div v-if="isEdit" class="dev-hint">
                    <el-icon><SetUp /></el-icon>
                    <span>该字段开发中，暂不可修改</span>
                </div>
            </el-form-item>
        </el-form>

        <!-- 底部按钮 -->
        <template #footer>
            <el-button @click="drawerVisible = false">取消</el-button>
            <el-button
                type="primary"
                @click="handleSubmit"
                :loading="submitLoading"
                >确定保存</el-button
            >
        </template>
    </el-drawer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
    Edit,
    Delete,
    Location,
    Plus,
    SetUp,
    MapLocation
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    getOrganTree,
    getOrganById,
    getOrganType,
    createOrgan,
    updateOrgan,
    deleteOrgan
} from '../../api/Agency'
import router from '@/router'

// ================= 1. 基础状态 =================
const treeData = ref([])
const currentNode = ref(null)
const organDetail = ref(null)
const loading = ref(false)

// 树形配置
const treeProps = { children: 'children', label: 'label' }

// 类型字典映射 (前端写死一份，用于详情展示和下拉框翻译)
const typeMap = {
    1: { label: '转运中心 (OTC)', tagType: 'primary' },
    2: { label: '分拣中心 (TTC)', tagType: 'success' },
    3: { label: '营业部 (AGENCY)', tagType: 'warning' }
}
const getTypeLabel = (type) => typeMap[type]?.label || '未知类型'
const getTypeTag = (type) => typeMap[type]?.tagType || 'info'

// ================= 2. 抽屉与表单状态 =================
const drawerVisible = ref(false)
const drawerTitle = ref('')
const isEdit = ref(false) // 标记当前是新增还是编辑
const submitLoading = ref(false) // 提交按钮的 loading
const typeList = ref([]) // 后端返回的类型列表

// 表单数据 (用 reactive 方便直接 v-model 绑定)
const formData = reactive({
    id: null,
    name: '',
    longitude: null,
    latitude: null,
    type: null,
    parentId: null
})

// ================= 3. 数据请求方法 =================
//点击作业范围按钮
const handleCourierScope = () => {
    router.push(
        `/organScope?id=${organDetail.value.id}&agencyCoordinate=${organDetail.value.longitude + ',' + organDetail.value.latitude}`
    )
}
// 获取左侧树
const fetchTreeData = async () => {
    try {
        const res = await getOrganTree()
        treeData.value = res || []
    } catch (error) {
        console.error('获取机构树失败:', error)
    }
}

// 获取右侧详情
const fetchOrganDetail = async (id) => {
    loading.value = true
    try {
        const res = await getOrganById(id)
        organDetail.value = res
    } catch (error) {
        ElMessage.error('获取机构详情失败')
    } finally {
        loading.value = false
    }
}

// 获取类型列表 (用于新增时的下拉框)
const fetchTypeList = async () => {
    try {
        const res = await getOrganType()
        typeList.value = res || []
    } catch (error) {
        console.error('获取类型列表失败:', error)
    }
}

// ================= 4. 交互事件 =================

// 点击树节点
const handleNodeClick = (data) => {
    currentNode.value = data
    organDetail.value = null
    if (data.id) fetchOrganDetail(data.id)
}

// 打开【新增】抽屉
const openAddDrawer = () => {
    isEdit.value = false
    drawerTitle.value = '新增机构'
    // 清空表单
    Object.assign(formData, {
        id: null,
        name: '',
        longitude: null,
        latitude: null,
        type: null,
        parentId: null
    })
    drawerVisible.value = true
}

// 打开【编辑】抽屉
const openEditDrawer = () => {
    if (!organDetail.value) return
    isEdit.value = true
    drawerTitle.value = '编辑机构'
    // 回填表单数据
    Object.assign(formData, {
        id: organDetail.value.id,
        name: organDetail.value.name,
        longitude: organDetail.value.longitude,
        latitude: organDetail.value.latitude,
        type: organDetail.value.type,
        parentId: organDetail.value.parentId
    })
    drawerVisible.value = true
}

// 点击【删除】
const handleDelete = () => {
    if (!organDetail.value) return
    ElMessageBox.confirm(
        `确定要删除机构【${organDetail.value.name}】吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
        .then(async () => {
            try {
                // 调用删除接口，传入字符串 ID
                await deleteOrgan(String(organDetail.value.id))
                ElMessage.success('删除成功')
                currentNode.value = null
                organDetail.value = null
                fetchTreeData() // 刷新树
            } catch (error) {
                ElMessage.error('删除失败')
            }
        })
        .catch(() => {})
}

// 点击【确定保存】(提交表单)
const handleSubmit = async () => {
    // 简单的前端非空校验
    if (!formData.name) return ElMessage.warning('请输入机构名称')
    if (formData.longitude === null || formData.latitude === null)
        return ElMessage.warning('请输入经纬度')
    if (!isEdit.value && !formData.type)
        return ElMessage.warning('请选择机构类型')

    submitLoading.value = true
    try {
        if (isEdit.value) {
            // 【编辑】：只传允许修改的字段 + id
            await updateOrgan({
                id: String(formData.id), // 雪花ID转字符串防丢失
                name: formData.name,
                longitude: formData.longitude,
                latitude: formData.latitude,
                type: formData.type, // 虽然后端可能不更新，但按接口要求带上
                parentId: formData.parentId
            })
            ElMessage.success('修改成功')
            fetchOrganDetail(String(formData.id)) // 刷新右侧详情
        } else {
            // 【新增】：传所有字段
            const payload = {
                name: formData.name,
                longitude: formData.longitude,
                latitude: formData.latitude,
                type: formData.type
            }
            if (formData.parentId) payload.parentId = formData.parentId // 有父级才传
            await createOrgan(payload)
            ElMessage.success('新增成功')
        }

        drawerVisible.value = false // 关闭抽屉
        fetchTreeData() // 刷新左侧树
    } catch (error) {
        ElMessage.error(isEdit.value ? '修改失败' : '新增失败')
    } finally {
        submitLoading.value = false
    }
}

// ================= 5. 生命周期 =================
onMounted(() => {
    fetchTreeData()
    fetchTypeList() // 页面加载时获取类型列表
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.organ-container {
    display: flex;
    height: 650px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
}
.organ-tree {
    width: 300px;
    border-right: 1px solid #ebeef5;
    padding: 15px;
    overflow-y: auto;
    background-color: #fafafa;
}
.organ-detail {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #fff;
}
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.mono-text {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    color: #606266;
    letter-spacing: 0.5px;
}
.extra-section {
    margin-top: 30px;
}
.map-placeholder {
    height: 200px;
    background-color: #f5f7fa;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #909399;
}
.map-placeholder p {
    margin-top: 10px;
    font-size: 14px;
}

/* 开发中提示样式 */
.dev-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
}

.organ-tree::-webkit-scrollbar,
.organ-detail::-webkit-scrollbar {
    width: 6px;
}
.organ-tree::-webkit-scrollbar-thumb,
.organ-detail::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
}
</style>
