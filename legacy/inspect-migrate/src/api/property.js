import request from '@/utils/request'
let baseURL = '/api/property'

// 获取档位/现场点关联的风险源
export function stallPoint(data) {
	return request({
		url: baseURL + '/risk/source/ledger/stall-point',
		method: 'post',
		data
	})
}