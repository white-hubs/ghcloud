import request from '@/utils/request'

export function getRoutes() {
	return request({
		url: '/gh-admin/routes',
		method: 'get'
	})
}

export function getRoles() {
	return request({
		url: '/gh-admin/roles',
		method: 'get'
	})
}

export function addRole(data) {
	return request({
		url: '/gh-admin/role',
		method: 'post',
		data
	})
}

export function updateRole(id, data) {
	return request({
		url: `/gh-admin/role/${id}`,
		method: 'put',
		data
	})
}

export function deleteRole(id) {
	return request({
		url: `/gh-admin/role/${id}`,
		method: 'delete'
	})
}
