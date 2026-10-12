<template>
	<view>
		<view class="error-page">
			<image class='error-img' src="../../static/empty.png"></image>
			<view class="error-text">加载中..</view>
		</view>
		<web-view :src="state.webUrl" class="webview" :webview-styles="webviewStyles" @message="onMessage" @error="handleError" @load="handleLoad"></web-view>
	</view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app';
import { getSecretByToken } from '@/api';
import { h5BaseUrl, terminal } from '@/config';
import { storeUser } from '@/store/user'

const userStore = storeUser()

const pageList = [
	{ name: 'meet-room', title:'空间预约', path: `${h5BaseUrl}/apps/@ghcloud/cube-meet-room-h5/#/conferenceRoomList`}, // 会议室
	{ name: 'visitor', title:'进馆预约', path: `${h5BaseUrl}/apps/@ghcloud/cube-visitor-management-h5/#/booking-list`}, // 访客
	{ name: 'visitor-detail', title:'进馆预约', path: `${h5BaseUrl}/apps/@ghcloud/cube-visitor-management-h5/#/result`},
	{ name: 'invite', title:'访客预约', path: `${h5BaseUrl}/apps/@ghcloud/cube-visitor-management-h5/#/invite-record`}, // 访客邀约
	{ name: 'invite-detail', title:'访客预约', path: `${h5BaseUrl}/apps/@ghcloud/cube-visitor-management-h5/#/invite-result`},
	{ name: 'visitor-mine', title:'我的预约', path: `${h5BaseUrl}/apps/@ghcloud/cube-visitor-management-h5/#/my-booking`},
	{ name: 'notice', title:'通知公告', path: `${h5BaseUrl}/apps/@ghcloud/cube-notice-announcement-h5/#/notification-public-list`}, // 公告
	{ name: 'notice-detail', title:'通知公告', path: `${h5BaseUrl}/apps/@ghcloud/cube-notice-announcement-h5/#/public-notification-details`},
	{ name: 'news', title:'书屋资讯', path: `${h5BaseUrl}/apps/@ghcloud/cube-notice-announcement-h5/#/news-public-list`}, // 资讯
	{ name: 'news-detail', title:'书屋资讯', path: `${h5BaseUrl}/apps/@ghcloud/cube-notice-announcement-h5/#/news-detail`},
	{ name: 'streamengineH5', title:'访客邀约', path: `${h5BaseUrl}/streamengineH5/tab-form`},
]

const state = reactive({
	type: '',
	id: '',
	processId: '',
	phone: '',
	webUrl: '',
	secret: '',
	showError: false
})
const webviewStyles = reactive({
	progress: {
		color: '#1D66FF'
	}
})
const onMessage = (e: {detail: { data: unknown; }; }) => {
	if (e.detail.data) {
	}
}
const getParamValue = (paramName: string): string | null => {
  const regex = new RegExp(`[?&]${paramName}=([^&#]*)`, 'i');
  const result = regex.exec(state.webUrl);
  return result ? decodeURIComponent(result[1]) : null;
}

const handleLoad = (e: unknown) => {
	uni.hideNavigationBarLoading()
	setTimeout(() => {
		const title = getParamValue('title');
		uni.setNavigationBarTitle({
			title: title || '访客预约'
		});
	}, 1000)

}
const handleError = (e: unknown) => {
	uni.hideNavigationBarLoading()
	state.showError = true
}
const getShortSecret = async () => {
	const res = await getSecretByToken() as {data: string}
	if(res) state.secret = res?.data
}
const toPublicPage = () => {
	const currentPage = pageList.find(item => item.name === state.type)
	const baseUrl = currentPage?.path
	const title = currentPage?.title
	let pageUrl = `${baseUrl}?terminal=${terminal}&title=${title}`
	if(state.id) pageUrl += `&id=${state.id}`
	state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
}
const toAuthPage = async () => {
	try {
		if(!userStore.authInfo) {
			uni.navigateTo({ url: `../login/login` })
			return
		}
		await getShortSecret()
		const currentPage = pageList.find(item => item.name === state.type)
		const baseUrl = currentPage?.path
		const title = currentPage?.title
		const auth = userStore.authInfo
		if(!auth?.access_token || !auth?.tenants?.length){
			uni.setStorageSync('webUrl', state.webUrl)
			uni.showToast({title: '请先登录', icon: 'none'})
			uni.navigateTo({ url: '../login/login' })
			return
		}
		// 拼接参数
		let pageUrl = `${baseUrl}?cube-secret=${state.secret}&tenant=${auth.tenants[0]}&terminal=${terminal}&title=${title}`
		if(state.id) pageUrl += `&id=${state.id}`
		if(state.processId) pageUrl += `&processId=${state.processId}`
		if(state.phone) pageUrl += `&phone=${state.phone}`
		if(state.type === 'streamengineH5') pageUrl += `&processType=HANDLING`
		state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
	} catch (error) {
	}
}
const init = (Option: AnyObject | undefined) => {
	uni.showNavigationBarLoading()
	// 获取参数
	state.type = Option?.type ?? ''
	state.id = Option?.id ?? ''
	state.phone = Option?.phone ?? ''
	state.processId = Option?.processId ?? ''
	if(state.type.includes('news') || state.type.includes('notice')){
		toPublicPage()
	}else{
		toAuthPage()
	}
}
onLoad(async (Option) => {
	// 适配从访客邀请链接进入访客邀请页面
	uni.$on("refreshBackPage", (pages) => {
		init(Option)
	})
	init(Option)
})

</script>

<style lang="less" scoped>
.webview{
	width: 100%;
	height: 100%;
}
.error-page{
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 80px;
	color: #666;
	.error-img{
		display: inline-block;
    margin-bottom: 10px;
    width: 102px;
    height: 102px;
	}
	.error-text{
		font-size: 15px;
	}
}
</style>
