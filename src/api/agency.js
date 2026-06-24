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

export const createOrgan = (data) => {
    return request({
        url: '/api/organ/create',
        method: "POST",
        data: data
    })
}

export const updateOrgan = (data) => {
    return request({
        url: '/api/organ/update',
        method: "POST",
        data: data
    })
}

export const deleteOrgan = (id) => {
    console.log("delete id:", id);
    return request({
        url: '/api/organ/delete/' + id,
        method: "POST",
    })
}

export const getOrganType = () => {
    return request({
        url: '/api/organ/organType',
        method: "GET"
    })
}