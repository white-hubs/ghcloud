import request from '@/utils/request'
let baseURL = '/api/emergency'

export const geteventtypes = params =>
	request({
		url: baseURL + "/emergency-event-types",
		method: "get",
		params,
	});

// 预案规则分页列表
export const planRulesList = (params) =>
	request({
		url: baseURL + '/emergency-rule/list-page',
		method: 'get',
		params
	})

// 线损规则分页列表
export const planRulesLineList = (params) =>
	request({
		url: '/api/securitymanagement/lineLoss/alarm/rule/pageList',
		method: 'get',
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
// 线损规则删除
export const deletePlanLineRules = (params) =>
	request({
		url: `/api/securitymanagement/lineLoss/alarm/rule/delete?id=${params?.id || params}`,
		method: 'delete',
	})
// 线损规则状态
export const enabledPlanLineRules = (data) =>
	request({
		url: `/api/securitymanagement/lineLoss/alarm/rule/enableRule`,
		method: 'post',
		data
	})