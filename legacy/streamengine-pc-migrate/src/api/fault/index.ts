import { request } from "@/service";
let baseURL = "/maintain";

// 故障类型
export const getFaultTypeList = (businessType:string) => {
  return request.get(baseURL + `/fault-type/list?applicationCode=${businessType}`);
};
