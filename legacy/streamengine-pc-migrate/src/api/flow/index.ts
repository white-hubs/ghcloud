import {
  PostProcessTaskBack,
  PostProcessTaskComplete,
  PostProcessTaskReject,
} from "@/domain/form-flow";
import { request } from "@/service";
let baseURL = "/flow";

//taskId查询表单任务
export const getProcessTaskForm = (params: { id: string }) => {
  return request.get(baseURL + `/process/task/form/id/${params.id}`);
};

//根据业务type查询关联关系
export const getFormFlowBusiness = (params: { businessType: string }) => {
  return request.get(baseURL + `/form-flow-business/type`, { params });
};

//通过业务类型查询流程ID
export const getFormFlowBusinessFlow = (params: { businessType: string }) => {
  return request.get(
    baseURL +
      `/form-flow-business/${
        params.businessType ? params.businessType : params
      }/flow`
  );
};

//发起审批
interface PostFormFlowsFirst {
  /**
   * 应用
   */
  application: string;
  /**
   * 应用名称
   */
  applicationName: string;
  /**
   * 业务类型
   */
  businessType: string;
  /**
   * data
   */
  data: string;
  /**
   * 流程key
   */
  flowKey: string;
  /**
   * 表单定义id
   */
  formDefinitionId: string;
  /**
   * 表单定义版本
   */
  formDefinitionVersion: number;
  /**
   * 表单定义key
   */
  formKey: string;
  type: string;
  variables?: { [key: string]: any };
  backLogTitle?: string;
  /**
   * 发起自选节点对应人员
   */
  approveUsers?: Record<string,string>;
}
export const postFormFlowsFirst = (data: PostFormFlowsFirst) => {
  return request.post(baseURL + `/form-flows/first/submit`, data);
};

export const postProcessTaskComplete = (data: PostProcessTaskComplete) => {
  return request.post(baseURL + `/process/task/complete`, data);
};

//拒绝审批
export const postProcessTaskReject = (data: PostProcessTaskReject) => {
  return request.post(baseURL + `/process/task/reject`, data);
};

//再次发起审批
export const postProcessTaskRepeat = (data: { processInstanceId: string }) => {
  return request.post(baseURL + `/process/task/repeat`, data);
};

//撤销审批
export const postProcessTaskUndo = (data: {
  comment: string | null;
  processInstanceId: string;
}) => {
  return request.post(baseURL + `/process/task/undo`, data);
};
//撤回审批
export const postProcessWidthDraw = (data: PostProcessTaskBack) => {
  return request.post(baseURL + `/process/task/withdraw`, data);
};

//回退审批
export const postProcessTaskBack = (data: PostProcessTaskBack) => {
  return request.post(baseURL + `/process/task/back`, data);
};
// 获取上一个签名
export const getLastWriteSign = ()=>{
  return request.post(baseURL + `/process/task/user-last-sign`);
}

//转交审批
interface PostProcessTransfer {
  /**
   * 账户，不传默认当前用户id
   */
  account: string | null;
  /**
   * 转交的用户id
   */
  targetAccount: string;
  taskId: string;
  /** 转交备注 借用审批意见字段*/
  approvalOpinion:{
    text:string
  }
}
export const postProcessTransfer = (data: PostProcessTransfer) => {
  return request.post(baseURL + `/process/task/transfer`, data);
};

//生成审批单号 暂时弃用
export const createFlowNo = (params: { prefix: string }) => {
  return request.get(
    `/attendance/common/approval/biz/form/no?prefix=${params.prefix}`
  );
};

//流程路径
export const getProcessInstanceHistoricalPath = (params: {
  processInstanceId: string;
}) => {
  return request.get(
    baseURL +
      `/process/instance/${params.processInstanceId}/historical/path/line`
  );
};

/** 流程路径2.0 */
export const getProcessLine = (params: {
  processInstanceId: string;
  flowKey?: string;
}) => {
  return request.get(baseURL + `/process/historical/path/line`, { params });
};

//指定审批人
interface SetAppointApprover {
  /**
   * 流程实例id
   */
  processInstanceId: string;
  /**
   * 节点唯一标识
   */
  taskKey: string;
  /**
   * 指定的审批人员的id
   */
  userIds: string[];
}
export const setAppointApprover = (params: SetAppointApprover) => {
  return request.post(baseURL + `/process/task/appoint-approver`, params);
};

export const reduceAppointApprover = (params: SetAppointApprover) => {
  return request.post(baseURL + `/process/task/pre-reduce-sign`, params);
};

//判断当前流程是否处于第一个审批节点
export const firstTaskActive = (params: { processInstanceId: string }) => {
  return request.get(
    baseURL + `/flow/${params.processInstanceId}/first/task/active`
  );
};


// 获取历史审批流程列表
export const getProcessApprovalList = (params: {
  businessType: string | undefined;
  organizationId: string | undefined;
  submitTime: string;
  pageNumber: number;
  pageSize: number;
  username: string;
  applicationCode: string;
}) => {
  return request.get(baseURL + `/process/instance/historical/allPage`, {
    params,
  });
};

//查询流程需要打印的节点信息
export const printNode = (params: { processInstanceId: string }) => {
  return request.get(
    baseURL + `/process/print/node`,
    {params}
  );
};
//流程审批记录导出
export const postHistoricalExport = (params: { 
  submitTime?: string,
  username?: string,
  status?: string| undefined,
  applicationCode?: string,
  businessType?:string| undefined,
  exportName?:string;
  startUserId?:string;
  organizationId?:string| undefined;
  processInstanceIds?:string
  processInstanceIdsList?:string[]

}) => {
  return request.get(
    baseURL + `/process/instance/historical/export`,
    {params,responseType: 'blob'}
  );
};
export const setFeedBack = (params: {
  processId: string,
  taskNodeKey: string,
  feedbackInfo: string,
  taskId: string,
  fileIdList: string[]
}) => {
  return request.post(baseURL + `/task/feedback/log/submit`, params);
};
//判断当前流程是否处于第一个审批节点
export const getFeedBack = (params: { processInstanceId: string ,taskNodeKey:string}) => {
  return request.get(
    baseURL + `/task/feedback/log/get/log`,{params}
  );
};
// 获取节点
export const getTaskNodes = (params: { processInstanceId: string }) => {
  return request.get(
    baseURL + `/process/task/historical/finished/task-node/${params.processInstanceId}`,{params}
  )
}