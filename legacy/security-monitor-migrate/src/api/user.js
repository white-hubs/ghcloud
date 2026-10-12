import request from '@/utils/request'

export function login(data) {
	return request({
		url: '/gh-admin/user/login',
		method: 'post',
		data
	})
}

export function getInfo(token) {
	return request({
		url: '/gh-admin/user/info',
		method: 'get',
		params: { token }
	})
}

export function logout() {
	return request({
		url: '/gh-admin/user/logout',
		method: 'post'
	})
}
