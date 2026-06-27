import request from "../utils/request.js"

export const getSign = () => {
    //投入个半小时时间也可以
    return request({
        url: "/api/oss/sign",
        method: "GET"
    });
}