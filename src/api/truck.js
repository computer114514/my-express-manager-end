import request from '../utils/request'

const prefix = "/api/manager/truck/";
// 获取用户列表
export function getTruckList(data) {
    return request({
        url: prefix + "getPage",
        method: 'get',
        params: {
            "pageSize": data.pageSize,
            "pageNum": data.pageNum
        }
    })
}

// 创建用户
export function createTruck(data) {
    return request({
        url: prefix + "create",
        method: 'post',
        data
    })
}

// 更新用户
export function updateTruck(data) {
    return request({
        url: prefix + "update",
        method: 'post',
        data
    })
}

// 删除用户
export function deleteTruck(id) {
    return request({
        url: prefix + `delete/${id}`,
        method: 'post'
    })
}