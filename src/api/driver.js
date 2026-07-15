import request from '../utils/request'

const prefix = "/api/manager/driver/";
// 获取用户列表
export function getDriverList(data) {
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
export function createDriver(data) {
    return request({
        url: prefix + "create",
        method: 'post',
        data
    })
}

// 更新用户
export function updateDriver(data) {
    return request({
        url: prefix + "update",
        method: 'post',
        data
    })
}

// 删除用户
export function deleteDriver(id) {
    return request({
        url: prefix + `delete/${id}`,
        method: 'post'
    })
}