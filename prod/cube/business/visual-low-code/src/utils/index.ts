const Image_404 = "/resource/v1/visual-low-code/images/exception/image-404.png"
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import type { CreateComponentType, ModelNavType } from '@/store/modules/chart-edit-store/chart-edit-store.d'

import { defineAsyncComponent, type AsyncComponentLoader } from 'vue'
import type { HistoryItemType } from '@/store/modules/chart-history-store/chart-history-store.d'
import type { UploadFileInfo } from '@ghcloud/visual-view-ui'

export * from '@/utils/type'
// 获取tsx组件路径
const tsxComponentsSource = ((import.meta as unknown) as { glob: (t: string) => Record<string, AsyncComponentLoader>; }).glob(
  '@/components/config-components/**/**.tsx'
)
const settingComponentsSource = ((import.meta as unknown) as { glob: (t: string) => Record<string, AsyncComponentLoader>; }).glob(
  '@/components/setting-components/**/**.tsx'
)
/**
 * * 获取错误处理图片，默认 404 图
 * @returns url
 */
export const requireErrorImg = (): string => {
  return Image_404
}
/**
 * * 获取tsx组件路径处理
 */
export const requierTsxComponents = (): any => {
  type tsxModules = Record<string, any>
  const modules: tsxModules = {}
  Object.keys(tsxComponentsSource).forEach((key) => {
    const folderArr = key.split('/') // 这里根据自己目录情况所操作
    let componentName = folderArr.at(-1)
    componentName = componentName?.replace('.tsx', '')
    modules[componentName!] = defineAsyncComponent(
      tsxComponentsSource[key]
    ) // 异步加载组件
  })
  return modules
}
export const settingComponents = (): object => {
  type tsxModules = Record<string, unknown>
  const modules: tsxModules = {}
  Object.keys(settingComponentsSource).forEach((key) => {
    const folderArr = key.split('/') // 这里根据自己目录情况所操作
    let componentName = folderArr.at(-1)
    componentName = componentName?.replace('.tsx', '')
    modules[componentName!] = defineAsyncComponent(
      settingComponentsSource[key]
    ) // 异步加载组件
  })
  return modules
}
// 判断是否为json
export function isJson (str: string): boolean {
  if (typeof str === 'string') {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }
  return true
}
export function removeCurrentPageComps (currentPage: CreateComponentType, id: string): void {
  currentPage.components?.forEach((comp, index) => {
    if (comp.id === id) {
      currentPage.components?.splice(index, 1)
      return
    }
    removeCurrentPageComps(comp, id)
  })
}
export function popPageComps (currentPage: CreateComponentType, stack: HistoryItemType): void {
  currentPage.components?.forEach((comp, index) => {
    if (comp.id === (stack.historyData as CreateComponentType).id) {
      currentPage.components?.splice(index, 1)
      return
    }
    popPageComps(comp, stack)
  })
}
export function pushPageComps (currentPage: CreateComponentType, stack: HistoryItemType): void {
  currentPage.components?.push(stack.historyData as CreateComponentType)
}

export const getUrlParams = (): Record<string, string> => {
  const args: Record<string, string> = {}
  const query = location.search.substring(1)
  const pairs = query.split('&')
  for (const item of pairs) {
    const pos = item.indexOf('=')
    if (pos === -1) {
      continue
    }
    const argname = item.substring(0, pos)
    const value = item.substring(pos + 1)
    args[argname] = unescape(value)
  }
  return args// 返回对象
}
const formatDateTime = (): string => {
  const date = new Date()
  const y = date.getFullYear()
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? ('0' + m.toString()) : m
  let d: number | string = date.getDate()
  d = d < 10 ? ('0' + d.toString()) : d
  const h = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return y.toString() + m.toString() + d.toString() + h.toString() + minute.toString() + second.toString()
}
export const createUuid = (): string => {
  return formatDateTime() + Math.random().toString(36).substr(2)
}
// 时钟
export const getTime = (format = 'YYYY-MM-DD hh:mm:ss'): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1).toString() : date.getMonth() + 1
  const day = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate()
  const hour = date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours()
  const min = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes()
  const sec = date.getSeconds() < 10 ? '0' + date.getSeconds().toString() : date.getSeconds()
  let time = ''
  switch (format) {
    case 'YYYY-MM-DD':
      time = `${year}-${month}-${day}`
      break
    case 'YYYY-MM-DD hh:mm':
      time = `${year}-${month}-${day} ${hour}:${min}`
      break
    case 'YYYY-MM-DD hh:mm:ss':
      time = `${year}-${month}-${day} ${hour}:${min}:${sec}`
      break
    case 'MM-DD hh:mm:ss':
      time = `${month}-${day} ${hour}:${min}:${sec}`
      break
    default:
      time = `${month}-${day} ${hour}:${min}`
      break
  }
  return time
}
// 时间转换
export const getDate = (timestamp?: number | string, format = 'YYYY-MM-DD'): string => {
  const currentDate = timestamp ? new Date(timestamp) : new Date()
  const year = currentDate.getFullYear().toString()
  const month = currentDate.getMonth() < 9 ? '0' + (currentDate.getMonth() + 1).toString() : (currentDate.getMonth() + 1).toString() // 月份从0开始，所以要加1
  const day = currentDate.getDate() < 10 ? '0' + currentDate.getDate().toString() : currentDate.getDate().toString()
  const hours = currentDate.getHours() < 10 ? '0' + currentDate.getHours().toString() : currentDate.getHours().toString()
  const minutes = currentDate.getMinutes() < 10 ? '0' + currentDate.getMinutes().toString() : currentDate.getMinutes().toString()
  const seconds = currentDate.getSeconds() < 10 ? '0' + currentDate.getSeconds().toString() : currentDate.getSeconds().toString()
  let date = ''
  if (format === 'YYYY-MM-DD') {
    date = year + '-' + month + '-' + day
  }
  if (format === 'YYYY-MM-DD HH:mm:ss') {
    date = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
  }
  return date
}

// 导航
export interface NavNode {
  category?: ComponentCategoryEnum;
  categoryName?: string;
  key?: string;
  id: string ;
  title?: string | undefined;
  name?: string | undefined;
  level?: number | undefined;
  parentId?: number | string | undefined;
  children?: NavNode[];
  styles?: object;
}
// 将垂直菜单转为树形数据
export const toTree = (arr: ModelNavType[], parentId: string): ModelNavType[] => {
  const loop = (parentId: string): ModelNavType[] => {
    const res = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (item.parentId !== parentId) {
        continue
      }
      if (loop(item.id)?.length === 0) {
        item.children = null
      } else {
        item.children = loop(item.id)
      }
      res.push(item)
    }
    return res
  }
  return loop(parentId)
}
// 将树形的component转为一维数组
export const toArray = (arr: CreateComponentType[]): CreateComponentType[] => {
  const res: CreateComponentType[] = []
  arr.forEach(node => {
    const nodeToArray = (node: CreateComponentType): CreateComponentType[] => {
      const { components } = node
      res.push(node)
      components?.forEach(child => nodeToArray(child))
      return res
    }
    return nodeToArray(node)
  })
  return res
}
// 用components中获取指定项
export const getActiveMenu = (arr: CreateComponentType[] | null | undefined, curId: string | number): CreateComponentType | null => {
  let active: CreateComponentType | null = null
  const flattening = (arr: CreateComponentType[] | null | undefined, curId: string | number): void => {
    if (!arr) return
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === curId) {
        active = arr[i]
        return
      } else {
        flattening(arr[i].components, curId)
      }
    }
  }
  flattening(arr, curId)
  return active
}
// 获取同级的所有components
export const parentArray = (treeData: CreateComponentType[], nodeId: string): CreateComponentType[] | null => {
  const siblings: CreateComponentType[] = []
  const findSiblingsRecursive = (data: CreateComponentType[], targetId: string, parent: CreateComponentType | null): void => {
    for (const item of data) {
      if (item.id === targetId) {
        siblings.push(...(parent ? parent.components ?? [] : treeData))
      } else if (item.components) {
        findSiblingsRecursive(item.components, targetId, item)
      }
    }
  }

  findSiblingsRecursive(treeData, nodeId, null)
  return siblings
}
// 获取指定类型组件
export const getComponentByType = (arr: CreateComponentType[], currentBlock: CreateComponentType | null, type: ComponentCategoryEnum | string): CreateComponentType | null => {
  // 获取所有的指定类型组件和组合组件
  const configList = arr.filter(x => x.category === type || x.category === ComponentCategoryEnum.COMBINATION || x.key === type)
  // 获取所有所有的指定类型组件
  const itemComponentList: CreateComponentType[] = []
  // 递归判断是组合组件还是普通组件
  const getItemComponentList = (list: CreateComponentType[]): void => {
    const filterItem = (list: CreateComponentType[]): void => {
      for (const item of list) {
        // 普通组件直接渲染
        if (item.category !== ComponentCategoryEnum.COMBINATION) {
          itemComponentList.push(item)
        }
        if (item.components)filterItem(item.components)
        if (!item.components) delete item.components
      }
    }
    filterItem(list)
  }
  if (configList) getItemComponentList(configList)
  // 获取当前的指定类型组件
  let configComponent: CreateComponentType | null
  if (itemComponentList.length <= 1) {
    configComponent = itemComponentList[0]
  } else {
    configComponent = itemComponentList.find((block) => block.id === currentBlock?.id) ?? null
  }
  return configComponent
}
// 获取指定类型组件(列表)
export const getComponentListByType = (arr: CreateComponentType[], currentBlock: CreateComponentType | null, type: ComponentCategoryEnum | string): CreateComponentType[] | null => {
  // 获取所有的指定类型组件和组合组件
  const configList = arr.filter(x => x.category === type || x.category === ComponentCategoryEnum.COMBINATION || x.key === type)
  // 获取所有所有的指定类型组件
  const itemComponentList: CreateComponentType[] = []
  // 递归判断是组合组件还是普通组件
  const getItemComponentList = (list: CreateComponentType[]): void => {
    const filterItem = (list: CreateComponentType[]): void => {
      for (const item of list) {
        // 普通组件直接渲染
        if (item.category !== ComponentCategoryEnum.COMBINATION) {
          itemComponentList.push(item)
        }
        if (item.components)filterItem(item.components)
        if (!item.components) delete item.components
      }
    }
    filterItem(list)
  }
  if (configList) getItemComponentList(configList)
  // 获取当前的指定类型组件
  return itemComponentList.filter((block) => block.key === currentBlock?.key) ?? null
}
export const uniqueImgArray = (array: UploadFileInfo[]): UploadFileInfo[] => {
  const uniqueArray = array.reduce((acc: UploadFileInfo[], current: UploadFileInfo) => {
    // 检查当前元素的fullPath是否已经存在于累加器中
    const isDuplicate = acc.some(item => {
      return item.fullPath === current.fullPath
    })
    // 如果fullPath不存在于累加器中，则将当前元素添加到累加器中
    if (!isDuplicate) {
      acc.push(current)
    }
    return acc
  }, [])
  return uniqueArray
}
