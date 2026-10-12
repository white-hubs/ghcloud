import request from '@/utils/request'
let baseURL = '/api/alarm'

// 预案文件分页列表
export const alarmLevelList = (params) =>
	request({
		url: baseURL + '/sat-alarm-levels',
		method: 'get',
		params
	})