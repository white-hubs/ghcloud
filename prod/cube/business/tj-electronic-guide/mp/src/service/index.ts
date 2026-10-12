export const baseService='https://sn-tj.guheyun.cn:40201'
//服务器接口地址
const baseURL : string = baseService + '/api/tj-electronic-guide/public/tj'

// 封装公共请求方法
export function request(url : string, method : "GET" | "POST" | undefined, data ?: object | any) {
	uni.showLoading()
	return new Promise(function (resolve, reject) {
		uni.request({
			url: baseURL + url,
			method: method, 
			data: data,
			header: {
				'content-type': 'application/json',
			},
			success:(res : any)=> {
				uni.hideLoading()
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					//其他异常
					uni.showToast({
						title: res.data.message,
						icon: 'none'
					})
					reject(res.data);
				}
			},
			fail:(err)=> {
				uni.hideLoading()
				//请求失败
				uni.showToast({
					title: '无法连接到服务器',
					icon: 'none'
				})
				reject(err)
			},
		})

	})

}