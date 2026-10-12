import request from '@/utils/request'
let baseURL = '/api/flow'

// 获取类型列表
export const getFormflowTypeList = (params,method) =>
	request({
		url: baseURL + `/form-flow/type/list`,
		method: 'get',
		params
	})
	

// 获取状态列表
export const getFormflowStatusList = (params,method) =>
	request({
		url: baseURL + `/form-flow/status/list`,
		method: 'get',
		params
	})

// 获取应用列表
export const getFormflowApplicationList = (params,method) =>
	request({
		url: baseURL + `/form-flow/application/list`,
		method: 'get',
		params
	})
	
// 表单流程分页查询
export const getFormflowPage = (params,method) =>
	request({
		url: baseURL + `/form-flow/page`,
		method: 'get',
		params
	})
	
	
// 删除
export const deleteFormflow = (params,method) =>
	request({
		url: baseURL + `/form-flow/${params?.id??params}`,
		method: 'delete',
		
	})
	
// 启停用
export const putEnable = (params,method) =>
	request({
		url: baseURL + `/form-flow/enable`,
		method: 'put',
		params
	})

//新增或修改表单
export const postFormFlows = (data, method = "post") =>
	request({
		url: baseURL + "/form-flows",
		method: method,
		data,
	});

//新增或修改基础审批表单
export const postCustomFormFlows = (data, method = "post") =>
	request({
		url: baseURL + "/custom-form-flow/save-or-update",
		method: method,
		data,
	});
	

//ID查询表单
export const getFormFlow = (params, method = "get") =>
	request({
		url: baseURL + `/form-flow/${params?.id??params}`,
		method: method,
		params,
	});

//ID查询基础审批表单
export const getCustomFormFlow = (params, method = "get") =>
	request({
		url: baseURL + `/custom-form-flow/${params?.id??params}`,
		method: method,
		params,
	});

//根据业务type查询关联关系
export const getFormFlowBusiness = (params, method = "get") =>
	request({
		url: baseURL + `/form-flow-business/type`,
		method: method,
		params,
	});
	

//发起审批
export const postFormFlowsFirst = (data, method = "post") =>
	request({
		url: baseURL + `/form-flows/first/submit`,
		method: method,
		data,
	});

//同意审批
export const postProcessTaskComplete = (data, method = "post") =>
	request({
		url: baseURL + `/process/task/complete`,
		method: method,
		data,
	});
	

//拒绝审批
export const postProcessTaskReject = (data, method = "post") =>
	request({
		url: baseURL + `/process/task/reject`,
		method: method,
		data,
	});
	

//taskId查询表单任务
export const getProcessTaskForm = (params, method = "get") =>
	request({
		url: baseURL + `/process/task/form/id/${params?.id??params}`,
		method: method,
		params,
	});
	
//公开表单分享链接生成二维码
export const getQrCode = (params, method = "get") =>
	request({
		url: baseURL + `/form-flow/qr-code`,
		method: method,
		params,
	});

//表单流程分组-列表
export const getFormFlowGroupList = (params, method = "get") =>
	request({
		url: baseURL + `/form-flow-group/list`,
		method: method,
		params,
	});