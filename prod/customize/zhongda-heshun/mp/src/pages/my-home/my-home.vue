<template>
  <view class="container">
    <view class="group-selector">
      <view class="group-selector-content">
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
                  <label class="radio" v-if="currentGroup.id === group.id" ><radio color="#1578FF" value="1" :checked="true" /></label>
                  <label class="radio" v-else><radio color="#1578FF" value="0" :checked="false" /></label>
                  <text v-if="currentGroup.id === group.id" class="check-icon">当前选择</text>
                  <text class="group-item-name">{{ group.groupName }}</text>
                </view>
                <view class="group-item-right">
                  <text class="iconfont edit-icon" @tap.stop="showEditGroupName(group)">&#xe61c;</text>
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
    
    <view class="edit-modal" v-if="state.showEditModal">
      <view class="edit-modal-mask" @tap="hideEditModal"></view>
      <view class="edit-modal-content">
        <view class="edit-modal-header">
          <text class="title">修改家园名称</text>
        </view>
        <view class="edit-modal-body">
          <input
            class="edit-input"
            type="text"
            v-model="state.editGroupName"
            placeholder="请输入家园名称"
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
  </view>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { storeUser } from '@/store/user'
import { getMineGroups, getMineSelectGroup, setMineSelectGroup, exitMineGroup, editGroup } from '@/api';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import type { MemberGroup } from '@/types';

  const userStore = storeUser()
  const state = reactive<{
    groupList: MemberGroup[],
    selectGroup: MemberGroup,
    editingGroup: MemberGroup | null,
    editGroupName: string,
    showEditModal: boolean,
    startX: number,
    moveX: number
  }>({
    groupList: [],
    selectGroup: {},
    editingGroup: null,
    editGroupName: '',
    showEditModal: false,
    startX: 0,
    moveX: 0
  })
  
  const currentGroup = computed(() => {
    return userStore.memberGroup || { id: '', groupName: '请选择家园' }
  })
  onShow(async () => {
    const savedGroup = uni.getStorageSync('memberGroup')
    if (savedGroup && savedGroup.id) {
      userStore.memberGroup = savedGroup
    }
    await getGroups()
    await getSelectGroup()
  })
  const getSelectGroup = async () => {
    try {
      const group = await getMineSelectGroup() as MemberGroup
      if (group) {
        state.selectGroup = group
        userStore.memberGroup = group
        uni.setStorageSync('memberGroup', group)
      }
    } catch (error) {
    }
  }
  
  const getGroups = async () => {
    try {
      const groups = await getMineGroups() as MemberGroup[]
      if (groups && groups.length > 0) {
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
  
  const touchStart = (e: TouchEvent) => {
    state.startX = e.touches[0].clientX
    state.moveX = e.touches[0].clientX
  }
  
  const touchMove = (e: TouchEvent, group: MemberGroup) => {
    state.moveX = e.touches[0].clientX
    const moveDistance = state.startX - state.moveX
    
    if (moveDistance <= 0) {
      group.slideOffset = 0
      return
    }
    
    if (moveDistance > 80) {
      group.slideOffset = 80
    } else {
      group.slideOffset = moveDistance
    }
  }
  
  const touchEnd = (e: TouchEvent, group: MemberGroup) => {
    if (group.slideOffset > 40) {
      group.slideOffset = 80
    } else {
      group.slideOffset = 0
    }
    
    state.startX = 0
    state.moveX = 0
  }
  
  const handleExitGroup = (group: MemberGroup) => {
    if (!group.id) return
    
    if (state.groupList.length <= 1) {
      uni.showToast({
        title: '至少保留一个家园',
        icon: 'none'
      })
      return
    }
    
    uni.showModal({
      title: '提示',
      content: `确定要退出"${group.groupName}"家园吗？`,
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
              
              if (currentGroup.value.id === group.id) {
                await getSelectGroup()
              }
              
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
  
  const selectGroup = (group: MemberGroup) => {
    userStore.memberGroup = group
    uni.setStorageSync('memberGroup', group)
  }

  const handleSelectGroup = async (group: MemberGroup) => {
    const res = await setMineSelectGroup({
      groupId: group.id || ''
    })
    if (res) {
      userStore.memberGroup = group
      uni.setStorageSync('memberGroup', group)
    }
  }
  
  onPullDownRefresh( async () => {
    await getGroups()
    await getSelectGroup()
    uni.stopPullDownRefresh()
  })
  
  const showEditGroupName = (group: MemberGroup) => {
    state.editingGroup = group
    state.editGroupName = group.groupName ?? ''
    state.showEditModal = true
  }
  
  const hideEditModal = () => {
    state.showEditModal = false
    state.editingGroup = null
    state.editGroupName = ''
  }
  
  const confirmEditGroupName = async () => {
    if (!state.editGroupName.trim()) {
      uni.showToast({
        title: '家园名称不能为空',
        icon: 'none'
      })
      return
    }
    if (state.editGroupName.trim().length > 50) {
      uni.showToast({
        title: '家园名称不能超过50个字',
        icon: 'none'
      })
      return
    }
    
    if (state.editingGroup) {
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
</script>

<style lang="less" scoped>
page {
  height: 100vh;
  background-color: #F7F7F7;
}
.container {
  color: #666666;
  background-color: transparent;
}
.group-selector-content {
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  // background-color: #fff;
  // border-radius: 20px 20px 0 0;
  // box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}
.group-selector-body {
  flex: 1;
  overflow-y: auto;
}
.group-list {
  margin: 10px;
  margin-top: 20px;
}
.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  // border-bottom: 1px solid #f5f5f5;
  position: relative;
  background-color: #fff;
  transition: transform 0.3s ease;
  z-index: 2;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  box-shadow: 0px 3px 16px 0px rgba(194,208,221,0.40), -3px -3px 6px 0px #f0f6fb; 

}
.group-item.active {
  background-color: #f9fbff;
}
.group-item-left {
  flex: 1;
  display: flex;
  align-items: center;
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
  left: 44px;
}
.radio{
  margin-left: 5px;
  radio{
    transform: scale(0.8)
  }
}
.edit-icon {
  color: #1578FF;
  font-size: 28px;
  padding: 4px;
}
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
}
.edit-modal-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
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
</style>
