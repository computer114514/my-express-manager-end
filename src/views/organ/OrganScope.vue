<template>
    <Scope
        :pathData="pathData"
        :routeQuery="routeQuery"
        @save="save"
        @delete="deleteScopeMethod"
        @get="getScopeMethod"
    ></Scope>
</template>

<script setup>
import Scope from '@/components/Scope.vue'
/// <reference types="@amap/amap-jsapi-types" />
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { saveOrganScope, deleteScope, getOrganScope } from '@/api/OrganScope'
import { ElMessage } from 'element-plus'

const pathData = ref({
    path: [],
    purePath: []
})

let route = useRoute()
let routeQuery = route.query

// onMounted(() => {
//     routeQuery.value = route.query
// })
const getScopeMethod = async (id) => {
    const res = await getOrganScope(id)
    if (res.coordinateList.length != 0) {
        pathData.value.path = res.coordinateList
        //解析为purePath
        pathData.value.purePath = pathData.value.path.map((element) => {
            let newArray = []
            newArray.push(element.longitude)
            newArray.push(element.latitude)
            return newArray
        })
    } else {
        pathData.value.path = []
        pathData.value.purePath = []
    }
}
const deleteScopeMethod = async (id) => {
    await deleteScope(id)
    ElMessage.success('已删除工作范围')
}
const save = async (coordinateData) => {
    await saveOrganScope(coordinateData)
    ElMessage.success('保存成功')
}
</script>

<style scoped>
#MapContainer {
    width: 100%;
    height: 600px;
    border-radius: 8px;
    border: 1px sloid #304156;
}
</style>
