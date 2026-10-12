import type { ProjectSupervise } from '@/types/project-type'
import { defineStore } from 'pinia'

interface StoreProject {
  projectSupervise: ProjectSupervise | null;
  checkSuperviseUsers: unknown[] | null;
  checkSafetyDockUser: unknown[] | null;
  projectSuperviseDetail: ProjectSupervise | null;
}

export const storeProject = defineStore('storeProject', {
  state: (): StoreProject => {
    return {
      projectSupervise: null,
      checkSuperviseUsers: null,
      checkSafetyDockUser: null,
      projectSuperviseDetail: null,
    }
  },
  getters: {

  },
  actions: {
    resetCache () {
      this.projectSupervise = null
      this.checkSuperviseUsers = null
      this.checkSafetyDockUser = null
      this.projectSuperviseDetail = null
    },
  },
  persist: true
})
