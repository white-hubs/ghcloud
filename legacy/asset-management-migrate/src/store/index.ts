import { defineStore } from 'pinia'
interface mainState {
  permissionId: string
  functionsCodes: string[]
}
export const mainStore = defineStore('main', {
    state: (): mainState=>({
          permissionId: '',
          functionsCodes:[]
    }),
    actions: {
      updatePermissionId(permissionId:string){
        this.permissionId = permissionId
      },
      updateFunctionCodes(functionCodes:string[]){
        this.functionsCodes=functionCodes;
      }
    }
})