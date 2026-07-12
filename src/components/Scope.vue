<template>
    <div>
        <el-button type="none" size="normal" @click="router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回</el-button
        >
    </div>
    <div
        style="display: flex; justify-content: space-between; margin: 20px 10px"
    >
        <div>
            <el-button
                type="primary"
                size="default"
                @click="startDraw(purePath)"
                v-if="isDrawing"
                >结束绘制/编辑</el-button
            >
            <el-button
                type="primary"
                size="default"
                @click="startDraw(purePath)"
                v-else
                >开始绘制/编辑</el-button
            >
        </div>
        <div>
            <el-button
                type="primary"
                size="default"
                @click="removePolygonMethod"
                v-if="showButton"
                >清除围栏</el-button
            >
            <el-button
                type="primary"
                size="default"
                @click="save"
                v-if="showButton"
                >保存</el-button
            >
        </div>
    </div>
    <div id="MapContainer" ref="mapContainerRef"></div>
    <div style="margin: 15px 0">
        <el-button type="danger" size="default" @click="handleClickDeleteButton"
            >删除作业范围</el-button
        >
    </div>
    <el-dialog title="删除作业范围" v-model="dialogVisiblity" width="40%">
        <span>{{
            `此操作将删除该快递员【id:${id}】的工作范围
            该操作不可逆`
        }}</span>
        <template #footer>
            <span>
                <el-button @Click="dialogVisiblity = false">取消</el-button>
                <el-button type="primary" @click="deleteScopeMethod"
                    >确认</el-button
                >
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import {
    computed,
    onMounted,
    onUnmounted,
    reactive,
    ref,
    shallowRef,
    watch
} from 'vue'
import { useRouter } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import { ElMessage } from 'element-plus'
import { el, fa } from 'element-plus/es/locale/index.mjs'

let id = null
let map = null
let mouseTool = null
let purePath = null
let polygon = shallowRef(null)
let isDrawing = ref(false)
let isEditing = ref(false)
const mapContainerRef = ref(null)
const coordinateData = reactive({})
const dialogVisiblity = ref(false)
let polygonEditior = null
let Amap = null
let path = null
const router = useRouter()

const showButton = computed(() => {
    //原来是这样，你加ref一开始是为了让pollygon变成响应式，可是不能乱加，你用计算属性，计算这个属性不行吗，绕过模版？
    return !isDrawing.value && polygon.value !== null
})

//===================================接收父组件======================================
const props = defineProps(['pathData', 'routeQuery'])

const emit = defineEmits(['save', 'delete', 'get'])
//======================================END=========================================

onMounted(async () => {
    id = props.routeQuery.id
    coordinateData.id = id
    //1,配置安全密钥
    window._AmapSecurityConfig = {
        amapSecurityCode: '2daf5ab9c52b87b02f17c595eb97200d'
    }
    //2,AMap.load,加载器加载，加入key和版本
    /** @type {typeof AMap} */
    // debugger
    Amap = await AMapLoader.load({
        key: '9763b5f3da277c247b8f2d71c4e0dc42',
        version: '2.0',
        plugins: [
            'AMap.Polygon', // 多边形覆盖物
            'AMap.MouseTool',
            'AMap.PolygonEditor'
        ]
    })
    //3,初始化mouseTool
    /** @type {typeof Map_2} */
    map = new Amap.Map('MapContainer', {
        zoom: 11,
        center: getCenter()
    })
    map.setDefaultCursor('pointer')

    // map.setDefaultCursor
    //4，给map新建一个对象，配置一下，挂载到id上
    mouseTool = new Amap.MouseTool(map)

    //5,获取多边形数据

    try {
        init()
        //==0怎么办？
    } catch (e) {
        ElMessage.warning('有问题啊' + e.toString())
    }
    //5,监听完成事件
    mouseTool.on('draw', (event) => {
        const coordinateListStr = event.obj.toString()

        mouseTool.close(true)
        if (event.obj.getPath().length < 3) {
            //地图上移除图形对象
            map.remove(event.obj)
            //清除当前未完成的绘制
            //提示
            ElMessage.warning('绘制的点不可小于3个!')

            //继续绘制
            mouseTool.polygon({
                fillColor: '#00b0ff',
                fillOpacity: 0.3,
                strokeColor: '#004de6',
                strokeWeight: 3,
                strokeOpacity: 0.8
            })
            return
        }

        //处理数据，形成请求体;
        //1,处理坐标数据
        const coordinateStrList = coordinateListStr.split(';')
        const coordinateList = []
        coordinateStrList.forEach((element) => {
            //element=="132.2121,23.21"
            const pointArray = element.split(',')
            const oneCoordinate = {}
            oneCoordinate.longitude = pointArray[0]
            oneCoordinate.latitude = pointArray[1]
            coordinateList.push(oneCoordinate)
        })
        coordinateData.coordinateList = coordinateList
        //2,处理快递员id

        purePath = toPurePath(coordinateList)

        polygon.value = new Amap.Polygon({
            path: purePath,
            strokeColor: '#FF33FF',
            strokeWeight: 3,
            fillColor: '#1791fc',
            fillOpacity: 0.3
        })
        map.add(polygon.value)
        map.setFitView([polygon.value])
        polygonEditior = new AMap.PolygonEditor(map, polygon.value)
        polygonEditior.open()
        //记得把那个mousetool移除，不然会一直描绘
        isEditing.value = true
    })
})

onUnmounted(() => {
    map?.destroy()
})
const saveRequestData = {
    id: '',
    coordinateList: []
}
const coordinate = {
    longitude: '',
    latitude: ''
}
const startDraw = () => {
    if (isDrawing.value) {
        ElMessage.success('已退出绘制/编辑~')

        //正在绘制逻辑
        map.setDefaultCursor('pointer')
        if (isEditing.value) {
            const path = polygonEditior.getTarget()
            if (path == null || path.length == 0) {
                coordinateData.coordinateList = []
            } else {
                coordinateData.coordinateList = path.getPath().map((one) => {
                    return {
                        longitude: one.lng,
                        latitude: one.lat
                    }
                })
            }
            //你这拿到的可不是普通的对象，是高德封装的坐标对象
            polygonEditior.close()
            isEditing.value = false
        } else {
            //手动关闭编辑。
            mouseTool.close(true)
        }
        isDrawing.value = false
    } else {
        //不在绘制逻辑
        map.setDefaultCursor('crosshair')

        if (polygon.value) {
            ElMessage.success('正在编辑中~')
            //已有路径，修改！
            isEditing.value = true
            polygonEditior = new AMap.PolygonEditor(map, polygon.value)
            //多边形编辑器打开
            polygonEditior.open()
            // mouseTool.polygon({
            //     path: purePath,
            //     fillColor: '#00b0ff',
            //     fillOpacity: 0.3,
            //     strokeColor: '#004de6',
            //     strokeWeight: 3,
            //     strokeOpacity: 0.8
            // })
            // polygonEditior.on('end')
        } else {
            ElMessage.success('正在绘制中,右键结束初步绘制')
            mouseTool.polygon({
                fillColor: '#00b0ff',
                fillOpacity: 0.3,
                strokeColor: '#004de6',
                strokeWeight: 3,
                strokeOpacity: 0.8
            })
        }
        isDrawing.value = true
    }
}
const init = async () => {
    //先获取一遍数据，再初始化
    emit('get', id)
}
//watch方法，用于防止emit流转的data数据没到就初始化多边形，等到path变化了，才渲染多边形哦
watch(
    () => {
        return props.pathData?.path
        //有就.data没有就undefined
    },
    () => {
        if (props.pathData.path.length != 0) {
            path = props.pathData.path
            //还是解析一下（极寒）；

            purePath = props.pathData.purePath
            polygon.value = new Amap.Polygon({
                path: purePath,
                strokeColor: '#FF33FF',
                strokeWeight: 3,
                fillColor: '#1791fc',
                fillOpacity: 0.3
            })
            //自动调整视野
            coordinateData.coordinateList = path

            map.add(polygon.value)
            map.setFitView([polygon.value])
        } else {
            if (!isDrawing) {
                ElMessage.warning('该快递员暂无作业范围!')
            }
        }
    },
    { deep: true }
)

const handleClickDeleteButton = () => {
    dialogVisiblity.value = true
}
const deleteScopeMethod = async () => {
    isDrawing.value = false
    isEditing.value = false
    emit('delete', id)
    //清除原先的围栏
    // polygon.setMap(null)
    // polygon = null
    //重新获取新围栏，添加上
    removePolygonMethod()
    if (mouseTool) {
        mouseTool.close(true)
    }
    if (polygonEditior) {
        polygonEditior.close()
    }
    init()
    //要把编辑器也关掉。

    dialogVisiblity.value = false
}
const removePolygonMethod = () => {
    //清除原先的围栏
    if (polygon.value != null) {
        polygon.value.setMap(null)
        polygon.value = null
    }

    ElMessage.success('已清除围栏')
}
const save = async () => {
    //1,前面完成保存已经把输入存进去了。但是发送你还需要转化。
    //2,浅拷贝
    const list = [...coordinateData.coordinateList]
    if (list.length == 0) {
        ElMessage.error('图形描点不少于三个！')
        return
    }
    list.push(list[0])
    emit('save', { ...coordinateData, coordinateList: list })
}

const toPurePath = (rawPath) => {
    const purePath = []
    rawPath.forEach((element) => {
        //element=="132.2121,23.21"
        const oneArray = []
        oneArray[0] = element.longitude
        oneArray[1] = element.latitude
        purePath.push(oneArray)
    })
    return purePath
}
const toRawPath = (purePath) => {
    const coordinateList = []
    purePath.forEach((element) => {
        //element=="132.2121,23.21"
        const oneCoordinate = {}
        oneCoordinate.longitude = element[0]
        oneCoordinate.latitude = element[1]
        coordinateList.push(oneCoordinate)
    })
    return coordinateList
}

//获取当前快递员对应的中心点
const getCenter = () => {
    const coordinateStr = props.routeQuery.agencyCoordinate
    if (coordinateStr == null) {
        return []
    }
    const lon = parseFloat(coordinateStr.split(',')[0])
    const lat = parseFloat(coordinateStr.split(',')[1])

    return [lon, lat]
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
