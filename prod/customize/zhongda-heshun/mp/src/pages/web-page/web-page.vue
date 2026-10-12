<template>
	<view>
		<view class="error-page" v-if="state.loading || state.showError">
			<image class='error-img' src="../../static/images/empty.png"></image>
			<view class="error-text" v-if="state.showError">加载失败</view>
			<view class="error-text" v-else>加载中..</view>
		</view>
		<web-view ref="webviewRef" :src="state.webUrl" class="webview" :webview-styles="webviewStyles" @message="onMessage" @error="handleError" @load="handleLoad"></web-view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { getSecretByToken } from '@/api';
import { h5BaseUrl, terminal } from '@/config';
import { storeUser } from '@/store/user'
import { useShare } from '@/hook/use-share';

const userStore = storeUser()

const pageList = [
	// { type: 'group', title:'分组管理', path: `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/group`},
	{ type: 'log', title:'日志管理', path: `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/log`},
]

interface OptionType { 
	type?: string,
	name?: string,
	id?: string,
	phone?: string,
	scanCodeResult?: string,
	params?: string,
}
const state = reactive({
	option: {} as OptionType,
	webUrl: '',
	secret: '',
	showError: false,
	loading: true,
	isDevicePage: false,
	isProcessingTabChange: false 
})

// 页面加载完成
const handleLoad = (e: unknown) => {
	uni.hideNavigationBarLoading()
	state.loading = false // 加载完成后设置loading为false
	setTimeout(() => {
		if (state.isDevicePage) {
			uni.setNavigationBarTitle({
				title: '我的设备'
			});
		} else {
			const routeTitle = getParamValue('routeTitle');
			const title = getParamValue('title');
			uni.setNavigationBarTitle({
				title: routeTitle || title || '我的设备'
			});
		}
	}, 1000);
}
const webviewStyles = reactive({
	progress: {
		color: '#1D66FF'
	}
})
const webviewRef = ref()
// 接收H5页面发送的消息
const onMessage = (e: {detail: { data: unknown; }; }) => {
	if (e.detail.data) {
		const message = e.detail.data;
		if (Array.isArray(message) && message.length > 0) {
			const action = message[0].action;
			switch (action) {
				case 'navigateTo':
					// 处理页面跳转
					if (message[0].url) {
						uni.navigateTo({
							url: message[0].url
						});
					}
					break;
				case 'setNavigationBarTitle':
					if (message[0].title) {
						setTimeout(() => {
							uni.setNavigationBarTitle({
								title: message[0].title || '我的设备',
								success: () => {
								},
								fail: (err) => {
								}
							});
						}, 300);
					}
					break;
				
			}
		}
	}
}

// 获取URL参数
const getParamValue = (paramName: string): string | null => {
  const regex = new RegExp(`[?&]${paramName}=([^&#]*)`, 'i');
  const result = regex.exec(state.webUrl);
  return result ? decodeURIComponent(result[1]) : null;
}

// 页面加载失败
const handleError = (e: unknown) => {
	uni.hideNavigationBarLoading()
	state.showError = true
}

// 获取短Token
const getShortSecret = async () => {
	const res = await getSecretByToken() as string
	if(res) state.secret = res
}

const initPage = async (Option: OptionType) => {
	uni.showNavigationBarLoading()
	state.option = Option
	setTimeout(() => {
		uni.hideNavigationBarLoading()
	}, 3000)
	try {
    // 检查登录状态
    if(!userStore.authInfo || !userStore.userInfo) {
      uni.navigateTo({ url: `/pages/login/login` })
      return
    }
    
    // 获取短Token
    await getShortSecret()
    
		const currentPage = pageList.find(item => item.type === state?.option?.type)
    // 构建H5页面URL
    let pageUrl = `${currentPage?.path}?terminal=${terminal}&cube-secret=${state.secret}`

    // 添加时间戳防止缓存
    state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
  } catch (error) {
    state.showError = true
  }
	
}

onLoad(async (Option) => {
	uni.$on("refreshBackPage", (pages) => {
		initPage(Option as OptionType)
	})
	initPage(Option as OptionType)
})
// const { handleShare } = useShare();
// onShareAppMessage( (): Promise<{ title: string; desc: string; path: string }> =>{
// 	return handleShare()
// })
</script>

<style lang="less" scoped>
.webview{
	width: 100%;
	height: 100vh; /* 使用视口高度 */
	position: absolute; /* 确保webview占满整个容器 */
	top: 0;
	left: 0;
	z-index: 1; /* 确保webview在错误页面之下，当错误页面显示时可以覆盖webview */
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
