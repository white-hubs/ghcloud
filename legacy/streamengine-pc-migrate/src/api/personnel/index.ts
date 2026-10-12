import { request } from "@/service";
let baseURL = '/personnel'

//由后端维护的表单业务组件枚举
export const getFormControlEnum = (type:string) => {
  return request.get(baseURL + `/approval/biz/form/control/enum?type=${type}`);
}