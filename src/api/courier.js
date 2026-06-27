
import request from '../utils/request'

const prefix = "/api/manager/courier/";
// 获取用户列表
export function getCourierList(data) {
  console.log("data", data);
  return request({
    url: prefix + "getCourierPage",
    method: 'get',
    params: {
      "pageSize": data.pageSize,
      "pageNum": data.pageNum
    }
  })
}

// 创建用户
export function createCourier(data) {
  return request({
    url: prefix + "create",
    method: 'post',
    data
  })
}

// 更新用户
export function updateCourier(data) {
  return request({
    url: prefix + "update",
    method: 'post',
    data
  })
}

// 删除用户
export function deleteCourier(id) {
  return request({
    url: prefix + `delete/${id}`,
    method: 'post'
  })
}