import { request } from '../service'
export const getUsingLayer = (params : {
	areaId : string
}) => {
	return request('/layer/state', 'GET', { ...params })
}
export const getRegionTreeList = () => {
	return request('/guide/area/tree', 'GET', {
		state: 'ENABLE'
	})
}
export const getRegionInfo = (id : string) => {
	return request(`/guide/area/${id}`, 'GET')
}
export const getPointType = () => {
	return request(`/point-types`, 'GET')
}
export const getPointList = (params : {
	keyword : string,
	areaId : string,
	typeId : string
}) => {
	return request('/point/anage/page', 'GET', { pageNumber: 1, pageSize: 1000, ...params,areaAccurateMatching:true, sequence:true })
}