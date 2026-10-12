<template>
  <view class="container">
    <image class="img-bg" src="../../static/blue-bg.png" alt="" />
    <view class="header" @tap="toInfo">
      <view class="avatar-icon">
        <image class="img" v-if="state.userInfo.fileVO?.path" :src="getImagePath(state.userInfo.fileVO?.path ?? '')" alt="" />
        <image class="img" v-else src="../../static/user.png" alt="" />
      </view>
      <view class="right">
        <view class="item">
          <view v-if="isLogin" class="name">
            <view>{{ state.userInfo?.name }}</view>
            <view class="tel">{{ state.userInfo?.mobile }}</view>
          </view>
          <view v-else>立即登录</view>
        </view>
        <text class="iconfont">&#xe860;</text>
      </view>
    </view>
    <view class="content">
      <view class="profile-msg" @tap="toInfo">
        <view class="item">
          <view class="avatar avatar-icon">
            <text class="iconfont">&#xe524;</text>
          </view>
          个人信息
        </view>
        <view class="right">
          <text class="iconfont">&#xe860;</text>
        </view>
      </view>
      <view class="login">
        <button class="btn" v-if="isLogin" @tap="logout">退出登录</button>
        <button class="btn" v-else @tap="toInfo">立即登录</button>
      </view>
      <view class="desc">
        <view>版本: {{ state.version }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { storeUser } from '@/store/user'
import { version } from '../../../package.json'
import { getUserInfo } from '@/api';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import type { UserInfo } from '@/types';
import { h5BaseUrl } from '@/config';

  const userStore = storeUser()
  const state = reactive<{
    version: String,
    userInfo: UserInfo,
  }>({
    version: '',
    userInfo: {
      id: '',
      mobile: '',
      name: '',
      fileVO: {
        path: '../../static/user.png',
      }
    },
  })
  const isLogin = computed(() => {
    if (userStore.authInfo) {
      return true
    }
    return false
  })
  onShow(async () => {
    state.version = version
    isLogin.value && await getUser()
    uni.$on('refreshPerson', () => {
      getUser()
    })
  })
  const getImagePath = (path: string) => {
    if (path === '../../static/user.png') return path
    const url = path?.includes('https') ? path : h5BaseUrl + path
    return url
  }
  const getUser = async () => {
    try {
      const user = await getUserInfo()
      if(user){
        const res = (user as {data: UserInfo})?.data || {}
        state.userInfo = res
        userStore.userInfo = res
      }
    } catch (error) {
    }
  }
  onPullDownRefresh( async () => {
    isLogin.value && await getUser()
    uni.stopPullDownRefresh()
  })
  const toInfo = () =>{
    if(isLogin.value){
      uni.navigateTo({
        url: `../person/person`
      })
    }else{
      uni.navigateTo({
        url: `../login/login`
      })
    }
  }
  const logout = () =>{
    uni.showModal({
      cancelText: "取消",
      confirmText: "确定",
      title: "提示",
      content: "是否退出登录？",
      success: async (res) => {
        if (res.confirm) {
          userStore.clearAuthInfo()
          userStore.clearUserInfo()
          uni.reLaunch({
            url:'../login/login'
          })
        }
      },
    })
  }
</script>

<style lang="less" scoped>
page {
  height: 100vh;
  background-size: 100%;
  background-color: #F7F7F7;
}
.page_title{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  line-height: 30px;
  color: #000000;
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
  position: relative;
  height: 100vh
}
.header {
  position: absolute;
  top: 116px;
  width: calc(100vw - 60px);
  padding: 0px 30px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  .btn {
    background: transparent;
    padding: 0;
    margin: 0;
    display: inline-block;
    &::after{
      background: transparent;
      display:none;
    }
  }
  .avatar-icon{
    width: 62px;
    height: 62px;
    background: #1578ff;
    background: #a2b6d245;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    overflow: hidden;
    margin-right: 14px;
    .img{
      width: 100%;
      height: 100%;
    }
    .iconfont{
      font-size: 40px;
    }
  }
  .right{
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex:1;
    .iconfont{
      font-size: 16px;
    }
  }
  .item {
    font-size: 17px;
    line-height: 22px;
  }
  .name{
    font-size: 17px;
    color: #1f3140;
  }
}

.content {
  background-color: #ffffff;
  border-radius: 20px 20px 0px 0px;
  height: calc(100vh - 228px);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  padding-top: 30px;
  .profile-msg {
    margin: 0 16px 2px 16px;
    height: 58px;
    background: #fafafa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 0px 18px;
    &:nth-child(1){
      border-radius: 8px;
    }
    .avatar{
      width: 28px;
      height: 28px;
      background: #1578ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
      margin-right: 12px;
    }
    .item {
      font-size: 16px;
      text-align: left;
      color: #1f3140;
      line-height: 16px;
      flex: 1;
      display: flex;
      align-items: center;
    }
    .right{
      flex:1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      justify-content: flex-end;
      height: 58px;
      line-height: 58px;
      .iconfont{
        font-size: 15px;
      }
    }
  }

  .login {
    width: 94vw;
    margin: 200px auto 0;
    text-align: center;
    .btn {
      height: 46px;
      line-height: 46px;
      background: #1578FF;
      border-radius: 8px;
      color: #fff;
      margin-bottom: 40px;
      font-size: 16px;
    }
  }
  .desc{
    text-align: center;
    font-size: 26rpx;
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
  }
}
.tel{
  color: #333;
  font-size: 15px;
  display: inline-block;
  margin-top: 5px;
}
</style>