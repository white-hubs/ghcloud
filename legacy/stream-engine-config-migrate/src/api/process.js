import request from "@/utils/request";
let baseURL = "/api/maintain";
// 隐患类型
export const getProblemTypeList = () => {
  return request.get(baseURL + `/hidden-danger-type/list`);
};
export const getFaultTypeList = (params ) => {
  return request.get(baseURL + `/fault-type/list`,{ params });
};
