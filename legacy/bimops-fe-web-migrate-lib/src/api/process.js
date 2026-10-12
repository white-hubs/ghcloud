import request from "../utils/request";
let baseURL = "/api/process";

// 获取流程定义
export const getProcessDefinitions = (params, method = "get") =>
  request({
    url: baseURL + "/process-definitions/",
    method: "get",
    params,
  });

// 获取流程定义
export const postProcessDefinitions = (params, method = "post") =>
  request({
    url: baseURL + "/process-definitions",
    method: "post",
    params,
  });

// 发布流程定义
export const postProcessDefinitionsDeploy = (params, method = "post") =>
  request({
    url: baseURL + "/process-definitions/deploy",
    method: "post",
    params,
  });

// 新增流程定义信息
export const postProcessDefinition = (params, method = "post") =>
  request({
    url: baseURL + "/process-definition",
    method: "post",
    params,
  });

// 编辑流程定义信息
export const putProcessDefinition = (params, method = "put") =>
  request({
    url: baseURL + "/process-definition",
    method: "put",
    params,
  });

// 获取流程定义列表
export const getProcessDefinition = (params, method = "get") =>
  request({
    url: baseURL + `/process-definition/list-page`,
    method: "get",
    params,
  });

// 删除流程
export const deleteProcessDefinition = (params, method = "delete") =>
  request({
    url: baseURL + `/process-definition/delete/${params.id ? params.id : params}`,
    method: "delete",
  });

// 表单列表
export const getFormList = (params, method = "get") =>
  request({
    url: baseURL + "/form/definition/list",
    method: "get",
    params,
  });

// 表单定义新增
export const postFormDefinition = (params, method = "post") =>
  request({
    url: baseURL + "/form/definition/publish",
    method: "post",
    params,
  });

// 根据id获取表单定义
export const getFormDefinition = (params, method = "get") =>
  request({
    url: baseURL + `/form/definition/${params.id ? params.id : params}`,
    method: "get",
    params,
  });

// 表单删除
export const deleteFormDefinition = (params, method = "delete") =>
  request({
    url: baseURL + `/form/definition/${params.id ? params.id : params}`,
    method: "delete",
  });
