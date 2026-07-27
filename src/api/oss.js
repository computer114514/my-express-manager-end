import request from "../utils/request.js"

export const getSign = () => {
    //投入个半小时时间也可以
    return request({
        url: "/api/user/oss/sign",
        method: "GET"
    });
}