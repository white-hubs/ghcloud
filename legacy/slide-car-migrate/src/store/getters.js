const getters = {
	token: (state) => state.user.token,
	avatar: (state) => state.user.avatar,
	introduction: (state) => state.user.introduction,
	name: (state) => state.user.name,
	roles: (state) => state.user.roles,
	nowEnterprise: (state) => state.user.nowEnterprise,
	currentApplication: (state) => state.user.currentApplication,
	currentMenus: (state) => state.user.currentMenus,
	tabsPane: (state) => state.user.tabsPane,
	applications: (state) => state.user.applications,
}
export default getters
