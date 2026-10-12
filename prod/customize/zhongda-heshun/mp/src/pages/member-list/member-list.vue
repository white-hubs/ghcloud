
<template>
  <view class="container">
    <view class="wrap">
      <view class="search-box">
        <view class="search-actions">
          <view class="search-input">
            <text class="iconfont">&#xe67d;</text>
            <input class="uni-input" placeholder="请输入名称/手机号" v-model="searchText" @confirm="getListData" placeholder-style="color: #B6BCC2;"/>
            <text class="uni-icon" v-if="searchText" @click="handleClear">&#xe434;</text>
          </view>
          <button v-if="isAdmin" class="invite-btn" open-type="share">邀请</button>
        </view>
      </view>
      <view class="member-list">
        <template v-if="state.userList?.length > 0" >
          <view 
            class="member-item" 
            v-for="(item, index) in state.userList" 
            :key="item.id"
            @touchstart="touchStart(index, $event)"
            @touchmove="touchMove(index, $event)"
            @touchend="touchEnd(index, $event)"
          >
            <view class="member-content" :style="{transform: 'translateX(' + item.moveX + 'px)'}">
              <view class="left">
                <view class="member-avatar">
                  <image :src="item.avatar && item.avatar?.path ? (item.avatar?.path.startsWith('http') ? item.avatar?.path : `${upLoadPath}${item.avatar?.path}` ) : '/static/images/user.png'"></image>
                </view>
                <view class="member-info">
                  <view class="member-name-row">
                    <view class="member-name line-2">{{ item.name || '' }}</view>
                    <text v-if="item.role === 'MANAGER'" class="manager-tag">管理员</text>
                    <text v-else class="member-tag">普通成员</text>
                  </view>
                  <view class="member-phone">{{ item.mobile || '' }}</view>
                </view>
              </view>
              <view v-if="isAdmin && item.role !== 'MANAGER'" class="remove-tip">左滑可移除人员</view>
            </view>
            <view v-if="isAdmin && item.role !== 'MANAGER'" class="delete-btn" @tap="deleteMember(index,item)">移除</view>
          </view>
        </template>
        <Empty v-else description='暂无数据' />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeUser } from '@/store/user'
import type { MemberGroup, UserInfo } from '@/types'
import { getGroupUserList, getMineSelectGroup, removeGroupUser } from '@/api'
import Empty from '@/components/empty/index.vue'
import { onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
import { upLoadPath } from '@/config';
import { useShare } from '@/hook/use-share'

const userStore = storeUser()
const auth = userStore.authInfo
const searchText = ref('')
const { handleShare } = useShare()
type MemberUser = UserInfo & { moveX: number; role?: string }

const state = reactive<{
  userList: MemberUser[];
  pullRefresh: boolean;
  selectGroup: MemberGroup;
}>({ 
  userList: [],
  pullRefresh: false,
  selectGroup: {}
})

// 触摸开始位置
const startX = ref(0)
// 是否处于滑动状态
const isTouching = ref(false)
// 滑动阈值
const threshold = 50
// 最大滑动距离
const maxSlide = -80
const getListData = async () => {
    state.userList = []
    const res = await getGroupUserList({
      keyword: searchText.value
    })
    if(res) {
      const list = (((res as {records: unknown})?.records || res) as MemberUser[] ?? [])
      state.userList = list.sort((a, b) => Number(b.role === 'MANAGER') - Number(a.role === 'MANAGER'))
    }
}
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
// 初始化数据
onMounted(() => {
  getListData()
  getSelectGroup()
  // return
  // state.userList = [
  //   { id: Math.random().toString(36).substring(2), name: '成员名称', mobile: '18089876781', area: '深圳宝安区', moveX: 0 },
  //   { id: Math.random().toString(36).substring(2), name: '成员名称', mobile: '18089876781', area: '深圳宝安区', moveX: 0 },
  // ]
})

onPullDownRefresh(async () => {
  state.pullRefresh = true
  await getListData()
  await getSelectGroup()
  uni.stopPullDownRefresh()
  setTimeout(() => {
    state.pullRefresh = false
  },3 * 1000)
})

// 触摸开始
const touchStart = (index: number, event: TouchEvent) => {
  if (!isAdmin.value) return
  if (state.userList[index]?.role === 'MANAGER') return
  if (state.pullRefresh) return
  if (event.touches.length === 1) {
    startX.value = event.touches[0].clientX
    isTouching.value = true
    state.userList.forEach((item, idx) => {
      if (idx !== index) {
        item.moveX = 0
      }
    })
    event.stopPropagation()
    event.preventDefault()
  }
}

// 触摸移动
const touchMove = (index: number, event: TouchEvent) => {
  if (!isTouching.value || state.pullRefresh) return
  
  if (event.touches.length === 1) {
    const moveX = event.touches[0].clientX - startX.value
    // 只允许左滑
    if (moveX < 0) {
      const x = Math.max(maxSlide, moveX)
      state.userList[index].moveX = x
    } else if (moveX > 0 && state.userList[index].moveX < 0) {
      const x = Math.min(0, state.userList[index].moveX + moveX)
      state.userList[index].moveX = x
    }
    event.stopPropagation()
    event.preventDefault()
  }
}

// 触摸结束
const touchEnd = (index: number, event: TouchEvent) => {
  isTouching.value = false
  
  if (state.userList[index].moveX < -threshold) {
    state.userList[index].moveX = maxSlide
  } else {
    state.userList[index].moveX = 0
  }
  event.stopPropagation()
  event.preventDefault()
}

// 删除成员
const deleteMember = (index: number, item: UserInfo) => {
  if ((item as MemberUser).role === 'MANAGER') {
    uni.showToast({
      title: '管理员不可移除',
      icon: 'none'
    })
    return
  }
  uni.showModal({
    title: '提示',
    content: '确定要移除该成员吗？',
    success: async function(res) {
      if (res.confirm) {
        // state.userList.splice(index, 1)
        const res = await removeGroupUser({
          groupId: (userStore.memberGroup?.id || userStore.memberGroup?.groupId) as unknown as string,
          userIdList: [item.id as unknown as string]
        })
        if (res) {
          uni.showToast({
            title: '已移除',
            icon: 'success'
          })
        }
        getListData()
      }
    }
  })
}

const handleClear = () => {
  searchText.value = ''
  getListData()
}

const isAdmin = computed(() => {
    return state.selectGroup?.memberUserBool
  })

onShareAppMessage((): Promise<{ title: string; desc: string; path: string }> => {
  return handleShare()
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
  font-family: Source Han Sans CN, Source Han Sans CN-Medium;
  font-weight: Medium;
  overflow: hidden;
}
.wrap {
  padding: 12px;
  overflow: hidden;
}

.search-box {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 12px;
  background: #f0f6fb;
  box-shadow: 0px 3px 16px 0px rgba(194,208,221,0.40), -3px -3px 6px 0px #f0f6fb; 
}
.search-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-input {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 8px;
  padding:0 12px;
  height: 36px;
  flex: 1;
  min-width: 0;
  .iconfont{
    color: #999;
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
  .uni-input{
    height: 32px;
    line-height: 32rpx;
    padding: 2px 0;
    font-size: 13px;
  }
}

.invite-btn {
  flex: none;
  width: 64px;
  height: 36px;
  line-height: 36px;
  padding: 0;
  margin: 0;
  border-radius: 8px;
  background: #1578FF;
  color: #FFFFFF;
  font-size: 14px;
}

.member-list {
  max-height: calc(100vh - 62px);
  padding-top: 62px;
  overflow-y: auto;
}

.member-item {
  position: relative;
  height: 70px;
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0px 3px 16px 0px rgba(194,208,221,0.40), -3px -3px 6px 0px #f0f6fb; 
}

.member-content {
  position: absolute;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #FFFFFF;
  transition: transform 0.2s ease;
  z-index: 1;
}
.left{
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.member-avatar {
  width: 48px;
  height: 48px;
  margin: 0 10px;
}

.member-avatar image {
  width: 48px;
  height: 48px;
  border-radius: 100%;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  min-width: 0;
  margin-bottom: 4px;
}

.member-name {
  font-size: 15px;
  color: #121D2F;
  max-width: 150px;
  margin-right: 8px;
}

.manager-tag,
.member-tag {
  flex: none;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 11px;
}

.manager-tag {
  background: #eaf3ff;
  color: #1578FF;
}

.member-tag {
  background: #f4f6f8;
  color: #7B8794;
}

.member-phone {
  font-size: 13px;
  color: #95A1AC;
}

.remove-tip {
  flex: none;
  max-width: 92px;
  margin: 0 12px;
  font-size: 11px;
  color: #B6BCC2;
  text-align: right;
  line-height: 16px;
}

.delete-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 80px;
  height: 100%;
  background-color: #FF5A5F;
  color: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
}

/* 分割线 */
.member-item:not(:last-child) .member-content::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 1px;
  background-color: #EEEEEE;
}
.line-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 15px;
}
.line-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 15px;
}
</style>
