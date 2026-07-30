import request from '../utils/request'
export const login = (data) => {
    return request({
        url: '/api/manager/login',
        method: 'POST',
        data: data
    })
}
