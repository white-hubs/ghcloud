import request from "../utils/request";
let baseURL = "/api/ticket";

//工单类型分页查询
export const getTicketTypePage = (params, type) =>
  request({
    url: baseURL + "/ticket-type/page",
    method: "get",
    params,
  });

//工单类型新增
export const postTicketType = (params, type) =>
  request({
    url: baseURL + "/ticket-type",
    method: "post",
    params,
  });

//工单类型编辑
export const putTicketType = (params, type) =>
  request({
    url: baseURL + `/ticket-type/` + (params.id ? params.id : params),
    method: "put",
    params,
  });

//工单类型删除
export const deleteTicketType = (params, type) =>
  request({
    url: baseURL + `/ticket-type/` + (params.id ? params.id : params),
    method: "delete",
  });

//工单项删除
export const deleteTicketItem = (params, type) =>
  request({
    url: baseURL + `/ticket-item/` + (params.id ? params.id : params),
    method: "delete",
  });

//新增工单项
export const postTicketItem = (params, type) =>
  request({
    url: baseURL + "/ticket-item",
    method: "post",
    params,
  });

//编辑工单项
export const putTicketItem = (params, type) =>
  request({
    url: baseURL + `/ticket-item/` + (params.id ? params.id : params),
    method: "put",
    params,
  });

//获取工单项详情
export const getTicketItem = (params, type) =>
  request({
    url: baseURL + "/ticket-item/" + (params.id ? params.id : params),
    method: "get",
  });

//工单项分页查询
export const getTicketItemPage = (params, type) =>
  request({
    url: baseURL + "/ticket-item/page",
    method: "get",
    params,
  });

//工单项标准列表
export const getObjectTypeList = (params, type) =>
  request({
    url: baseURL + "/object-type/list",
    method: "get",
    params,
  });

//关联工单项
export const postTicketItemObjectType = (params, type) =>
  request({
    url: baseURL + "/ticket-item-object-type",
    method: "post",
    params,
  });

//根据工单对象类型获取工单项
export const getTicketItemObjectTypeList = (params, type) =>
  request({
    url: baseURL + "/ticket-item/object-type/list",
    method: "get",
    params,
  });

//工单中心分页查询
export const getTicketPage = (params, type) =>
  request({
    url: baseURL + "/ticket/page",
    method: "get",
    params,
  });

//新增工单
export const postTicket = (params, type) =>
  request({
    url: baseURL + "/ticket",
    method: "post",
    params,
  });

//工单详情
export const getTicket = (params, type) =>
  request({
    url: baseURL + `/ticket/${params.id ? params.id : params}`,
    method: "get",
  });

//工单关闭
export const putTicketClosed = (params, type) =>
  request({
    url: baseURL + `/ticket/${params.id ? params.id : params}/closed`,
    method: "put",
  });

//工单流程分页查询
export const getTicketFlowPage = (params, type) =>
  request({
    url: baseURL + `/ticket-flow/page`,
    method: "get",
    params,
  });
//工单流程更新
export const putTicketFlow = (params, type) =>
  request({
    url: baseURL + `/ticket-flow/${params.id ? params.id : params}`,
    method: "put",
    params,
  });

//工单流程新增
export const postTicketFlow = (params, type) =>
  request({
    url: baseURL + `/ticket-flow`,
    method: "post",
    params,
  });

//工单流程删除
export const deleleTicketFlow = (params, type) =>
  request({
    url: baseURL + `/ticket-flow/${params.id ? params.id : params}`,
    method: "delete",
  });

//根据工单主键获取工单事件集合
export const getTicketEventList = (params, type) =>
  request({
    url: baseURL + `/ticket-event/${params.id ? params.id : params}/list`,
    method: "get",
  });
