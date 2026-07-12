import request from '../utils/request'
export const getOrganTree = () => {
    return request({
        url: '/api/manager/organ/tree',
        method: 'GET'
    })
}
export const getOrganById = (id) => {
    return request({
        url: '/api/manager/organ/' + id,
        method: 'GET'
    })
}

export const createOrgan = (data) => {
    return request({
        url: '/api/manager/organ/create',
        method: "POST",
        data: data
    })
}

export const updateOrgan = (data) => {
    return request({
        url: '/api/manager/organ/update',
        method: "POST",
        data: data
    })
}

export const deleteOrgan = (id) => {
    return request({
        url: '/api/manager/organ/delete/' + id,
        method: "POST",
    })
}

export const getOrganType = () => {
    return request({
        url: '/api/manager/organ/organType',
        method: "GET"
    })
}