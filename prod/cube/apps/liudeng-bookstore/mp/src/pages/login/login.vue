<template>
  <view class="content">
    <template v-if="isSuzhouPolice" >
      <view class="login_box_sz">
        <view class="box">
          <text class="title">欢迎登录</text>
          <image class="img" src="../../static/suzhou-police/login-bg.png"></image>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="login_box">
        <view class="headerPhotoBox">
          <image class="userHeaderPhoto" src="../../static/liudeng-bookstore/logo.jpg"></image>
        </view>
      </view>
    </template>
    <view class="login">
      <button class="btn" v-if="isAgree" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">手机号快捷登录</button>
      <view class="btn" v-else @click="disAgree">手机号快捷登录</view>
      <view class="btn-text" @click="handleBack">暂不登录</view>
    </view>
    <view class="privacy-footer footer-position">
      <label class="label" @click="isAgree = !isAgree"><radio class="privacy-radio" color="#1578FF" :checked="isAgree" />我已阅读并同意</label>
      <text class="privacy-link" @click="handleOpenPrivacyContract">《用户协议与隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad} from '@dcloudio/uni-app'
import { jscode2session, login, getUserInfo } from '@/api/index'
import { storeUser } from '@/store/user'
import type { AuthInfo, UserInfo } from '@/types';
import { templateUI } from '@/config';

  const isSuzhouPolice = templateUI === 'suzhou-police-applet-mp'
  const userStore = storeUser()
  const isAgree = ref(false)
  const state = reactive<{key: string}>({
    key: ''
  })

  onLoad(() => {
    // getWXCode()
    isAgree.value = !!uni.getStorageSync('agreeFlag')
  })

  const disAgree = () => {
    uni.showToast({ title: '请阅读并勾选底部协议',icon: 'none',duration: 3000})
  }
  const getWXCode = (): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      uni.login({
          provider: 'weixin',
          success: async (result) => {
              if(result.code){
                await jscode2session(result.code).then((res:any) => {
                  if(res?.key){
                      state.key = res?.key
                      return resolve(state.key)
                  }
                }).catch(err => {
                  return resolve(null)
                })
              }
         },
      })
    })
  }
  const getPhoneNumber = async (e: { detail: { iv: any; encryptedData: any; }; }) => {
    if (e.detail.iv) {
      getWXCode().then(async (res:unknown) => {
        const params = {
          token: state.key,
          mobile: e.detail.encryptedData,
          iv: e.detail.iv,
          grant_type: 'wechat',
          scope: 'select',
        }
        const data = await login(params)
        if(data){
          userStore.authInfo = data as AuthInfo ?? {}
          uni.$emit('refreshPerson')
          var pages = getCurrentPages();
          if (pages.length > 1) {
            uni.$emit('refreshBackPage', pages)
            uni.navigateBack()
          } else {
            uni.switchTab({ url: '/pages/index/index' })
          }
        }
      })
    }
  }
  const goAgreement = () =>{
    uni.navigateTo({url:'./agreement'})
  }
  const handleOpenPrivacyContract = () =>{
		uni.openPrivacyContract()
	}
  const handleBack = () => {
    uni.navigateBack()
  }
</script>

<style lang="less" scoped>
page {
  height: 100vh;
  background-color: #fff !important;
}
.content {
  color: #666666;
  width: 100vw;
  position: relative;
  .login_box {
  margin-top: 120px;
  margin-bottom: 60px;
  display: flex;
  justify-content: center;
  .headerPhotoBox {
      overflow: hidden;
      background: linear-gradient(180deg,#e4efff, #ecf4ff 32%, #ffffff);
      border-radius: 50%;
      width: 76px;
      height: 76px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      .userHeaderPhoto {
        width: 100%;
        height: 100%;
      }
  }
}
  .login {
    margin: 0 auto;
    width: calc(100vw - 52px);
    text-align: center;
    .btn {
      text-align: center;
      height: 46px;
      line-height: 46px;
      background: #1578FF;
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      width: 100%;
    }
  }
  .desc{
    margin: 0 auto;
    margin-top: 18px;
    width: calc(100vw - 52px);
    text-align: center;
    font-size: 13px;
    color: #999999;
  }
  .bottom-text{
    margin-top: 15px;
    text{
      color: #1578FF;
    }
  }
  .privacy-footer{
      font-size: 13px;
      color: #666666;
      line-height: 13px;
      margin-top: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      .label{
        display: flex;
        align-items: center;
      }
      .privacy-radio{
        transform: scale(0.7)
      }
      .privacy-link{
        color: #1578FF;
        margin: 0 4rpx;
      }

  }
  .footer-position{
    position: fixed;
    bottom: 60px;
    left: 0;
    width: 100%;
  }
  .btn-text {
    text-align: center;
    color: #1578FF;
    font-size: 16px;
    margin-top: 40px;
    display: inline-block;
  }
  .login_box_sz{
    .title{
      font-size: 24px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      text-align: left;
      color: #383838;
      line-height: 24px;
      position: absolute;
      top: 18vh;
      left: 31px;
    }
    .img{
      width: 100vw;
      height: 60vh;
    }
  }
}

</style>