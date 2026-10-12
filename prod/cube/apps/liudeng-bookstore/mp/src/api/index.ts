import type { InformationType } from '@/types'
import { request } from '../service'

const baseUrl = '/ouaa'
const baseUrl2 = '/management'
const baseUrl3 = '/visitor-management'

/** 获取session */
export const jscode2session = (code: string) => {
	return request({
		url: `${baseUrl}/oauth2/wechat/jscode2session?code=${code}`,
		method: 'GET',
		isLoading: true
	})
}

/** 登录 */
export const login = (data : {
	token: string,
	mobile: string|number,
	iv: string,
	grant_type?: string,
	scope?: string,
}) => {
	return request({
		url: '/gw-bff/auth/token',
		method: 'POST',
		data,
		header: {'content-type': 'application/x-www-form-urlencoded'},
		isLoading: true
	})
}
export const refreshToken = (data : {
	token: string,
	mobile: string|number,
	iv: string,
	grant_type?: string,
	scope?: string,
}) => {
	return request({
		url: '/gw-bff/auth/token',
		method: 'POST',
		data,
		header: {'content-type': 'application/x-www-form-urlencoded'}
	})
}

/** 获取token */
export const getSecretByToken = () => {
	return request({
		url: `${baseUrl}/oauth2/getSecretByToken`,
		method: 'GET',
	})
}
/** 获取置顶资讯 */
export const getNoticeList = (data : {
	id?: number | null;
	informationType?: 'ANNOUNCEMENT' | 'NEW_INFORMATION';
	num?: number | null;
	pageNumber: number | null;
	pageSize: number | null;
	parentIds?: number[] | null;
	status?: 'DISPLAY' | 'HIDE';
	tagType?: null | string;
	title?: null | string;
}) => {
	return request({
		url: `${baseUrl2}/public/information/list`,
		method: 'GET',
		data
	})
}
/** 我的进馆预约 */
export const getReservationRecord = (data : {
	pageSize: number;
	pageNumber: number;
	period?: string;
	name?: string;
	phone?: string;
	statusList?: string;
}) => {
	return request({
		url: `${baseUrl3}/visitor/reservation/reservationRecordPage`,
		method: 'GET',
		data,
		isLoading: false
	})
}
/** 我的邀约记录 */
export const getVisitorInviteRecord = (data : {
	pageSize: number;
	pageNumber: number;
	phone?: string;
	period?: string;
}) => {
	return request({
		url: `${baseUrl3}/visitor/invite/record/page`,
		method: 'GET',
		data,
		isLoading: false
	})
}
  /** ID查询文件 */
export const getFileInfo = (id: string) => {
	return request({
		url: `/file/file/${id}`,
		method: 'GET',
	})
}
export const uploadFile = (id: string) => {
	return request({
		url: `${baseUrl}/file/file/${id}`,
		method: 'GET',
	})
}
/** 更新用户信息 */
export const updateUserInfo= (userId: string, data: {
	appointmentIds?: (number|string)[] | null;
	enabled?: boolean | null;
	entryDate?: null | string;
	gender?: null | string;
	managedOrganizationIds?: (number|string)[] | null;
	mobile?: null | string;
	name?: null | string;
	oldName?: null | string;
	oldPhotographIdList?: (number|string)[] | null;
	organizationIds?: (number|string)[]| null;
	password?: null | string;
	photographIdList?: (number|string)[] | null;
	positionIds?: (number|string)[] | null;
	remark?: null | string;
	roleIds?: (number|string)[] | null;
	tenant?:  string | number | null;
	username?: null | string;
	fileId?: null | string | number;
}) => {
	return request({
		// url: `${baseUrl}/user-under-tenant/${userId}`,
		url: `${baseUrl}/authenticated/user`,
		method: 'PUT',
		data,
		isLoading: true
	})
}

/** 获取用户信息 */
export const getUserInfo = () => {
	return request({
		url: `${baseUrl}/user/mine`,
		method: 'GET',
		isLoading: false
	})
}