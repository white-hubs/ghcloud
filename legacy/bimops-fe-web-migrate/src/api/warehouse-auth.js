import request from "@/utils/request";

export const getWarehouseLoginInfo = () =>
  request({
    url: "/api/changsha-xialing/liangcang/warehouse-auth/login-info",
    method: "post",
    token: false,
  });
