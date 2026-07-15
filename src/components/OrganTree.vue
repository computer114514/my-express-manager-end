<template>
    <el-tree-select
        v-model="agencyId"
        :data="treeData"
        :props="{ label: 'label', children: 'children' }"
        node-key="id"
        placeholder="请选择所属机构"
        clearable
        check-strictly
        style="width: 100%"
    />
</template>

<style scoped></style>

<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import { getOrganTree } from '@/api/agency'

const props = defineProps({
    defaultOrgan: {
        type: String,
        required: true
    }
})
const fetchTreeData = async () => {
    try {
        const res = await getOrganTree()
        treeData.value = res || []
    } catch (error) {
        console.error('获取机构树失败:', error)
    }
}
const treeData = ref([])

//这样会切断props的数据流！
const agencyId = ref(props.defaultOrgan)

// const agencyId = computed(() => {
//     return props.defaultOrgan
// })

const emit = defineEmits(['onOrganChecked'])

const onOrganChecked = () => {
    console.log(agencyId.value)
    emit('onOrganChecked', agencyId.value)
}

onMounted(() => {
    fetchTreeData()
})

watch(
    () => props.defaultOrgan,
    (newVal) => {
        agencyId.value = newVal
        onOrganChecked()
    }
)
watch(agencyId, (newVal) => {
    agencyId.value = newVal
    onOrganChecked()
})
</script>
