import { request } from "@/service";
let baseURL = '/official'

//印章列表查询（用于表单控件
export const getOfficialSealList = (params?: { sealName?: string }) => {
  return request.get(baseURL + `/officialSeal/widget/list`, { params });
}

//督办事项类型列表查询
export const getFocusWorkTypeList = (params?: { name?: string }) => {
  return request.get(baseURL + `/focusWork/category/weight/list`, { params });
}

//通过Id查询督办事项
export const getFocusWork = (params: { id: string }) => {
  return request.get(baseURL + `/focusWork/weight/${params.id}`);
}

//督办事项状态列表
export const getFocusWorkStatusList = () => {
  return request.get(baseURL + `/focusWork/weight/status/list`);
}

//督办事项列表
export const getFocusWorkList = () => {
  return request.get(baseURL + `/focusWork/weight/list`);
}

//督办事项工作要求
export const getFocusWorkRequirement = (params: { id: string }) => {
  return request.get(baseURL + `/focusWork/weight/${params.id}/requirement`);
}

//督办事项完成时间
export const getFocusWorkCompleteTime = (params: { id: string }) => {
  return request.get(baseURL + `/focusWork/weight/${params.id}/completeTime`);
}