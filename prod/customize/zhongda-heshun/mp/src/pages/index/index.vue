<template>
  <view class="container">
    <image class="img-bg" src="../../static/images/blue-bg.png" alt="" />
    <view class="content">
      <view class="title">
        <!-- <text class="tit-1">欢迎回来</text> -->
        <text class="tit-2">智慧生活此刻开始</text>
      </view>
      <view class="bottom">
        <image class="img-device" src="../../static/images/index-device.png" alt="" />
        <view class="action-buttons">
          <!-- <button class="btn-add" @click="goToUse">添加设备</button> -->
          <button class="btn-use" @click="goToUse" type="share">去使用</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShareAppMessage, onShow, onTabItemTap } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import { storeUser } from '@/store/user'
import { useShare } from '@/hook/use-share';
const userStore = storeUser()
const { handleShare, clearCache } = useShare();

// 去使用
const goToUse = () => {
  if(isLogin.value) {
    uni.switchTab({
      url: '/pages/web-page/web-page'
    });
    uni.$emit('switchToDevicePage');
    return;
  } else {
    uni.navigateTo({
      url: '../login/login'
    })
  }
}

const isLogin = computed(() => {
  if (!userStore.userInfo) {
    clearCache()
    return false
  }
  const authInfoFromStorage = uni.getStorageSync('storeUser')?.authInfo;
  if (userStore.authInfo || authInfoFromStorage) {
    return true
  }
  return false
})

// 处理底部导航栏点击事件
onTabItemTap((e) => {
  if (e.index === 0 && isLogin.value) {
    uni.setNavigationBarTitle({
      title: '我的设备'
    })
    uni.switchTab({
      url: '/pages/web-page/web-page'
    });
    uni.$emit('switchToDevicePage')
  } else {
    uni.navigateTo({
      url: '../login/login'
    })
  }
})

const scrollTop = ref(0);
onLoad( () => {
  goToUse()
  // uni.getSystemInfo({
  //   success: function (res) {
  //     scrollTop.value = res.windowHeight - 384;
  //   }
  // })
})
onShow(() => {
  goToUse()
  uni.$emit('refreshList')
})
// onShareAppMessage( (): Promise<{ title: string; desc: string; path: string }> =>{
//   return handleShare()
// })
</script>

<style lang="less" scoped>
page {
  height: 100vh;
  overflow: hidden;
}
.img-bg{
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
.container {
  color: #666666;
  overflow: hidden;
  position: relative;
  height: 100vh;
}
.content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: space-between;
}
.img-device {
  width: 265px;
  height: 394px;
  margin-left: 25px;
}
.title{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 116px;
  .tit-1{
    font-size: 30px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: Medium;
    color: #0e161d;
    line-height: 30px;
  }
  .tit-2{
    margin-top: 25px;
    font-size: 18px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    color: #667380;
    line-height: 18px;
    letter-spacing: 2px;
  }
}
.bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn-add {
  width: 120px;
  height: 36px;
  border: 1px solid #1D66FF;
  border-radius: 8px;
  font-size: 14px;
  font-family: Source Han Sans CN, Source Han Sans CN-Regular;
  font-weight: Regular;
  text-align: center;
  color: #1D66FF;
  line-height: 34px;
  position: absolute;
  bottom: 200px;
  left: 50vw;
  margin-left: -50px;
  background-color: transparent;
}
.btn-use {
  margin-top: 60px;
  margin-bottom: 60px;
  background-color: #1D66FF;
  width: 311px;
  height: 46px;
  background: #1578ff, linear-gradient(180deg,#ffffff, rgba(255,255,255,0.00));
  border-radius: 10px;
  box-shadow: 0px 3px 8px 0px rgba(10,66,163,0.12); 

  font-size: 16px;
  font-family: Source Han Sans CN, Source Han Sans CN-Medium;
  font-weight: Medium;
  text-align: center;
  color: #ffffff;
  line-height: 46px;
}
</style>
