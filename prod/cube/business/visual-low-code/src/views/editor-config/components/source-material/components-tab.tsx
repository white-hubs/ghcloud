import { defineComponent, ref } from 'vue'
import { ChartGlobalImage } from '../chart-global-image'
import { createUuid } from '@/utils'
import './tab.less'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { Input, Icon, Search } from '@ghcloud/visual-view-ui'
import { useMenuDragger } from '@/packages/use-resource-dragger'

import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
export const CmoponentsTab = defineComponent({
  setup: () => {
    /**
     * 初始化配置
     */
    const initOptions: CreateComponentType[] = [
      {
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
          width: 1960,
          height: 50,
          show: true,
          zIndex: 100
        }
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.MENU_BAR,
        categoryName: '菜单',
        key: 'menu-bar',
        title: '水平菜单',
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
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.VERTICALMENU,
        categoryName: '垂直菜单',
        key: 'vertical-menu',
        title: '垂直菜单',
        components: [
          {
            category: ComponentCategoryEnum.VERTICALMENU,
            categoryName: '垂直菜单',
            id: createUuid(),
            key: 'nav-item',
            title: '导航一',
            level: 1,
            interactive: [],
            styles: {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              show: true,
              zIndex: 100
            },
            parentId: 0,
            components: []
          },
          {
            category: ComponentCategoryEnum.VERTICALMENU,
            categoryName: '垂直菜单',
            id: createUuid(),
            key: 'nav-item',
            title: '导航二',
            level: 1,
            interactive: [],
            styles: {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              show: true,
              zIndex: 100
            },
            parentId: 0,
            components: []
          }
        ],
        attr: {
          isShareData: false
        },
        styles: {
          x: 0,
          y: 0,
          height: 400,
          width: 120,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.DROPDOWN,
        categoryName: '下拉菜单',
        key: 'dropdown',
        title: '下拉菜单',
        components: [
          {
            category: ComponentCategoryEnum.DROPDOWN,
            categoryName: '下拉菜单',
            id: createUuid(),
            key: 'nav-item',
            title: '选项一',
            interactive: [],
            config: { icon: null },
            styles: {
              x: 0,
              y: 0,
              width: 200,
              height: 100,
              show: true,
              zIndex: 100
            },
          },
          {
            category: ComponentCategoryEnum.DROPDOWN,
            categoryName: '下拉菜单',
            id: createUuid(),
            key: 'nav-item',
            title: '选项二',
            interactive: [],
            config: { icon: null },
            styles: {
              x: 0,
              y: 0,
              width: 200,
              height: 100,
              show: true,
              zIndex: 100
            },
          }
        ],
        attr: {
          isShareData: false
        },
        styles: {
          x: 0,
          y: 0,
          height: 50,
          width: 100,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.IMAGE,
        categoryName: '图片',
        key: 'image-comp',
        title: '图片',
        components: [],
        config: {
          imgList: [],
          rotationSettings: false,
          rotationTime: 1
        },
        attr: {
          isShareData: false
        },
        styles: {
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          show: true,
          zIndex: 100
        }
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.DATE,
        categoryName: '日期',
        key: 'date-comp',
        title: '日期',
        config: {
          dateFormat: 'YYYY-MM-DD',
        },
        attr: {
          isShareData: false
        },
        styles: {
          x: 0,
          y: 0,
          width: 240,
          height: 40,
          show: true,
          zIndex: 100
        }
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.NOTIFICATIONTOOL,
        categoryName: '通知工具',
        key: 'notification-tool',
        title: '通知工具',
        config: {
          checkedSwitch: ['screenSwitch', 'menuSwitch', 'notiSwitch']
        },
        attr: {
          isShareData: false
        },
        styles: {
          x: 0,
          y: 0,
          width: 200,
          height: 40,
          show: true,
          zIndex: 100
        }
      },
    ]
    const options = ref<CreateComponentType[]>(initOptions)
    const { dragstart, dragend } = useMenuDragger()
    const searchInputSlot = {
      prefix: () => <Icon><Search /></Icon>
    }
    const handleInputChange = (val: string): void => {
      options.value = initOptions.filter(item => item.title.includes(val))
    }
    return () => (
      <>
        <Input v-slots={searchInputSlot} onInput={handleInputChange} />
        <div class='options_container'>
          {options.value.map((item: CreateComponentType) => {
            return (
              <div class='item_container' key={item.key} draggable onDragstart={($event) => { dragstart($event, item) }} onDragend={() => { dragend() }}>
                <ChartGlobalImage chartConfig={item} />
                <div class='text_center'>{item.title}</div>
              </div>
            )
          })}
        </div>
      </>
    )
  },
})
