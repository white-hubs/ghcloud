import { defineStore } from 'pinia'
interface MainState {
  permissionId: string;
  functionsCodes: string[];
}
export const mainStore = defineStore('main', {
  state: (): MainState => ({
    permissionId: '',
    functionsCodes: []
  }),
  actions: {
    updatePermissionId (permissionId: string) {
      this.permissionId = permissionId
    },
    updateFunctionCodes (functionCodes: string[]) {
      this.functionsCodes = functionCodes
    }
  }
})
