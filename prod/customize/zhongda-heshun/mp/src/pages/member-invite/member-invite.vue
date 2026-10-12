
<template>
  <view class="container">
    <view class="content">
      <view class="img-box">
        <image :src="'/static/images/invite.png'"></image>
      </view>
      <view class="info-text">{{ state.option?.name }}邀请您加入</view>
      <view class="info-title">{{ state.option?.groupName }}</view>
    </view>
    <view class="btn-box">
      <button class="btn-confirm" @tap="handleConfirm">确认加入</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeUser } from '@/store/user'
import type { MemberGroup, UserInfo } from '@/types'
import { onLoad } from '@dcloudio/uni-app'
import { useShare } from '@/hook/use-share'
import { addGroupUser } from '@/api'

const userStore = storeUser()
const auth = userStore.authInfo

interface OptionType { 
	name?: string,
	phone?: string,
	groupName?: string,
	groupId?: string,
  slideOffset?: number
}
const state = reactive<{
  option: OptionType;
}>({
  option: {},
})
const isLogin = computed(() => {
  if (!userStore.userInfo || !userStore.authInfo) {
    return false
  }
  if (userStore.authInfo) {
    return true
  }
  return false
})
const handleConfirm = () => {
  if (!isLogin.value) {
    uni.navigateTo({
      url: '/pages/login/login?from=memberInvite',
    })
  } else {
    handleMemberInvite()
  }
}

const handleMemberInvite = async () => {
    const memberGroup = userStore.memberGroup || uni.getStorageSync('memberGroup') as MemberGroup
    const userInfo =  userStore.userInfo || uni.getStorageSync('userInfo') || {}
    if (!memberGroup?.id && !memberGroup?.groupId) return
    const params = {
      groupId: memberGroup?.id || memberGroup?.groupId || '',
      userIdList: [userInfo?.id || '']
    }
    const res = await addGroupUser(params)
    if (res) {
      uni.switchTab({ url: '/pages/mine/mine' })
      uni.showToast({
        title: '加入成功'
      })
    }
  }

// 初始化
const init = (Option: OptionType) => {

  userStore.memberGroup = {
    groupName: Option.groupName ? decodeURIComponent(Option.groupName) : '',
    groupId: Option.groupId || '',
    id: Option.groupId || '',
    memberUserName: Option.name ? decodeURIComponent(Option.name) : '',
    slideOffset: Option.slideOffset || 0,
  }
  uni.setStorageSync('memberGroup', {...userStore.memberGroup})
  // 对接收到的参数进行URL解码，解决中文乱码问题
  state.option = {
    name: Option.name ? decodeURIComponent(Option.name) : '',
    phone: Option.phone ? decodeURIComponent(Option.phone) : '',
    groupName: Option.groupName ? decodeURIComponent(Option.groupName) : '',
    groupId: Option.groupId || '',
  }
}

onLoad(async (Option) => {
	await init(Option as OptionType)
})

</script>

<style lang="less" scoped>
page {
  background-color: transparent;
  height: 100vh;
  background: #f0f6fb;
}

.container {
  position: relative;
  height: 100vh;
  width: 100vw;
  background: #f0f6fb;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.img-box {
  width: 244px;
  height: 192px;
}
.img-box image {
  width: 100%;
  height: 100%;
}
.info-text { 
  font-size: 14px;
  color: #95a1ac;
  line-height: 16px;
  margin-bottom: 20px;
}
.info-title {
  font-size: 17px;
  line-height: 19px;
  font-weight: 500;
  color: #121d2f;
}
.btn-box {
  margin: 0 26px;
}
.btn-confirm {
  height: 46px;
  line-height: 46px;
  background: #1A66FF;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
}
</style>
