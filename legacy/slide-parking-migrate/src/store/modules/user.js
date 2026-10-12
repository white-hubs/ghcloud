import { Login } from '@/api/ouaa'
import {
	getToken,
	setToken,
	removeToken,
	setNowEnterprise,
	removeNowEnterprise,
	getCurrentApplication,
	setCurrentApplication,
	setCurrentMenus,
	getCurrentMenus,
	getNowEnterprise
} from '@/utils/auth'

const state = {
	token: getToken(),
	introduction: '',
	name: '',
	avatar: '',
	roles: [],
	nowEnterprise: JSON.stringify(getNowEnterprise()) || null,
	currentApplication: getCurrentApplication() || null,
	currentMenus:  getCurrentMenus() || null,
	tabsPane: [],
	applications: [],
}

const mutations = {
	SET_TOKEN: (state, token) => {
		state.token = token
	},
	SET_INTRODUCTION: (state, introduction) => {
		state.introduction = introduction
	},
	SET_NAME: (state, name) => {
		state.name = name
	},
	SET_AVATAR: (state, avatar) => {
		state.avatar = avatar
	},
	SET_ROLES: (state, roles) => {
		state.roles = roles
	},
	SET_NOW_ENTERPRISE: (state, value) => {
		state.nowEnterprise = value
		setNowEnterprise(value)
	},
	SET_APPLICATION: (state, value) => {
        state.currentApplication = value;
		setCurrentApplication(value)
      },
      SET_MENU: (state, value) => {
        state.currentMenus = value;
		setCurrentMenus(value)
      },
      SET_TABS_PANE: (state, value) => {
        state.tabsPane = value;
      },
      SET_APPLICATIONS: (state, value) => {
        state.applications = value;
      },
}

const actions = {
	// 用户登录
	login({ commit }, userInfo) {
		return new Promise((resolve, reject) => {
			Login(userInfo)
				.then((response) => {
					setToken(response)
					commit('SET_TOKEN', response)
					resolve()
				})
				.catch((error) => {
					reject(error)
				})
		})
	},

	// 获取用户信息
	getInfo({ commit, state }) {
		return new Promise((resolve, reject) => {
			getInfo(state.token)
				.then((response) => {
					const { data } = response

					if (!data) {
						reject('验证失败，请重新登录')
					}

					const { roles, name, avatar, introduction } = data

					// roles必须存在
					if (!roles || roles.length <= 0) {
						reject('getInfo: roles不能为空!')
					}

					commit('SET_ROLES', roles)
					commit('SET_NAME', name)
					commit('SET_AVATAR', avatar)
					commit('SET_INTRODUCTION', introduction)
					resolve(data)
				})
				.catch((error) => {
					reject(error)
				})
		})
	},

	// 用户退出
	logout({ commit, state, dispatch }) {
		return new Promise((resolve, reject) => {
			commit('SET_TOKEN', '')
			commit('SET_ROLES', [])
			removeToken()
			removeNowEnterprise()
			resetRouter()
			setTimeout(() => {
				resolve()
			}, 1000)
		})
	},

	// 移除token
	resetToken({ commit }) {
		return new Promise((resolve) => {
			commit('SET_TOKEN', '')
			commit('SET_ROLES', [])
			removeToken()
			resolve()
		})
	},
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
