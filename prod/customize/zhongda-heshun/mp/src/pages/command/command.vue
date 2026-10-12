<template>
  <view class="container">
    <view class="view-page" v-if="!isLogin">
      <view class="title">
        <text>智慧生活此刻开始</text>
      </view>
      <image class="empty-img" src="../../static/images/nodata.png"></image>
      <view class="empty-text">暂无任务</view>
      <button class="login-button" @click="goToLogin">添加任务</button>
    </view>
    <view v-else>
      <view class="error-page" v-if="state.loading || state.showError">
        <image class='error-img' src="../../static/images/empty.png"></image>
        <view class="error-text" v-if="state.showError">加载失败</view>
        <view class="error-text" v-else>加载中..</view>
      </view>
      <web-view v-if="isLogin" ref="webviewRef" :src="state.webUrl" class="webview" :webview-styles="webviewStyles" @message="onMessage" @error="handleError" @load="handleLoad"></web-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onShareAppMessage, onShow } from '@dcloudio/uni-app';
import { getSecretByToken } from '@/api';
import { h5BaseUrl, terminal } from '@/config';
import { storeUser } from '@/store/user'
import { useShare } from '@/hook/use-share';

const userStore = storeUser()
const isLogin = ref(false)

const webviewStyles = reactive({
  progress: {
    color: '#1D66FF'
  }
})

const state = reactive({
  webUrl: '',
  secret: '',
  showError: false,
  loading: true
})

const webviewRef = ref()

// 页面加载完成
const handleLoad = (e: unknown) => {
  uni.hideNavigationBarLoading()
  state.loading = false
}

// 页面加载失败
const handleError = (e: unknown) => {
  uni.hideNavigationBarLoading()
  state.showError = true
}

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
        case 'navigateToH5':
          // 跳转到新的H5页面
          if (message[0].url) {
            navigateToH5Page(message[0].url);
          }
          break;
        case 'setNavigationBarTitle':
          if (message[0].title) {
            setTimeout(() => {
              uni.setNavigationBarTitle({
                title: message[0].title || '任务',
                success: () => {
                },
                fail: (err) => {
                }
              });
            }, 300);
          }
          break;
        case 'updateGroupActive':
          // 接收H5传递的groupActive参数
          if (message[0].groupActive) {
            // 从H5传递的groupChecked中提取分组信息
            const groupId = message[0].groupActive?.id || '';
            const groupName = message[0].groupActive?.groupName || '';
            
            // 保存分组信息到用户存储中
            userStore.memberGroup = {
              id: groupId,
              groupName: groupName,
            }
            
            // 将更新后的分组信息保存到本地存储，确保在分享时能够获取到
            uni.setStorageSync('memberGroup', {
              id: groupId,
              groupName: groupName,
            });
            
          }
          break;
      }
    }
  }
}

// 跳转到新的H5页面
const navigateToH5Page = (url: string) => {
  const currentParams = state.webUrl.split('?')[1]?.split('#')[0] || '';
  const baseParams = currentParams ? `?${currentParams}` : '';
  state.webUrl = `${url}${baseParams}&timestamp=${new Date().getTime()}#wechat_redirect`;
}

// 获取短Token
const getShortSecret = async () => {
  const res = await getSecretByToken() as string
  if(res) state.secret = res
}

// 初始化页面
const initPage = async () => {
  // 检查登录状态
  if(!userStore.authInfo || !userStore.userInfo) {
    isLogin.value = false
    return
  }
  isLogin.value = true
  
  uni.showNavigationBarLoading()
  state.loading = true
  state.showError = false
  
  try {
    // 获取短Token
    await getShortSecret()
    
    // 构建H5页面URL
    let pageUrl = `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/task?terminal=${terminal}&cube-secret=${state.secret}`
    
    // 添加时间戳防止缓存
    state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
  } catch (error) {
    state.showError = true
  }
}

// 页面加载
onLoad(() => {
  initPage()
})

// 页面显示
onShow(() => {
  // 每次显示页面时检查登录状态
  initPage()
})

const goToLogin = () => {
  uni.showModal({
    title: '温馨提示',
    content: `您尚未登录，请先登录`,
    success: async (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: `/pages/login/login` })
      }
    }
  })
}

// 分享功能
// const { handleShare } = useShare();
// onShareAppMessage( (): Promise<{ title: string; desc: string; path: string }> => {
//   return handleShare()
// })
</script>

<style lang="scss">
page {
  height: 100vh;
  width: 100vw;
}
.webview {
  width: 100%;
  height: 100%;
}
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  color: #666;
  .error-img {
    display: inline-block;
    margin-bottom: 10px;
    width: 102px;
    height: 102px;
  }
  .error-text {
    font-size: 15px;
  }
}
.title{
  font-size: 18px;
  font-family: Source Han Sans CN, Source Han Sans CN-Regular;
  font-weight: Regular;
  color: #667380;
  line-height: 18px;
  letter-spacing: 2px;
  margin-top: 10px;
  margin-bottom: 30px;
}
.container {
  width: 100vw;
  height: 100vh;
}
.view-page { 
  padding-top: 20vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  .empty-img {
    width: 180px;
    height: 180px;
  }
  .empty-text {
    margin-top: 20px;
    font-size: 16px;
    color: #999;
  }
  .login-button {
    margin-top: 30px;
    width: 200px;
    text-align: center;
    height: 46px;
    line-height: 46px;
    background: #1578FF;
    border-radius: 8px;
    color: #fff;
    margin-bottom: 40px;
    font-size: 16px;
  }
}
</style>