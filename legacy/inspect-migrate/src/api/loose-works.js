import request from "@/utils/request";
let baseURL = '/api/loose-works'

// 小散工程监管列表
export const projectList = (params) =>
	request({
		url: baseURL + '/project/schedule/list',
		method: 'get',
		params
	})
