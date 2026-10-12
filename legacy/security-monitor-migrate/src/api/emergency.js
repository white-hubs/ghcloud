import request from '@/utils/request'
let baseURL = '/api/emergency'

// 预案规则分页列表
export const planRulesList = (params) =>
	request({
		url: baseURL + '/emergency-rule/list-page',
		method: 'get',
		params:{
		...params,
	
		}
	})
export const geteventtypes = params =>
  request({
    url: baseURL + "/emergency-event-types",
    method: "get",
    params,
  });

// 预案文件分页列表
export const planDocumentList = (params) =>
	request({
		url: baseURL + '/emergency-files',
		method: 'get',
		params
	})
// 预案文件新增
export const addPlanDocument = (data) =>
	request({
		url: baseURL + '/emergency-file',
		method: 'post',
		data
	})
// 预案文件修改
export const editPlanDocument = (data) =>
	request({
		url: baseURL + `/emergency-file/${data.id}`,
		method: 'put',
		data
	})
// 预案文件详情
export const planDocumentDetail = (params) =>
	request({
		url: baseURL + `/emergency-file/${params?.id || params}`,
		method: 'get',
		params
	})
//预案文件删除
export const deleteDocumentDetail = (params) =>
	request({
		url: baseURL + `/emergency-file/${params?.id || params}`,
		method: 'delete',
		params
	})


//预案规则详情
export const planRulesDetail = (params) =>
	request({
		url: baseURL + `/emergency-rule/${params?.emergencyRuleId || params}`,
		method: 'get',
	})
//预案规则新增
export const addPlanRules = (data) =>
	request({
		url: baseURL + `/emergency-rule`,
		method: 'post',
		data
	})
// 预案规则修改
export const editPlanRules = (data) =>
	request({
		url: baseURL + `/emergency-rule`,
		method: 'put',
		data
	})
// 预案规则修改启用状态
export const enabledPlanRules = (data) =>
	request({
		url: baseURL + `/emergency-rule/enabled`,
		method: 'put',
		data
	})
// 预案规则删除
export const deletePlanRules = (params) =>
	request({
		url: baseURL + `/emergency-rule/delete/${params?.id || params}`,
		method: 'delete',
	})
//预案规则批量删除
export const batchDeletePlanRules = (params) =>
	request({
		url: baseURL + `/emergency-rule/delete/batch/${params?.ids || params}`,
		method: 'delete',
		params
	})
// 预案类型列表
export const reservePlanTypes = (params) =>
	request({
		url: baseURL + `/emergency-types`,
		method: 'get',
		params
	})
