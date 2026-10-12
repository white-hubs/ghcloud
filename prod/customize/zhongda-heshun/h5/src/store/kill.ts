import { authStore } from '@/api/auth-store'
import type { Product } from '@ghcloud/cube-iot-center-service'
import { CubeZhongdaHeshunService, type GroupVO } from '@ghcloud/cube-zhongda-heshun-service'
import { defineStore } from 'pinia'

interface StoreKill {
  userInfo: { id: string; name: string; } | undefined;
  deviceInfo: { id: string; name: string; } | undefined;
  groupActive: string;
  groupChecked: GroupVO | undefined;
  selectProduct: Product | undefined;
  isAdmin: boolean | undefined;
}

export const storeKill = defineStore('storeKill', {
  state: (): StoreKill => {
    return {
      userInfo: undefined,
      deviceInfo: undefined,
      groupActive: '',
      selectProduct: undefined,
      groupChecked: undefined,
      isAdmin: undefined,
    }
  },
  getters: {

  },
  actions: {
    setGroupActive(groupId: string): void {
      this.groupActive = groupId
    },
    setIsAdmin(isAdmin: boolean | undefined): void {
      this.isAdmin = isAdmin
    },
    setGroupChecked(data: Record<string, unknown>): void {
      this.groupChecked = data as unknown as GroupVO
    },
    getGroupActive(): string {
      return this.groupActive
    },
    getGroupChecked(): GroupVO | undefined {
      return this.groupChecked
    },
    // 自动更新groupActive和groupChecked
    async updateGroupInfo(): Promise<void> {
      try {
        const cubeZhongdaHeshunService = new CubeZhongdaHeshunService(authStore)
        const group = await cubeZhongdaHeshunService.getMineGroup()
        if (group) {
          this.groupActive = group.id
          this.groupChecked = group
          this.isAdmin = group?.memberUserBool
          this.setGroupActive(group.id)
          this.setIsAdmin(group?.memberUserBool)
        }
      } catch (error) {
      }
    }
  },
  persist: true
})
