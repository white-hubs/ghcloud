import { request } from "@/service/index";
enum URL {
  /**获取审批业务类型 */
  getApprovalType = "/personnel/approval/biz/type",
  /**通过业务类型查询流程ID */
  getFormFlowBusinessFlow = "/flow/form-flow-business/",
  /**获取表单流程列表 */
  getFormFlowList = "/flow/form-flow/list",
  /**ID查询表单 */
  getFormFlowbyId = "/flow/form-flow",
  /**查询流程表单业务字段 */
  getFlowformField = "/personnel/approval/biz/form/field",
  // 保存流程关联
  saveFormFlowBusiness = "/flow/form-flow-business",
  // 获取流程表格数据
  getFlowProcessPage = "/flow/process/instance/historical/page"
}
/**
 * 获取审批业务类型
 */
export const getApprovalType = () => {
  return request.get(URL.getApprovalType);
};
/**
 * 通过业务类型查询流程ID
 *
 */
export const getFormFlowBusinessFlow = (code: string) => {
  return request.get(URL.getFormFlowBusinessFlow + code + "/flow");
};
/**
 * 获取表单流程列表
 */
export const getFormFlowList = (params: {
  enable: boolean;
  application: string
}) => {
  return request.get(URL.getFormFlowList, {
    params,
  });
};
/**
 * ID查询表单
 */
export const getFormFlowbyId = (params: {
  id: string;
}) => {
  return request.get(URL.getFormFlowbyId + `/${params.id}`, {
    params,
  });
};

/**
 * 获取流程表格数据
 */
export interface flowPageState {
  pageNumber: number,
  pageSize: number,
  type: string,
  businessType: string,
  status?: string | null,
  submitTime?: string,
}

export const getFlowProcessPage = (params: flowPageState) => {
  return request.get(URL.getFlowProcessPage, {
    params,
  });
};
/**
 * 查询流程表单业务字段
 */
export const getFlowformField = (params: {
  type: string;
}) => {
  return request.get(URL.getFlowformField, {
    params,
  });
};
/**
 * 保存业务流程关联
 * 
 */
interface saveParams {
  formDefinitionId: string;
  businessType: string | undefined;
  businessTypeName: string | undefined;
  formFlowId: string;
  fieldMapList: any[];
}
export const saveFormFlowBusiness = (params: saveParams) => {
  return request.post(URL.saveFormFlowBusiness, params);
};