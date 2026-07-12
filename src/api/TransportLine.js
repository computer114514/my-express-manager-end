import request from "@/utils/request";

export const createTransportLine = (data) => {
    return request({
        url: "api/manager/line/create",
        method: "POST",
        data
    });
}

export const updateTransportLine = (data) => {
    return request({
        url: "api/manager/line/update",
        method: "POST",
        data
    });
}

export const deleteTransportLine = (data) => {
    return request({
        url: "api/manager/line/delete",
        method: "POST",
        params: data
    });
}

export const getTransportLinePage = (data) => {
    return request({
        url: "api/manager/line/getLinePage",
        method: "get",
        params: data
    });
}