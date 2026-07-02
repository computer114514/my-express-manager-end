import request from "@/utils/request"

export const saveCourierScope = (data) => {
    return request({
        method: "POST",
        url: "/api/manager/courierScope/save",
        data: data
    })
}

export const getCourierScope = (courierId) => {
    return request({
        method: "GET",
        url: `/api/manager/courierScope/${courierId}`,
    })
}

export const deleteScope = (courierId) => {
    return request({
        method: "POST",
        url: `/api/manager/courierScope/delete/${courierId}`,
    })
}