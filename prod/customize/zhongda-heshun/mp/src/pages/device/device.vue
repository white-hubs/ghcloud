<template>
  <view class="container">
    <view class="view-page" v-if="!isLogin">
      <view class="title">
        <text>智慧生活此刻开始</text>
      </view>
      <image class="empty-img" src="../../static/images/nodata.png"></image>
      <view class="empty-text">暂无设备</view>
      <button class="login-button" @click="goToLogin">添加设备</button>
    </view>
    <view v-else>
      <view class="error-page" v-if="state.loading || state.showError">
        <image class='error-img' src="../../static/images/empty.png"></image>
        <view class="error-text" v-if="state.showError">加载失败</view>
        <view class="error-text" v-else>加载中..</view>
      </view>
      <web-view v-if="isLogin" ref="webviewRef" :src="state.webUrl" class="webview" :webview-styles="webviewStyles" @message="onMessage" @error="handleError" @load="handleLoad"></web-view>
      <!-- 仅 cover-view 可叠在 web-view 之上 -->
      <!-- <cover-view v-if="isLogin" class="loc-test-wrap">
        <cover-view class="loc-test-btn" @tap="testGetLocation">测试定位</cover-view>
      </cover-view> -->
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

/** 登录会话内只注入一次，供 H5 sessionStorage 缓存经纬度（绑定设备用） */
const locationInjectedOnce = ref(false)

/** 手动测试 uni.getLocation（与绑定设备时一致，gcj02） */
const testGetLocation = (): void => {
  uni.getLocation({
    type: 'gcj02',
    isHighAccuracy: true,
    success: (res) => {
      uni.showModal({
        title: '定位成功',
        content: `纬度: ${res.latitude}\n经度: ${res.longitude}\n精度(m): ${res.accuracy ?? '--'}`,
        showCancel: false,
      })
    },
    fail: (err) => {
      const msg =
        err && typeof err === 'object' && 'errMsg' in err
          ? String((err as { errMsg?: string }).errMsg)
          : '获取位置失败，请检查系统与小程序定位权限'
      uni.showModal({
        title: '定位失败',
        content: msg,
        showCancel: false,
      })
    },
  })
}

const injectStartupLocationForBind = (): void => {
  if (locationInjectedOnce.value) {
    return
  }
  if (!state.webUrl || state.webUrl.includes('mpLocationResult=')) {
    return
  }
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      if (locationInjectedOnce.value) {
        return
      }
      locationInjectedOnce.value = true
      const locationResult = {
        action: 'locationResult',
        success: true,
        latitude: res.latitude,
        longitude: res.longitude,
        accuracy: res.accuracy,
      }
      const pageUrl = `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/device?terminal=${terminal}&cube-secret=${state.secret}&mpLocationResult=${encodeURIComponent(JSON.stringify(locationResult))}`
      state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
    },
    fail: () => {
      // 未授权等：不标记成功，下次进入可重试
    },
  })
}

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
                title: message[0].title || '我的设备',
                success: () => {
                },
                fail: (err) => {
                }
              });
            }, 300);
          }
          break;
        case 'showNavigationBarLoading':
          // 显示导航栏加载动画
          uni.showNavigationBarLoading();
          break;
        case 'hideNavigationBarLoading':
          // 隐藏导航栏加载动画
          uni.hideNavigationBarLoading();
          break;
        case 'setNavigationBarColor':
          // 设置导航栏颜色
          if (message[0].backgroundColor) {
            uni.setNavigationBarColor({
              frontColor: message[0].frontColor || '#ffffff',
              backgroundColor: message[0].backgroundColor,
              animation: {
                duration: 400,
                timingFunc: 'easeIn'
              }
            });
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
    locationInjectedOnce.value = false
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
    let pageUrl = `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/device?terminal=${terminal}&cube-secret=${state.secret}`
    
    // 添加时间戳防止缓存
    state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
    injectStartupLocationForBind()
  } catch (error) {
    state.showError = true
  }
}

// 页面加载
onLoad(() => {
  initPage()
  
  // 监听扫码完成事件
  uni.$on("scanCodeComplete", (data) => {
    const app = getApp()
    // 优先使用事件中的结果，其次使用全局变量中的结果
    const scanCodeResult = data?.result || app.globalData?.scanCodeResult
    
    if (scanCodeResult) {
      // 先清空webUrl，强制刷新webview
      state.webUrl = ''
      
      // 重新构建H5页面URL，添加扫码结果参数
      let pageUrl = `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/device?terminal=${terminal}&cube-secret=${state.secret}&scanCodeResult=${encodeURIComponent(JSON.stringify(scanCodeResult))}`
      
      // 添加时间戳防止缓存
      state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
      
      // 清空全局变量，避免重复处理
      if (app.globalData?.scanCodeResult) {
        app.globalData.scanCodeResult = null
      }
    }
  })

  // H5 通过桥页获取定位后，将结果写回 web-view URL，供 H5 读取 mpLocationResult
  uni.$on('locationComplete', (data) => {
    const app = getApp()
    const locationResult = data?.result ?? app.globalData?.locationResult
    if (!locationResult) {
      return
    }
    state.webUrl = ''
    const pageUrl = `${h5BaseUrl}/apps/@ghcloud/cube-zhongda-heshun-h5/#/device?terminal=${terminal}&cube-secret=${state.secret}&mpLocationResult=${encodeURIComponent(JSON.stringify(locationResult))}`
    state.webUrl = `${pageUrl}&timestamp=${new Date().getTime()}#wechat_redirect`
    if (app.globalData?.locationResult) {
      app.globalData.locationResult = null
    }
  })
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
      // if (res.confirm) {
      //   uni.navigateTo({ url: `/pages/login/login` })
      // }
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

.loc-test-wrap {
  position: fixed;
  right: 24rpx;
  bottom: 200rpx;
  z-index: 99999;
}

.loc-test-btn {
  padding: 16rpx 24rpx;
  background: rgba(21, 120, 255, 0.92);
  color: #ffffff;
  font-size: 24rpx;
  border-radius: 8rpx;
  text-align: center;
}
</style>