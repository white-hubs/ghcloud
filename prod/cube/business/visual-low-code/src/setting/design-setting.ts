import { type CreateComponentType, ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { createUuid } from '@/utils'
// 预览展示
export enum PreviewScaleEnum {
  FIT = 'fit',
  FULL = 'full'
}
// 初始化头部
export const titleInitConfig: CreateComponentType = {
  id: createUuid(),
  category: ComponentCategoryEnum.TITLE,
  categoryName: '标题栏',
  key: 'title-comp',
  title: '标题栏',
  components: [],
  attr: {
    isShareData: false
  },
  styles: {
    x: 0,
    y: 0,
    width: 200,
    height: 50,
    show: true,
    zIndex: 100
  }
}
// 初始化菜单面板
export const menuBarInitConfig: CreateComponentType = {
  id: createUuid(),
  category: ComponentCategoryEnum.MENU_BAR,
  categoryName: '菜单',
  key: 'menu-bar',
  title: '菜单',
  components: [
    {
      id: createUuid(),
      category: ComponentCategoryEnum.MENU_BAR,
      categoryName: '菜单',
      key: 'menu-item',
      title: '菜单1',
      interactive: [{ target: '', id: '' }],
      components: [],
      styles: {
        x: 0,
        y: 0,
        width: 500,
        height: 300,
        show: true,
        zIndex: 100
      }
    },
    {
      id: createUuid(),
      category: ComponentCategoryEnum.MENU_BAR,
      categoryName: '菜单',
      key: 'menu-item',
      title: '菜单2',
      interactive: [{ target: '', id: '' }],
      components: [],
      styles: {
        x: 0,
        y: 0,
        width: 500,
        height: 300,
        show: true,
        zIndex: 100
      }
    }
  ],
  attr: {
    isShareData: false
  },
  styles: {
    x: 0,
    y: 0,
    width: 300,
    show: true,
    height: 50,
    zIndex: 100
  }
}
// 预览展示方式
export const previewScaleType: PreviewScaleEnum = PreviewScaleEnum.FIT
// 工作区域历史记录存储最大数量
export const editHistoryMax = 100
// 拖拽时蒙层的 z-index，需比所有图表高
export const canvasModelIndex = 9999
// 框选时蒙层的 z-index，需比所有图表高
export const selectBoxIndex = canvasModelIndex + 10
