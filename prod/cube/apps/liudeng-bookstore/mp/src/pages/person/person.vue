
<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="label">头像</text>
        <view class="right">
          <button class="btn" open-type="chooseAvatar" @chooseavatar="onChooseavatar">
            <view class="avatar-icon">
              <image class="img"
                :src="getImagePath(state.avatarUrl)">
              </image>
            </view>
          </button>
          <text class="iconfont">&#xe860;</text>
        </view>
      </view>
      <view class="form-item">
        <text class="label">昵称</text>
        <input class="input" name="nickName" type="nickname" placeholder="请填写昵称" @change="handleNameChange" v-model="state.nickName" />
      </view>
      <view class="form-item">
        <text class="label">性别</text>
        <view>
          <radio-group @change="radioChange">
            <label class="radio"><radio color="#1578FF" value="MALE" :checked="state.gender === 'MALE'" />男</label>
            <label class="radio"><radio color="#1578FF" value="FEMALE" :checked="state.gender === 'FEMALE'" />女</label>
          </radio-group>
        </view>
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <text class="input">{{ state.userInfo.mobile }}</text>
      </view>
    </view>
    <button @tap="onSubmit" class="form-button">保 存</button>
  </view>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { storeUser } from '@/store/user'
import type { UserInfo } from '@/types'
import { getUserInfo, updateUserInfo } from '@/api'
import { h5BaseUrl, tenant, terminal, upLoadPath } from '@/config'

const userStore = storeUser()
const auth = userStore.authInfo
const tenantCode =  auth?.tenants && auth?.tenants.length > 0 ? auth?.tenants[0] : tenant

const state = reactive<{ 
  userInfo: UserInfo, 
  nickName: string, 
  gender: string, 
  avatarUrl: string, 
  photographId: string 
}>({
  userInfo: {
    id: userStore.userInfo?.id ?? '',
    mobile: userStore.userInfo?.mobile ?? '',
    name: userStore.userInfo?.name ?? '',
  },
  nickName: userStore.userInfo?.name ?? '',
  gender: userStore.userInfo?.gender ?? '',
  avatarUrl: userStore.userInfo?.fileVO?.path ?? '../../static/user.png',
  photographId: ''
})
const getImagePath = (path: string) => {
  if (path === '../../static/user.png') return path
  const url = path?.includes('https') ? path : h5BaseUrl + path
  return url
}
const getUser = async () => {
  const user = await getUserInfo()
  if(user){
    state.userInfo = (user as {data: UserInfo})?.data || {}
    state.nickName = state.userInfo?.name || state.userInfo?.username || state.userInfo?.mobile || ''
  }
}
onMounted(async () => {
  state.nickName = userStore.userInfo?.name || userStore.userInfo?.username || userStore.userInfo?.mobile || ''
  await getUser()
})
const handleNameChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  state.nickName = value
}
const radioChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  state.gender = value
}

const onChooseavatar = (e: any) => {
  uploadImage(e.detail.avatarUrl)
}
/** 图片持久化 */
const uploadImage = (avatarUrl: string) => {
  let authHeaders = {}
	if(auth && auth.access_token){
		authHeaders = {
			Authorization: 'Bearer ' + auth?.access_token,
			Tenant: tenantCode,
      terminal: terminal,
      'Content-Type': 'multipart/form-data'
		}
	}
  const formData = {
    tenant: tenantCode,
    businessKey: 'ouaa'
  }
  uni.uploadFile({
    url: `${upLoadPath}`,
    header: authHeaders,
    fileType: 'image',
    filePath: avatarUrl,
    name: 'file',
    formData:formData,
    success: ({ data, statusCode }) => {
        if(data && statusCode === 200){
            const res = JSON.parse(data).data
            state.photographId = res.id
            state.avatarUrl = res.path
        }
    },
    fail: (error) => {
      uni.showToast({
        icon: 'none',
        title: '上传失败'
      })
    }
  })
}
const onSubmit = async () => {
  const params = {
    id: state.userInfo.id,
    name: state.nickName,
    username: state.userInfo.name,
    mobile: state.userInfo.mobile,
    photographIdList: [state.photographId],
    gender: state.gender,
    enabled: userStore.userInfo?.enabled,
    organizationIds: userStore.userInfo?.organizations?.map((item: { id: string }) => item.id),
    positionIds: userStore.userInfo?.positions?.map((item: { id: string }) => item.id),
    roleIds: userStore.userInfo?.roles?.map((item: { id: string }) => item.id),
    password: userStore.userInfo?.password,
    fileId: state.photographId,
  }
  if(!state.userInfo.id) return
  if(!state.nickName) {
    uni.showToast({
      title: '请填写昵称',
      icon: 'none',
    })
    return
  }
  updateUserInfo(state.userInfo.id, params).then((res) => {
    if(!!res){
      uni.showToast({
        title: '更新成功',
        icon: 'none',
        duration: 2000
      })
      uni.$emit('refreshPerson')
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.navigateTo({ url: '../mine/mine' })
      }
    }
  }).catch((error) => {
  })
}
</script>

<style lang="less" scoped>
page {
  background-color: transparent;
  height: 100vh;
  background-color: #F7F7F7;
}
.container {
  margin: 12px;
  position: relative;
}
.form{
  background: #ffffff;
  padding: 0 12px;
  padding-bottom: 0;
  border-radius: 6px;
    .avatar-icon{
      width: 38px;
      height: 38px;
      border-radius: 50%;
      margin-right: 8px;
      overflow: hidden;
      .img{
        width: 100%;
        height: 100%;
      }
    }
    .form-item{
      height: 48px;
      line-height: 48px;
      padding-bottom: 6px;
      border-bottom: 1px solid #F8F9F9;
      font-size: 15px;
      color: #0F181F;
      line-height: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .label{
      font-size: 15px;
      color: #0F181F;
      line-height: 24px;
      width: 120rpx;
    }
    .picker,.right{
      flex:1;
      height: 48px;
      line-height: 48px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 15px;
      color: #0F181F;
      text-align: right;
      .iconfont{
        font-size: 14px;
      }
    }
    .input{
      height: 48px;
      line-height: 48px;
      font-size: 15px;
      color: #0F181F;
      text-align: right;
      width: 220px;
      .iconfont{
        font-size: 14px;
      }
    }
}
.form-button {
  margin-top: 100px;
  text-align: center;
  height: 40px;
  line-height: 40px;
  background: #1d66ff;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  width: 100%;
}
.btn {
  border: none;
  background: transparent;
  border-radius: 50%;
  display: inline-flex;
  background: transparent;
  padding:0;
  margin:0;
  &::after{
    background: transparent;
    display:none;
  }
}
.avatar {
  background: #edf5ff;
  border-radius: 50%;
  display: inline-block;
  image{
    width: 70px;
    height: 70px;
  }
}
.avatar-icon{
    width: 48px;
    height: 48px;
    background: #1578ff;
    background: #a2b6d245;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    .iconfont{
      font-size: 30px;
    }
  }
  .avatar-img{
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
  .radio{
    margin-left: 5px;
    radio{
      transform: scale(0.8)
    }
  }
</style>
