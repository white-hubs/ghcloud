import { defineStore } from 'pinia'
interface mainState {
  panelAttr: Record<string,any>
}
export const mainStore = defineStore('main', {
    state: (): mainState=>({
      panelAttr: {},
    }),
    actions: {
      SET_PANELAttr(panelAttr: Record<string,any>){
        this.panelAttr = panelAttr
      },
  
    }
})