
import { baseURL, terminal, tenant } from '@/config'
import { storeUser } from '@/store/user'
const userStore = storeUser()

const buildRequestUrl = (url: string): string => {
	if (url.startsWith('/gw-bff')) {
		return baseURL.replace(/\/api\/?$/, '') + url
	}
	return baseURL + url
}

// 封装公共请求方法
export function request(payload: {
	url : string, 
	method : "GET" | "POST"| "PUT" | "DELETE" | undefined, 
	data ?: object | any, 
	header?: object | any,
	isLoading?: boolean
}) {
	if(payload.isLoading) uni.showLoading({title: '加载中'})
	let authHeaders = {}
	const auth = userStore.authInfo
	if(auth && auth.access_token && auth.tenants){
		authHeaders = {
			Authorization: 'Bearer ' + auth?.access_token,
			// Tenant: auth?.tenants.length > 0 ? auth?.tenants[0] : tenant ?? '',
			Tenant: tenant ?? '',
		}
	}else{
		authHeaders = {
			Tenant: tenant
		}
	}
	if(payload.url.includes('/public')){
		authHeaders = {
			Tenant: tenant
		}
	}
	return new Promise(function (resolve, reject) {
		uni.request({
			url: buildRequestUrl(payload.url),
			method: payload.method,
			data: payload.data,
			header: {
				'content-type': 'application/json',
				'terminal': terminal,
				...authHeaders,
				...payload.header
			},
			success:(res : any)=> {
				if(payload.isLoading) uni.hideLoading()
				const code = res.data.code;
				if (res.statusCode === 200) {
					if(res.data?.code){
						if (code === 200) {
							resolve(res.data)
						} else {
							uni.showToast({
								title: res.data.message,
								duration: 2000,
								icon: 'none'
							})
							resolve(false);
						}
					}else{
						resolve(res.data);
					}
				} else {
					uni.showToast({
						title: res.data.message || res.data.error_description || '请求错误',
						duration: 2000,
						icon: 'none'
					})
					resolve(false);
				}
			},
			fail:(err)=> {
				if(payload.isLoading) uni.hideLoading()
				uni.showToast({
					title: '无法连接到服务器',
					icon: 'none'
				})
				reject(err)
			},
		})

	})

}
