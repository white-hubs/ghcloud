<template>
  <view class="container">
    <image class="img-bg" src="../../static/images/blue-bg.png" alt="" />
    <view class="header" @tap="toInfo(`../person/person`)">
      <view class="avatar-icon">
        <image class="img" :src="avatarPath"></image>
      </view>
      <view class="right">
        <view class="user">
          <view class="item">
            <view v-if="isLogin" class="name">
              <view>{{ state.userInfo?.name }}</view>
              <!-- <view class="tel">{{ state.userInfo?.mobile }}</view> -->
            </view>
            <view v-else>立即登录</view>
          </view>
          <text class="iconfont">&#xe860;</text>
        </view>
        <!-- 当前分组信息 -->
        <!-- <view class="group-info" v-if="isLogin" @tap="showGroupSelector">
          <view class="group-location">
            <text class="group-name">{{ currentGroup.groupName || '请选择分组' }}</text>
            <text class="distance">{{ currentGroup.id ? '' : '' }}</text>
            <text class="iconfont arrow-icon">&#xe860;</text>
          </view>
        </view> -->
      </view>
    </view>
    
    <!-- 分组选择弹窗 -->
    <view class="group-selector" v-if="state.showGroupSelector">
      <view class="group-selector-mask" @tap="hideGroupSelector"></view>
      <view class="group-selector-content">
        <view class="group-selector-header">
          <text class="title">选择分组</text>
          <text class="close" @tap="hideGroupSelector">×</text>
        </view>
        <view class="group-selector-body">
          <view class="group-list">
            <view 
              v-for="(group, index) in state.groupList" 
              :key="index" 
              class="group-item-wrapper"
            >
              <view 
                class="group-item" 
                :class="{ active: currentGroup.id === group.id }"
                :style="{ transform: `translateX(${-group.slideOffset}px)` }"
                @tap="handleSelectGroup(group)"
                @touchstart="touchStart"
                @touchmove="touchMove($event, group)"
                @touchend="touchEnd($event, group)"
              >
                <view class="group-item-left">
                  <text v-if="currentGroup.id === group.id" class="check-icon">当前选择</text>
                  <text class="group-item-name">{{ group.groupName }}</text>
                </view>
                <view class="group-item-right">
                  <text class="iconfont edit-icon" @tap.stop="showEditGroupName(group)">&#xe61c;</text>
                  <!-- <text class="edit-btn" @tap.stop="showEditGroupName(group)">修改</text> -->
                </view>
              </view>
              <view class="group-item-action" :class="{ 'slide-active': group.slideOffset > 20 }">
                <view class="exit-btn" @tap.stop="handleExitGroup(group)">退出</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 修改分组名称弹窗 -->
    <view class="edit-modal" v-if="state.showEditModal">
      <view class="edit-modal-mask" @tap="hideEditModal"></view>
      <view class="edit-modal-content">
        <view class="edit-modal-header">
          <text class="title">修改分组名称</text>
        </view>
        <view class="edit-modal-body">
          <input 
            class="edit-input" 
            type="text" 
            v-model="state.editGroupName" 
            placeholder="请输入分组名称"
            maxlength="50"
            auto-focus
          />
        </view>
        <view class="edit-modal-footer">
          <button class="btn cancel-btn" @tap="hideEditModal">取消</button>
          <button class="btn confirm-btn" @tap="confirmEditGroupName">确定</button>
        </view>
      </view>
    </view>
    <view class="content">
      <view class="profile-msg" @tap="toInfo(`../my-home/my-home`)">
        <view class="item">
          <view class="avatar avatar-icon">
            <text class="iconfont" style="color:#83a9ff;">&#xe524;</text>
          </view>
          我的家园
          <view class="right">
            <text class="current-home-name">{{ currentGroup.groupName || '请选择家园' }}</text>
            <text class="iconfont">&#xe860;</text>
          </view>
        </view>
      </view>
      <!-- <view class="profile-msg" @tap="toInfo(`../person/person`)">
        <view class="item">
          <view class="avatar avatar-icon">
            <text class="iconfont" style="color:#83a9ff;">&#xe524;</text>
          </view>
          个人信息
          <view class="right">
            <text class="iconfont">&#xe860;</text>
          </view>
        </view>
      </view> -->
      <view class="profile-msg" @tap="toInfo(`../member-list/member-list`)">
        <view class="item">
          <view class="avatar avatar-icon">
            <text class="iconfont" style="color:#FF6715;">&#xe63b;</text>
          </view>
          成员管理
          <view class="right">
            <text class="iconfont">&#xe860;</text>
          </view>
        </view>
      </view>
      <view class="profile-msg" @tap="goToLog">
        <view class="item">
          <view class="avatar avatar-icon">
            <text class="iconfont" style="color:#FF6715;">&#xe61c;</text>
          </view>
          日志管理
          <view class="right">
            <text class="iconfont">&#xe860;</text>
          </view>
        </view>
      </view>
      <view class="login">
        <button class="btn" v-if="isLogin" @tap="logout" type="share">退出登录</button>
        <button class="btn" v-else @tap="toInfo" type="share">立即登录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { storeUser } from '@/store/user'
import { version } from '../../../package.json'
import { getUserInfo, getMineGroups, getMineSelectGroup, setMineSelectGroup, exitMineGroup, editGroup } from '@/api';
import { onPullDownRefresh, onShareAppMessage, onShow } from '@dcloudio/uni-app';
import type { UserInfo, MemberGroup } from '@/types';
import { h5BaseUrl, upLoadPath } from '@/config';
import { useShare } from '@/hook/use-share';

  const { handleShare, clearCache } = useShare();
  const userStore = storeUser()
  const state = reactive<{
    version: String,
    userInfo: UserInfo | null,
    groupList: MemberGroup[],
    selectGroup: MemberGroup,
    showGroupSelector: boolean,
    editingGroup: MemberGroup | null,
    editGroupName: string,
    showEditModal: boolean,
    startX: number,
    moveX: number
  }>({
    version: '',
    userInfo: {
      id: '',
      mobile: '',
      name: '',
      fileVO: {
        path: '../../static/images/user.png',
      }
    },
    groupList: [],
    selectGroup: {},
    showGroupSelector: false,
    editingGroup: null,
    editGroupName: '',
    showEditModal: false,
    startX: 0,
    moveX: 0
  })
  
  // 当前选中的分组
  const currentGroup = computed(() => {
    return userStore.memberGroup || { id: '', groupName: '请选择分组' }
  })
  const isLogin = computed(() => {
    if (!state.userInfo || !userStore.userInfo || !userStore.authInfo) {
      clearCache()
      return false
    }
    if (userStore.authInfo) {
      return true
    }
    return false
  })
  const avatarPath = computed(() => {
    const path = state.userInfo?.fileVO?.path
    const url = path ? path?.startsWith('http') ? path : `${upLoadPath}${path}` : '../../static/images/user.png'
    return url
  })
  const showShare = async () => {
    if (state.selectGroup?.memberUserBool) {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
      });
    } else {
      uni.hideShareMenu({
        hideShareItems: ["shareAppMessage", "shareTimeline"],
      });
    }
    
  }
  onShow(async () => {
    state.version = version
    if (isLogin.value) {
      await getUser()
      
      // 从本地存储获取已保存的分组信息
      const savedGroup = uni.getStorageSync('memberGroup')
      if (savedGroup && savedGroup.id) {
        userStore.memberGroup = savedGroup
      }
      await getGroups()
      await getSelectGroup()
    }
    showShare()
    uni.$on('refreshPerson', () => {
      getUser()
    })
  })
  watch(() => state.selectGroup, () => {
    showShare()
  }, { deep: true  })
  // 获取用户选择的分组
  const getSelectGroup = async () => {
    try {
      const group = await getMineSelectGroup() as MemberGroup
      if (group) {
        // if (group?.memberUserBool === undefined) group.memberUserBool = false
        state.selectGroup = group
        userStore.memberGroup = group
        uni.setStorageSync('memberGroup', group)
      }
    } catch (error) {
    }
  }
  
  // 获取分组列表
  const getGroups = async () => {
    try {
      const groups = await getMineGroups() as MemberGroup[]
      if (groups && groups.length > 0) {
        // 初始化每个分组的滑动偏移量
        groups.forEach(group => {
          group.slideOffset = 0
        })
        state.groupList = groups
        if (!(userStore.memberGroup?.id || userStore.memberGroup?.groupId) && groups.length > 0) {
          selectGroup(groups[0])
        }
      }
    } catch (error) {
    }
  }
  
  // 触摸开始事件
  const touchStart = (e: TouchEvent) => {
    state.startX = e.touches[0].clientX
    state.moveX = e.touches[0].clientX
  }
  
  // 触摸移动事件
  const touchMove = (e: TouchEvent, group: MemberGroup) => {
    state.moveX = e.touches[0].clientX
    const moveDistance = state.startX - state.moveX
    
    // 只允许左滑
    if (moveDistance <= 0) {
      group.slideOffset = 0
      return
    }
    
    // 限制最大滑动距离为80px
    if (moveDistance > 80) {
      group.slideOffset = 80
    } else {
      group.slideOffset = moveDistance
    }
  }
  
  // 触摸结束事件
  const touchEnd = (e: TouchEvent, group: MemberGroup) => {
    // 判断是否需要自动完成滑动
    if (group.slideOffset > 40) {
      // 如果滑动超过一半，自动滑到最大位置
      group.slideOffset = 80
    } else {
      // 否则回到初始位置
      group.slideOffset = 0
    }
    
    // 重置触摸状态
    state.startX = 0
    state.moveX = 0
  }
  
  // 处理退出分组
  const handleExitGroup = (group: MemberGroup) => {
    if (!group.id) return
    
    // 如果只有一个分组，不允许退出
    if (state.groupList.length <= 1) {
      uni.showToast({
        title: '至少保留一个分组',
        icon: 'none'
      })
      return
    }
    
    // 确认是否退出分组
    uni.showModal({
      title: '提示',
      content: `确定要退出"${group.groupName}"分组吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await exitMineGroup({
              groupId: group.id as string
            })
            
            if (result) {
              uni.showToast({
                title: '退出成功',
                icon: 'success'
              })
              
              // 如果退出的是当前选中的分组，需要重新选择分组
              if (currentGroup.value.id === group.id) {
                await getSelectGroup()
              }
              
              // 重新获取分组列表
              await getGroups()
            }
          } catch (error) {
            uni.showToast({
              title: '退出失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
  
  // 显示分组选择器
  const showGroupSelector = () => {
    if (!isLogin.value) {
      // uni.navigateTo({
      //   url: `../login/login`
      // })
      return
    }
    
    state.showGroupSelector = true
  }
  
  // 隐藏分组选择器
  const hideGroupSelector = () => {
    state.showGroupSelector = false
  }
  
  // 选择分组
  const selectGroup = (group: MemberGroup) => {
    userStore.memberGroup = group
    uni.setStorageSync('memberGroup', group)
    hideGroupSelector()
  }
  // 点击选择分组
  const handleSelectGroup = async (group: MemberGroup) => {
    const res = await setMineSelectGroup({
      groupId: group.id || ''
    })
    if (res) {
      userStore.memberGroup = group
      uni.setStorageSync('memberGroup', group)
      hideGroupSelector()
    }
  }
  
  const getUser = async () => {
    try {
      const user = await getUserInfo()
      if(user){
        const res = user as UserInfo || {}
        state.userInfo = res
        userStore.userInfo = res
        uni.setStorageSync('userInfo', res)
      } else {
        state.userInfo = null
        userStore.userInfo = null
        userStore.authInfo = null
      }
    } catch (error) {
      state.userInfo = null
      userStore.userInfo = null
      userStore.authInfo = null
    }
  }
  onPullDownRefresh( async () => {
    if (isLogin.value) {
      await getUser()
      await getGroups()
      await getSelectGroup()
    }
    uni.stopPullDownRefresh()
  })
  const toInfo = (path = '') =>{
    if(isLogin.value){
      uni.navigateTo({
        url: path
      })
    }else{
      uni.navigateTo({
        url: `../login/login`
      })
    }
  }
  const goToLog = () =>{
    if(isLogin.value){
      uni.navigateTo({
        url: '../web-page/web-page?type=log',
        success: () => {
          uni.setNavigationBarTitle({
            title: '日志管理'
          })
        }
      })
      uni.$emit('switchToLogPage', { type: 'log' })
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
          clearCache()
          uni.reLaunch({
            url:'../login/login'
          })
        }
      },
    })
  }
  
  // 显示修改分组名称弹窗
  const showEditGroupName = (group: MemberGroup) => {
    state.editingGroup = group
    state.editGroupName = group.groupName ?? ''
    state.showEditModal = true
  }
  
  // 隐藏修改分组名称弹窗
  const hideEditModal = () => {
    state.showEditModal = false
    state.editingGroup = null
    state.editGroupName = ''
  }
  
  // 确认修改分组名称
  const confirmEditGroupName = async () => {
    if (!state.editGroupName.trim()) {
      uni.showToast({
        title: '分组名称不能为空',
        icon: 'none'
      })
      return
    }
    if (state.editGroupName.trim().length > 50) {
      uni.showToast({
        title: '分组名称不能超过50个字',
        icon: 'none'
      })
      return
    }
    
    if (state.editingGroup) {
      // 更新本地分组名称
      const updatedGroup = { ...state.editingGroup, groupName: state.editGroupName.trim() }
      const res  = await editGroup({
        id: state.editingGroup.id || '',
        groupName: state.editGroupName.trim()
      })
      if (res) {
        uni.showToast({
          title: '修改成功',
          icon: 'success'
        })
        hideEditModal()
        getSelectGroup()
        getGroups()
      }
      if (currentGroup.value.id === updatedGroup.id) {
        userStore.memberGroup = updatedGroup
        uni.setStorageSync('memberGroup', updatedGroup)
      }
      hideEditModal()
    }
  }
  onShareAppMessage( (): Promise<{ title: string; desc: string; path: string }> =>{
    return handleShare()
  })
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
  top: 105px;
  width: calc(100vw - 60px);
  padding: 0px 30px;
  margin-bottom: 30px;
  display: flex;
  // align-items: center;
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
    // align-items: center;
    // justify-content: space-between;
    flex:1;
    flex-direction: column;
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
    margin: 0 16px;
    background: #F3F9FF;
    display: flex;
    align-items: center;
    border: none;
    border-radius: 0;
    padding: 0;
    .item {
      display: flex;
      align-items: center;
      height: 54px;
      margin: 0px 18px;
      border-bottom: 1px solid #e7eef5;
    }

    &:first-child{
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    &:nth-child(4),&:last-child{
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      .item {
        border-bottom: none;
      }
    }
    .avatar{
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      margin-right: 12px;
    }
    .item {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 16px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: Regular;
      text-align: center;
      color: #2a4067;
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
        color: #D8D8D8;
      }
      .current-home-name{
        max-width: 180px;
        margin-right: 8px;
        font-size: 14px;
        color: #8a97a8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .login {
    width: 94vw;
    margin: 100px auto 0;
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
wx-button:after {
  border: none;
}
.user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex:1;
}
/* 分组信息样式 */
.group-info {
  // position: absolute;
  // top: 50px;
  // width: calc(100vw - 60px);
  // padding: 0 30px;
  // margin-bottom: 10px;
  // z-index: 99;
}
.group-location {
  // background-color: #fff;
  // border-radius: 12px;
  padding: 6px 0;
  display: inline-flex;
  align-items: baseline;
  // box-shadow: 0 4px 12px rgba(21, 120, 255, 0.08);
  transition: all 0.3s ease;
  
  &:active {
    background-color: #f9fbff;
    transform: scale(0.98);
  }
}
.location-icon {
  color: #1578FF;
  font-size: 22px;
  margin-right: 10px;
}
.group-name {
  flex: 1;
  font-size: 15px;
  color: #333;
  // font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.distance {
  font-size: 14px;
  color: #333;
  margin-right: 8px;
}
.arrow-icon {
  color: #333;
  font-size: 16px;
}

/* 分组选择器样式 */
.group-selector {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}
.group-selector-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.group-selector-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.group-selector-header {
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  // background-color: #f9fbff;
  background-color: #f8f8f8;
}
.group-selector-header .title {
  font-size: 18px;
  font-weight: 500;
  color: #1f3140;
}
.group-selector-header .close {
  font-size: 24px;
  color: #83a9ff;
  padding: 0 10px;
  font-weight: 300;
}
.group-selector-body {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
}
.group-list {
  padding: 10px 0;
}
.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
  background-color: #fff;
  transition: transform 0.3s ease;
  z-index: 2;
}
.group-item.active {
  background-color: #f9fbff;
}
.group-item-left {
  flex: 1;
}
.group-item-right {
  display: flex;
  align-items: center;
}
.group-item-name {
  font-size: 16px;
  color: #333;
}
.group-item {
  position: relative;
  overflow: hidden;
}
.group-item-action {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.3s ease;
  z-index: 1;
}
.group-item-action.slide-active {
  opacity: 1;
}
.group-item-wrapper {
  position: relative;
}
.exit-btn {
  width: 100%;
  height: 100%;
  background-color: #ff4d4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.check-icon {
  font-size: 12px;
  background: #1578FF;
  border-radius: 10px 10px 10px 0px;
  color: #fff;
  padding: 2px 4px;
  position: absolute;
  top: 4px;
}
.edit-btn {
  color: #1578FF;
  font-size: 18px;
  padding: 4px 10px;
  border: 1px solid #1578FF;
  border-radius: 12px;
  margin-right: 10px;
}
.edit-icon {
  color: #1578FF;
  font-size: 28px;
  padding: 4px;
}

/* 修改分组名称弹窗样式 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.edit-modal-content {
  position: relative;
  width: 80%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: zoomIn 0.3s ease;
}
@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.edit-modal-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9fbff;
}
.edit-modal-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #1f3140;
}
.edit-modal-body {
  padding: 20px;
}
.edit-input {
  width: auto;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 15px;
  color: #333;
}
.edit-modal-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}
.cancel-btn, .confirm-btn {
  flex: 1;
  height: 46px;
  line-height: 46px;
  text-align: center;
  font-size: 16px;
  border: none;
  border-radius: 0;
}
.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}
.confirm-btn {
  background-color: #1578FF;
  color: #fff;
}

/* 修改分组名称弹窗样式 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.edit-modal-content {
  position: relative;
  width: 80%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: zoomIn 0.3s ease;
}
@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.edit-modal-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9fbff;
}
.edit-modal-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #1f3140;
}
.edit-modal-body {
  padding: 20px;
}
.edit-modal-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}
.cancel-btn, .confirm-btn {
  flex: 1;
  height: 46px;
  line-height: 46px;
  text-align: center;
  font-size: 16px;
  border: none;
  border-radius: 0;
}
.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}
.confirm-btn {
  background-color: #1578FF;
  color: #fff;
}

/* 修改分组名称弹窗样式 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.edit-modal-content {
  position: relative;
  width: 80%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: zoomIn 0.3s ease;
}
@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.edit-modal-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  // background-color: #f9fbff;
  background-color: #f8f8f8;
}
.edit-modal-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #1f3140;
}
.edit-modal-body {
  padding: 20px;
}
.edit-modal-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}
.cancel-btn, .confirm-btn {
  flex: 1;
  height: 46px;
  line-height: 46px;
  text-align: center;
  font-size: 16px;
  border: none;
  border-radius: 0;
}
.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}
.confirm-btn {
  background-color: #1578FF;
  color: #fff;
}

</style>
