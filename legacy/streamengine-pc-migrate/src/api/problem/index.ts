import { request } from "@/service";
let baseURL = "/maintain";

// 隐患类型
export const getProblemTypeList = () => {
  return request.get(baseURL + `/hidden-danger-type/list`);
};

// 隐患程度
export const getProblemLevelList = () => {
  return request.get(baseURL + `/hidden-danger-level/list`);
};
