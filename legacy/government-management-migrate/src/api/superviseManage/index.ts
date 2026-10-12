import { request } from "@/service/index";
enum URL {
  /**获取事项类别分页 */
  getFocusWorkCategoryList = "/official/focusWork/category",
  /**新增事项类别 */
  addFocusWorkCategory = "/official/focusWork/category",
  /**删除印章 */
  deleteFocusWorkCategory = "/official/focusWork/category/",
  /*编辑印章 */
  updateFocusWorkCategory = "/official/focusWork/category/",
  /**督办事项处理列表 */
  getFocusWorkHandleApprovalList = "/official/focusWork/page/extendFlow",
  /**督办事项分页查询 */
  getFocusWorkFlowPage = "/official/focusWork/flow/page",
  /**督办工作审批分页查询 */
  getFocusWorkApprovalList = "/focusWork/page/extendFlow",
  /**获取第一责任人列表 */
  getFirstUsersOption = "/official/focusWork/firstUsers",
  /**督办处理事项详情 */
  getFocusWorkDetail = "/official/focusWork/",
  /**获取督办处理事项反馈 */
  getFocusWorkReply = "/official/focusWork/",
  // 督办处理回复
  replyFocusWorkHandle = "/official/focusWork/fail",
}
interface addCategoryParams {
  name: string,
  remark: string
}
interface getCategoryParams {
  name: string,
  pageNumber: number,
  pageSize: number
}
interface ReplyFocusWorkHandle {
  focusWorkId:string;
  fileIds:string;
  failReason:string
}
/**
 * 新增事项类别
 */
export const addFocusWorkCategory = (data: addCategoryParams) => {
  return request.post(URL.addFocusWorkCategory, data);
};
/**
 * 督办处理回复
 */
export const replyFocusWorkHandle = (data: ReplyFocusWorkHandle) => {
  return request.post(URL.replyFocusWorkHandle, data);
};
/**
 * 获取回复内容
 * 
 */
export const getreplyFocusWorkContent = (id: string) => {
  return request.get(`/official/focusWork/${id}/fail`);
}
/**
 * 获取事项类别分页
 */
export const getFocusWorkCategoryList = (params: getCategoryParams) => {
  return request.get(URL.getFocusWorkCategoryList, { params });
}

/**
 * 修改事项类别
 */

export const updateFocusWorkCategory = (id: string, data: {
  name: string,
  remark: string
}) => {
  return request.put(URL.updateFocusWorkCategory + id, data);
};
/** 
 * 删除事项类别
*/
export const deleteFocusWorkCategory = (id: string) => {
  return request.delete(URL.deleteFocusWorkCategory + id);
};
interface focusWorkPage {
  period: string,
  status: string | null,
  deptId: string | null,
  firstUserId: string | null,
  pageNumber: number,
  pageSize: number,
  keyword: string | null;
}
/** 
 * 督办事项处理列表
*/
export const getFocusWorkHandleApprovalList = (params: focusWorkPage) => {
  return request.get(URL.getFocusWorkHandleApprovalList, { params });
};
/**
 * 获取第一责任人列表
 */
export const getFirstUsersOption = () => {
  return request.get(URL.getFirstUsersOption);
}
/**
 * 督办工作审批分页查询
 */
export const getFocusWorkApprovalList = (params: {
  businessType: string,
  dataType: string,
}) => {
  return request.get(URL.getFocusWorkApprovalList, { params });
};
/**
 * 督办事项处理详情
 */
export const getFocusWorkDetail = (id: string) => {
  return request.get(URL.getFocusWorkDetail + id + '/detail/reply');
}
/**
 * 督办事项反馈记录
 */
export const getFocusWorkReply = (id: string) => {
  return request.get(URL.getFocusWorkReply + id + '/reply');
}
interface focusWorkFlow {
  businessType: string,
  type: string,
  submitTime: string,
  status: string | null
}
/**督办事项分页查询 */
export const getFocusWorkFlowPage = (params: focusWorkFlow) => {
  return request.get(URL.getFocusWorkFlowPage, { params });
}
