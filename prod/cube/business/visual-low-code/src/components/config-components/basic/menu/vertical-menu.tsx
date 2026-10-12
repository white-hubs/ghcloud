import { defineComponent, nextTick, ref, watch } from 'vue'
import { Menu, Spin, type UploadFileInfo } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import type { CreateComponentType, InteractiveForm } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import styles from './vertical-menu.module.less'
import { getActiveMenu, parentArray, getComponentByType } from '@/utils'
import UeClient from '@/static/model/ue-client'
import _ from 'lodash'
export default defineComponent({
  name: 'model',
  props: ['style', 'item'],
  setup: (props) => {
    const loading = ref(false)
    const chartEditStore = useChartEditStore()
    // 当前菜单的菜单项
    const navOption = ref<CreateComponentType[] | null>()
    watch(() => chartEditStore.active.pageId, () => {
      navOption.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.VERTICALMENU)?.components ?? []
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        if (chartEditStore.getCurrentBlock?.id === props.item.id) {
          navOption.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.VERTICALMENU)?.components ?? []
        }
      })
    }, { immediate: true, deep: true })
    const activeId = ref<string>('')
    // 点击菜单
    const handleMenuItem = (val: CreateComponentType): void => {
      activeId.value = val.id
      // 跳转子菜单
      if (val.components && val.components?.length > 0 && navOption.value) {
        // 获取同级
        const friendOption = _.cloneDeep(parentArray(chartEditStore.getCurrentPageComponents, val.id))
        const newOption = _.cloneDeep(friendOption?.find(x => x.id === val.id)?.components)
        newOption?.push({
          category: ComponentCategoryEnum.VERTICALMENU,
          categoryName: '垂直菜单',
          id: '',
          key: 'back',
          title: '返回',
          level: 1,
          styles: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            show: true,
            zIndex: 100
          },
          parentId: val.id,
          components: []
        })
        navOption.value = newOption
        // 交互
        val.interactive?.forEach(interactive => {
          // 操作组件
          if (interactive.objectType === 'component' && interactive.action && interactive.target) {
            operateComponent(interactive)
          }
          // 操作模型
          if (interactive.objectType === 'UE5' && interactive.action) {
            operateUe5(interactive)
          }
          if (interactive.objectType === 'tdModel') {
            operateTd(interactive)
          }
        })
      } else if (val.key === 'back') {
        // 返回
        if (val.parentId) {
          // 获取返回的上级
          const parentComp = getActiveMenu(chartEditStore.getCurrentPageComponents, val.parentId)
          if (parentComp?.id) {
            // 获取上级的所有同级
            const newOption = _.cloneDeep(parentArray(props.item.components, parentComp?.id))
            const parentId = newOption?.[0].parentId ?? 0
            if (parentId !== 0) {
              newOption?.push({
                category: ComponentCategoryEnum.VERTICALMENU,
                categoryName: '垂直菜单',
                id: '',
                key: 'back',
                title: '返回',
                level: 1,
                styles: {
                  x: 0,
                  y: 0,
                  width: 100,
                  height: 100,
                  show: true,
                  zIndex: 100
                },
                parentId,
                components: []
              })
            }
            navOption.value = newOption
            // 交互
            parentComp.interactive?.forEach(interactive => {
              // 操作组件
              if (interactive.objectType === 'component' && interactive.action && interactive.target) {
                operateComponent(interactive)
              }
              // 操作模型
              if (interactive.objectType === 'UE5' && interactive.action) {
                operateUe5(interactive)
              }
              if (interactive.objectType === 'tdModel') {
                operateTd(interactive)
              }
            })
          }
        }
      } else {
        // 交互
        val.interactive?.forEach(interactive => {
          // 操作组件
          if (interactive.objectType === 'component' && interactive.action && interactive.target) {
            operateComponent(interactive)
          }
          // 操作模型
          if (interactive.objectType === 'UE5' && interactive.action) {
            operateUe5(interactive)
          }
          if (interactive.objectType === 'tdModel') {
            operateTd(interactive)
          }
        })
      }
    }
    // 点击的不是子项才设置当前组件,不然会报错
    const handleCurrentBlock = (): void => {
      if (!activeId.value) { chartEditStore.setTargetComp([props.item?.id]) }
    }
    // 操作组件的显示隐藏
    const operateComponent = (interactive: InteractiveForm): void => {
      const targetList = interactive.target as string[]
      if (interactive.action === 'hiddenComponent') {
        targetList.forEach(target => {
          const comp = getActiveMenu(chartEditStore.getCurrentPageComponents, target)
          if (comp)comp.styles.show = false
        })
      }
      if (interactive.action === 'showComponent') {
        targetList.forEach(target => {
          const comp = getActiveMenu(chartEditStore.getCurrentPageComponents, target)
          if (comp)comp.styles.show = true
        })
      }
      // 切换图片
      if (interactive.action === 'switchImage') {
        const curComp = interactive.imgComp as string
        const comp = getActiveMenu(chartEditStore.getCurrentPageComponents, curComp)
        const imgList = comp?.config.imgList as UploadFileInfo[]
        let curImg: UploadFileInfo | null = null
        imgList.forEach(x => {
          if (x.id === interactive.target) {
            curImg = x
          }
        })
        const index = imgList.findIndex(item => item.id === curImg?.id)
        if (index > -1 && curImg) {
          imgList.splice(index, 1)
          imgList.unshift(curImg)
        }
      }
    }
    // 操作模型
    const ueClient = UeClient.getInstance()
    const operateUe5 = async (interactive: InteractiveForm): Promise<void> => {
      let actorId = ''
      if (!Array.isArray(interactive.actorName)) actorId = await getActorId(interactive.actorName as string)
      switch (interactive.action ?? '') {
        case 'switchModel':
          ueClient.send('focusActor', { id: actorId })
          break
          // 切换视角
        case 'changeCamera':
          ueClient.send('setCameraView', interactive.cameraView)
          break
          // 添加标签
        case 'addTag':
          setTag(interactive, actorId, 'addTag')
          break
          // 隐藏标签
        case 'hiddenTag':
          setTag(interactive, actorId, 'hiddenTag')
          break
          // 模型透视
        case 'ModelPerspective':
          interactive.actorIds?.forEach(item => {
            ueClient.send('changePerspectivity', {
              id: item,
              translucent: interactive.opacity,
            })
          })
          break
        // 切换天气
        case 'switchWeather':
          ueClient.send('setWeather', { weather: interactive.target })
          break
      }
    }
    const setTag = (interactive: InteractiveForm, actorId: string, type: string): void => {
      if (interactive.labelType === 'textTag' && type === 'addTag') {
        ueClient.send('addTextPoi', {
          text: interactive.tag,
          color: 0,
          targetActorId: actorId,
          location: { x: 0, y: 0, z: 0 },
          cameraMin: 0,
          cameraMax: 50000,
          scale: 1,
          props: {}
        })
      } else {
        if (type === 'addTag') {
          ueClient.send('addIconPoi', {
            icon: interactive.tag,
            color: 0,
            targetActorId: actorId,
            location: { x: 0, y: 0, z: 0 },
            cameraMin: 0,
            cameraMax: 15000,
            scale: 1,
            props: {}
          })
        }
        if (type === 'hiddenTag') {
          ueClient.send('removeActorPoi', { targetActorId: actorId })
        }
      }
    }
    // 操作二维组态
    const operateTd = (interactive: InteractiveForm): void => {
      if (interactive.directory) {
        const tdComp = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.TDCONFIGURATION)
        if (tdComp) {
          tdComp.config.modelPath = interactive.directory; tdComp.config.showModel = interactive.target
        }
      }
    }
    interface NavMenuType {
      id: string; name: string; type: string; isActor: boolean;
    }
    // 获取actorId
    const getActorId = async (actorName: string): Promise<string> => {
      const menuNameList = actorName.split('_')
      return new Promise((resolve, reject) => {
        if (menuNameList.length === 1) {
          // 一级聚焦
          ueClient.send('getBuildingByName', { name: menuNameList[0] }, function (data: { actorId: string; }) {
            resolve(data.actorId)
            reject(data.actorId)
          })
        } else {
          // 二级聚焦
          ueClient.send('getBimtree', { id: '' }, function (children: NavMenuType[]) {
            // 获取对应的父层
            const fatherNav = children.find((x: { name: string; }) => x.name === menuNameList[0])
            // 根据父层的id获取子层
            ueClient.send('getBimtree', { id: fatherNav?.id }, function (child: NavMenuType[]) {
              // 当前子层
              const currentNav = child.find((x: { name: string; }) => x.name === menuNameList[1])
              resolve(currentNav?.id ?? '')
              reject(currentNav?.id ?? '')
            })
          })
        }
      })
    }
    return () => (
      <div style={{ ...props.style, maxHeight: '500px', overflow: 'auto' }} onMousedown={handleCurrentBlock}>
        <Spin style={{ maxHeight: '500px' }} show={loading.value}><Menu class={styles.menu} onUpdateValue={handleMenuItem} v-model:value={activeId.value} label-field='title' key-field='id' options={navOption.value} /></Spin>
      </div>
    )
  },
})
