import { request } from '../service'
export const getUsingLayer = () => {
	return request('/layer/state', 'GET')
}
export const getRegionList = () => {
	return request('/guide/area/page', 'GET', { pageNumber: 1, pageSize: 1000 })
}
export const getRegionInfo = (id : string) => {
	return request(`/guide/area/${id}`, 'GET')
}
export const getPointList = (keyword : string) => {
	return request('/point/anage/page', 'GET', { pageNumber: 1, pageSize: 1000, keyword })
}