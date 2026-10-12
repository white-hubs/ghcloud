import { defineComponent, nextTick, ref, watch, type VNodeChild, h, type VNodeArrayChildren, type HTMLAttributes } from 'vue'
import { DropDown, type UploadFileInfo } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum, type InteractiveForm } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getActiveMenu, getComponentByType } from '@/utils'
import UeClient from '@/static/model/ue-client'
import styles from './dropdown.module.less'

export default defineComponent({
  name: 'dropdown',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    // 当前菜单的菜单项
    const navOption = ref<{ key: string;label: string;url?: string;icon?: VNodeArrayChildren; interactive: InteractiveForm[]; }[]>([])
    const getComp = (): void => {
      navOption.value = []
      const compList = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.DROPDOWN)?.components ?? []
      compList.forEach((item, index) => {
        const icon1 = (): VNodeChild => h('img', { src: `${item.config.icon.url}`, style: { width: '20px', height: '20px' } })
        const icon2 = (): VNodeChild => h('div', null)
        navOption.value[index] = { key: item.id, label: item.title, url: item.config.icon?.url, icon: item.config?.icon ? icon1 : icon2, interactive: item.interactive ?? [] }
      })
    }
    watch(() => chartEditStore.active.pageId, () => {
      getComp()
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        getComp()
      })
    }, { immediate: true, deep: true })
    const activeItem = ref({
      activeId: '',
      activeLabel: '',
      url: ''
    })
    // 点击菜单
    const handleSelect = (val: { key: string ;option: { interactive: InteractiveForm[];label: string;url: string; }; }): void => {
      activeItem.value.activeId = val.key
      activeItem.value.activeLabel = val.option.label
      activeItem.value.url = val.option.url
      // 交互
      val.option.interactive.forEach(interactive => {
      // 操作组件
        if (interactive.objectType === 'component' && interactive.action && interactive.target) {
          operateComponent(interactive)
        }
        // 操作模型
        if (interactive.objectType === 'UE5' && interactive.action) {
          operateUe5(interactive)
        }
        // 操作二维组态
        if (interactive.objectType === 'tdModel') {
          operateTd(interactive)
        }
      })
    }
    // 点击的不是子项才设置当前组件,不然会报错
    const handleCurrentBlock = (): void => {
      if (!activeItem.value.activeId) { chartEditStore.setTargetComp([props.item?.id]) }
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
        // 当前组件的图片列表
        const imgList = comp?.config.imgList as UploadFileInfo[]
        // 当前要展示的图片
        let curImg: UploadFileInfo | null = null
        imgList.forEach(x => {
          if (x.id === interactive.target) {
            curImg = x
          }
        })
        // 将当前图片的位置放置到第一个
        const index = imgList.findIndex(item => item.id === curImg?.id)
        if (index > -1 && curImg) {
          imgList.splice(index, 1)
          imgList.unshift(curImg)
        }
      }
    }
    // 操作模型
    const ueClient = UeClient.getInstance()
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
    const operateUe5 = async (interactive: InteractiveForm): Promise<void> => {
      let actorId = ''
      if (!Array.isArray(interactive.actorName)) actorId = await getActorId(interactive.actorName as string)
      switch (interactive.action ?? '') {
        // 聚焦
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
          tdComp.config.modelPath = interactive.directory
          tdComp.config.showModel = interactive.target
        }
      }
    }
    const nodeProps = (): HTMLAttributes => {
      return { style: { width: props.style.width } }
    }
    const menuProps = (): HTMLAttributes => {
      return { style: { width: '100%', background: 'rgba(0, 0, 0, 0.3)' } }
    }
    return () => (
      <div style={{ ...props.style, maxHeight: '500px', overflow: 'auto' }} onMousedown={handleCurrentBlock}>
        <DropDown size='large' node-props={nodeProps} menu-props={menuProps} v-model:value={activeItem.value.activeId} trigger='click' options={navOption.value} onSelect={handleSelect}>
          <div class={styles.dropdown} style={{ width: props.style.width }}>
            {activeItem.value.url ? <img src={activeItem.value.url} width='26' height='26' /> : null}
            {activeItem.value.activeLabel === '' ? props.item.title : activeItem.value.activeLabel}
          </div>
        </DropDown>
        <div />
      </div>
    )
  },
})
