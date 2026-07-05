import request from "@/utils/request"

export const saveOrganScope = (data) => {
    return request({
        method: "POST",
        url: "/api/manager/organScope/save",
        data: data
    })
}

export const getOrganScope = (organId) => {
    return request({
        method: "GET",
        url: `/api/manager/organScope/${organId}`,
    })
}

export const deleteScope = (organId) => {
    return request({
        method: "POST",
        url: `/api/manager/organScope/${organId}`,
    })
}