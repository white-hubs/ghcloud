import request from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request'

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

export const getDept = (params, method = 'get') =>
  request({
    url: '/api/ouaa/authenticated/organizations/list',
    method: method,
    params
  })
