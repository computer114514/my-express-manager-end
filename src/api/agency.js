import request from '../utils/request'
export const getOrganTree = () => {
    return request({
        url: '/api/organ/tree',
        method: 'GET'
    })
}
export const getOrganById = (id) => {
    return request({
        url: '/api/organ/' + id,
        method: 'GET'
    })
}