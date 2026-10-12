import { ref, onMounted, onBeforeMount } from 'vue'
import { onPullDownRefresh, onShareAppMessage, onShow } from '@dcloudio/uni-app';
import { storeUser } from '@/store/user'
import { getMineGroups } from '@/api'
import type { MemberGroup } from '@/types'
// import { getMineGroups } from '@/api/index'

const userStore = storeUser()

interface UseShare {
  handleShare: () => Promise<{ title: string; desc: string; path: string }>;
  clearCache: () => void;
}

export const useShare = (): UseShare => {
  const handleShare = async (): Promise<{ title: string; desc: string; path: string }> => { 
    const name = userStore.userInfo?.name || userStore.authInfo?.name || ''
    const mobile = userStore.userInfo?.mobile || ''
    
    // 1. 优先从本地存储获取分组信息
    let memberGroup = uni.getStorageSync('memberGroup') || {}
    
    // 2. 如果本地存储没有分组ID，则使用userStore中的分组信息
    if (!memberGroup.id && (userStore.memberGroup?.id || userStore.memberGroup?.groupId)) {
      memberGroup = userStore.memberGroup
    }
    
    // 3. 如果仍然没有分组ID，则尝试从服务器获取最新的分组信息
    if (!memberGroup.id) {
      try {
        const groups = await getMineGroups() as MemberGroup[]
        if (groups && groups.length > 0) {
          if (!(userStore.memberGroup?.id || userStore.memberGroup?.groupId) && groups.length > 0) {
            uni.setStorageSync('memberGroup', memberGroup)
            userStore.memberGroup = memberGroup
          }
        }
      } catch (error) {
      }
    }
    
    const groupName = memberGroup.groupName || ''
    const groupId = memberGroup.id || ''
    
  
    return {
      title: '智慧生活此刻开始',
      desc: '成员邀请',
      path: `/pages/member-invite/member-invite?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(mobile)}&groupName=${encodeURIComponent(groupName)}&groupId=${encodeURIComponent(groupId)}`,
    }
  }

  const clearCache = () =>{
    try {
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('memberGroup')
      uni.removeStorageSync('authInfo')
      userStore.userInfo = null
      userStore.memberGroup = null
      userStore.authInfo = null
      uni.removeStorageSync('storeUser')
    } catch {
    }
  }
  return {
    handleShare,
    clearCache
  }
}
