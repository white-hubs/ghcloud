import { defineStore } from 'pinia'

import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { HistoryActionTypeEnum, HistoryStackItemEnum } from './chart-history-store.d'
import { editHistoryMax } from '@/setting/design-setting'
import type {
  HistoryItemType,
  ChartHistoryStoreType
} from './chart-history-store.d'
export const useChartHistoryStore = defineStore({
  id: 'useChartHistoryStore',
  state: (): ChartHistoryStoreType => ({
    // 后退栈
    backStack: [],
    // 前进栈
    forwardStack: []
  }),
  getters: {
    getBackStack (): HistoryItemType[] {
      return this.backStack
    },
    getForwardStack (): HistoryItemType[] {
      return this.forwardStack
    }
  },
  actions: {
    /**
     * * 新增记录并插入栈
     * @param item 组件实例
     * @param actionType 动作类型
     * @param targetType 对象类型（默认图表）
     */
    createStackItem (
      item: CreateComponentType[] | CreateComponentType,
      actionType: HistoryActionTypeEnum,
      targetType: string,
    ) {
      // 优化性能转为 freeze
      this.pushBackStackItem(
        Object.freeze({
          [HistoryStackItemEnum.ID]: new Date().getTime().toString(),
          [HistoryStackItemEnum.HISTORY_DATA]: item,
          [HistoryStackItemEnum.ACTION_TYPE]: actionType,
          [HistoryStackItemEnum.TARGET_TYPE]: targetType,
        } as const)
      )
    },
    // * 推入后退栈
    pushBackStackItem (item: HistoryItemType | HistoryItemType[], notClear = false): void {
      if (item instanceof Array && item !== undefined) this.backStack = [...this.backStack, ...item]
      else this.backStack.push(item)
      this.backStack.splice(0, this.backStack.length - editHistoryMax)
      // 新动作需清空前进栈
      if (notClear) return
      this.clearForwardStack()
    },
    // * 推入前进栈
    pushForwardStack (item: HistoryItemType | HistoryItemType[]): void {
      if (item instanceof Array) this.forwardStack = [...this.forwardStack, ...item]
      else this.forwardStack.push(item)
    },
    // * 移出后退栈
    popBackStackItem (): HistoryItemType | undefined {
      if (this.backStack.length > 0) {
        return this.backStack.pop()
      }
    },
    // * 移出前进栈
    popForwardStack (): HistoryItemType | undefined {
      if (this.forwardStack.length > 0) {
        return this.forwardStack.pop()
      }
    },
    // * 清空前进栈
    clearForwardStack () {
      this.forwardStack = []
    },
    // * 清空后退栈(保留初始化)
    clearBackStack () {
      this.backStack = []
    },
    // * 撤回
    backAction () {
      try {
        // 排除画布初始化
        if (this.getBackStack.length > 0) {
          const targetData = this.popBackStackItem()
          // 移除记录到前进堆
          targetData && this.pushForwardStack(targetData)
          return targetData
        }
      } catch {}
    },
    // * 前进
    forwardAction () {
      try {
        if (this.getForwardStack.length) {
          const targetData = this.popForwardStack()
          // 放入后退栈
          targetData && this.pushBackStackItem(targetData, true)
          return targetData
        }
      } catch {}
    },
    // * 新增组件记录
    createAddHistory (item: CreateComponentType[]) {
      this.createStackItem(item, HistoryActionTypeEnum.ADD, '')
    },
    // * 更新属性记录（大小、图表属性）
    createUpdateHistory (item: CreateComponentType[]) {
      this.createStackItem(item, HistoryActionTypeEnum.UPDATE, '')
    },
    // * 删除组件记录
    createDeleteHistory (item: CreateComponentType[]) {
      this.createStackItem(item, HistoryActionTypeEnum.DELETE, '')
    },
    // * 移动组件记录
    createMoveHistory (item: CreateComponentType[]) {
      this.createStackItem(item, HistoryActionTypeEnum.MOVE, '')
    },
  },
})
