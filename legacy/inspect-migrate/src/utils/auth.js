// ---- 设置token ----
const TokenKey = 'GH-Token'

export function getToken() {
	return JSON.parse(sessionStorage.getItem(TokenKey))
}

export function setToken(data) {
	return sessionStorage.setItem(TokenKey, JSON.stringify(data))
}

export function removeToken() {
	return sessionStorage.removeItem(TokenKey)
}

// ---- 设置UserInfo ----
const UserInfoKey = 'GH-UserInfo'

export function getUserInfo() {
	return JSON.parse(sessionStorage.getItem(UserInfoKey))
}

export function setUserInfo(data) {
	return sessionStorage.setItem(UserInfoKey, JSON.stringify(data))
}

export function removeUserInfo() {
	return sessionStorage.removeItem(UserInfoKey)
}

// ---- 设置NowEnterprise ----
const NowEnterpriseKey = 'GH-NowEnterprise'

export function getNowEnterprise() {
	return JSON.parse(sessionStorage.getItem(NowEnterpriseKey))
}

export function setNowEnterprise(data) {
	return sessionStorage.setItem(NowEnterpriseKey, data)
}

export function removeNowEnterprise() {
	return sessionStorage.removeItem(NowEnterpriseKey)
}

// ---- 设置currentApplication ----
const CurrentApplicationKey = 'GH-currentApplication'

export function getCurrentApplication() {
	return JSON.parse(sessionStorage.getItem(CurrentApplicationKey))
}

export function setCurrentApplication(data) {
	return sessionStorage.setItem(CurrentApplicationKey, JSON.stringify(data))
}

export function removeCurrentApplication() {
	return sessionStorage.removeItem(CurrentApplicationKey)
}

// ---- 设置currentMenus ----
const CurrentMenusKey = 'GH-currentMenus'

export function getCurrentMenus() {
	return JSON.parse(sessionStorage.getItem(CurrentMenusKey))
}

export function setCurrentMenus(data) {
	return sessionStorage.setItem(CurrentMenusKey, JSON.stringify(data))
}

export function removeCurrentMenus() {
	return sessionStorage.removeItem(CurrentMenusKey)
}
