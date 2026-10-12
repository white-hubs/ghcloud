import { storeUser } from '@/store/user'
import type { ServiceError, UserInfo } from '@ghcloud/cube-ouaa-service'
import { message } from '@ghcloud/cube-ui'

interface UseUser {
  getUserInfo: (userId: string) => Promise<void>;
}

export const useUser = (): UseUser => {
  const userStore = storeUser()
  const getUserInfo = async (userId: string): Promise<void> => {
    try {
      // userStore.userInfo = await service.cubeOuaaService.getUserInfo(userId)
      userStore.userInfo = window.businessData?.userData as UserInfo
    } catch (error) {
      const { errorMessage } = (error as { toJSON: () => ServiceError; }).toJSON()
      message.error(errorMessage || '请求错误')
    }
  }

  return {
    getUserInfo
  }
}
