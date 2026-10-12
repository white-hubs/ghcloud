import { request } from '@/service/index'
enum URL {
  /** 获取审批业务类型 */
  GET_APPROVAL_TYPE = '/approval/biz/type',
  /** 通过业务类型查询流程ID */
  GET_FORM_FLOW_BUSINESS_FLOW = '/flow/form-flow-business/',
  /** 获取表单流程列表 */
  GET_FORM_FLOW_LIST = '/flow/form-flow/list',
  /** ID查询表单 */
  GET_FORM_FLOW_BY_ID = '/flow/form-flow',
  /** 查询流程表单业务字段 */
  GET_FLOW_FORM_FIELD = '/approval/biz/form/field',
  // 保存流程关联
  SAVE_FORM_FLOW_BUSINESS = '/flow/form-flow-business',
  // 获取流程表格数据
  GET_FLOW_PROCESS_PAGE = '/flow/process/instance/historical/page'
}
/**
 * 获取审批业务类型
 */
export const getApprovalType = async (api:string,applicationCode?:string): Promise<Service.RequestResult< { code: string; name: string; }[]>> => {
  return request.get(api+URL.GET_APPROVAL_TYPE+`?applicationCode=${applicationCode}`)
}
/**
 * 通过业务类型查询流程ID
 *
 */
export const getFormFlowBusinessFlow = async (code: string): Promise<string> => {
  return request.get(URL.GET_FORM_FLOW_BUSINESS_FLOW + code + '/flow')
}
/**
 * 获取表单流程列表
 */
export const getFormFlowList = async (params: { enable: boolean;application: string; }): Promise<Service.RequestResult> => {
  return request.get(URL.GET_FORM_FLOW_LIST, {
    params,
  })
}
/**
 * ID查询表单
 */
export interface GetFlowformField {
  formBizFieldMapList: { controlId: string; businessField: string; }[];
  formDefinitionId?: string;
  id: string;
  formJson: string;
}

export const getFormFlowbyId = async (params: { id: string; }): Promise<Service.RequestResult<GetFlowformField>> => {
  return request.get(URL.GET_FORM_FLOW_BY_ID + `/${params.id}`, {
    params,
  })
}

/**
 * 获取流程表格数据
 */
export interface FlowPageState {
  pageNumber: number;
  pageSize: number;
  type: string;
  businessType: string;
  status?: string | null;
  submitTime?: string;

}

export const getFlowProcessPage = async (params: FlowPageState): Promise<Service.RequestResult<{ data: unknown; }>> => {
  return request.get<{ data: unknown; }>(URL.GET_FLOW_PROCESS_PAGE, {
    params,
  })
}
/**
 * 查询流程表单业务字段
 */
export const getFlowformField = async (api:string,params?: { type: string; }): Promise<Service.RequestResult> => {
  return request.get(api+URL.GET_FLOW_FORM_FIELD, {
    params,
  })
}
/**
 * 保存业务流程关联
 *
 */
interface SaveParams {
  formDefinitionId: string;
  businessType: string | undefined;
  businessTypeName: string | undefined;
  formFlowId: string;
  fieldMapList: unknown[];
}

export const saveFormFlowBusiness = async (params: SaveParams): Promise<any> => {
  return request.post(URL.SAVE_FORM_FLOW_BUSINESS, params)
}
