<template>
    <el-card shadow="always" :body-style="{ padding: '20px' }">
        <template #header>
            <div class="card-header">
                <span>机构管理</span>
                <el-button type="primary" :icon="Plus" @click="handleAdd"
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
                <!-- 1. 未选择节点时的占位 -->
                <el-empty
                    v-if="!currentNode"
                    description="请在左侧选择一个机构"
                />

                <!-- 2. 选中节点后的详情展示 -->
                <template v-else>
                    <!-- 头部：标题与操作按钮 -->
                    <div class="detail-header">
                        <h3 style="margin: 0">
                            {{ organDetail?.name || currentNode.label }}
                        </h3>
                        <div class="header-actions">
                            <el-button
                                type="primary"
                                :icon="Edit"
                                @click="handleEdit"
                                >编辑</el-button
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

                    <!-- 加载骨架屏（请求接口时显示） -->
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

                        <!-- 详情主体内容 -->
                        <template #default>
                            <el-descriptions :column="2" border>
                                <el-descriptions-item label="机构 ID" :span="2">
                                    <!-- 雪花 ID 直接当字符串展示，防止精度丢失 -->
                                    <el-text class="mono-text">{{
                                        organDetail?.id
                                    }}</el-text>
                                </el-descriptions-item>

                                <el-descriptions-item label="机构名称">
                                    {{ organDetail?.name }}
                                </el-descriptions-item>

                                <el-descriptions-item label="机构类型">
                                    <!-- 使用 Tag 和字典映射让类型更直观 -->
                                    <el-tag
                                        :type="getTypeTag(organDetail?.type)"
                                    >
                                        {{ getTypeLabel(organDetail?.type) }}
                                    </el-tag>
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

                                <el-descriptions-item label="经度 (Longitude)">
                                    {{ organDetail?.longitude }}
                                </el-descriptions-item>

                                <el-descriptions-item label="纬度 (Latitude)">
                                    {{ organDetail?.latitude }}
                                </el-descriptions-item>
                            </el-descriptions>

                            <!-- 后续扩展区：比如地图打点、下属机构列表等 -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Edit, Delete, Location, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 👇 1. 引入获取详情的 API
import { getOrganTree, getOrganById } from '../../api/agency'

// ================= 状态定义 =================
const treeData = ref([])
const currentNode = ref(null)
const organDetail = ref(null) // 存储接口返回的详细信息
const loading = ref(false) // 控制骨架屏加载状态

// 树形属性映射
const treeProps = {
    children: 'children',
    label: 'label' // 假设你的树节点里显示文本的字段叫 label (如果是 name 请改为 name)
}

// 👇 2. 机构类型字典映射 (根据咱们之前分析的 OTC/TTC/AGENCY)
const typeMap = {
    1: { label: '转运中心 (OTC)', tagType: 'primary' },
    2: { label: '分拣中心 (TTC)', tagType: 'success' },
    3: { label: '营业部 (AGENCY)', tagType: 'warning' }
}

// 获取类型文本
const getTypeLabel = (type) => typeMap[type]?.label || '未知类型'
// 获取 Tag 颜色
const getTypeTag = (type) => typeMap[type]?.tagType || 'info'

// ================= 方法逻辑 =================

// 获取左侧树形数据
const fetchTreeData = async () => {
    try {
        const res = await getOrganTree()
        treeData.value = res.data || []
    } catch (error) {
        console.error('获取机构树失败:', error)
    }
}

// 👇 3. 获取右侧详情数据
const fetchOrganDetail = async (id) => {
    loading.value = true
    try {
        // 调用接口，传入当前节点的 ID
        const res = await getOrganById(id)
        // 将后端返回的 data 赋值给详情对象 (注意处理雪花 ID，后端最好已转为 String)
        organDetail.value = res.data
    } catch (error) {
        console.error('获取机构详情失败:', error)
        ElMessage.error('获取机构详情失败')
    } finally {
        loading.value = false
    }
}

// 点击树节点事件
const handleNodeClick = (data) => {
    console.log('data', data)
    currentNode.value = data
    organDetail.value = null // 切换节点时先清空旧数据
    // 触发详情请求 (假设树节点的主键也是 id)
    if (data.id) {
        fetchOrganDetail(data.id)
    }
}

// 占位：编辑操作
const handleEdit = () => {
    ElMessage.info(`准备编辑机构: ${organDetail.value.name}`)
    // TODO: 打开编辑弹窗
}

// 占位：删除操作
const handleDelete = () => {
    ElMessageBox.confirm(
        `确定要删除机构【${organDetail.value.name}】吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
        .then(() => {
            ElMessage.success('删除成功 (模拟)')
            // TODO: 调用删除接口并刷新树
        })
        .catch(() => {})
}

// 组件挂载
onMounted(() => {
    fetchTreeData()
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
/* 左右布局容器 */
.organ-container {
    display: flex;
    height: 650px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
}

/* 左侧树形菜单样式 */
.organ-tree {
    width: 300px;
    border-right: 1px solid #ebeef5;
    padding: 15px;
    overflow-y: auto;
    background-color: #fafafa;
}

/* 右侧详情区域样式 */
.organ-detail {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #fff;
}

/* 详情头部：标题和按钮左右对齐 */
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 等宽字体：专门用来展示长串的数字 ID，看起来更专业 */
.mono-text {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    color: #606266;
    letter-spacing: 0.5px;
}

/* 地图预留区域样式 */
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

/* 滚动条美化 */
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
