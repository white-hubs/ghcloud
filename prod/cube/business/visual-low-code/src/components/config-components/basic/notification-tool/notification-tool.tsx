import { defineComponent, nextTick, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { type CreateComponentType, ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import { Badge, Icon, NotificationsOutline } from '@ghcloud/visual-view-ui'
import AlarmListPanel from '@/views/editor-config/components/alarm-panel/alarm-list-panel'
import { getAlarmMsgUnConfirmedCount } from '@/apis/business/alarm'
export default defineComponent({
  name: 'Title',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const notToolComponent = ref<CreateComponentType | null>()
    const switchList = ref<string[]>([])
    const notiNum = ref(2)
    const isFull = ref(false)
    const isShowMenu = ref(true)
    const isShowPanel = ref(false)
    const getSwitchList = async (): Promise<void> => {
      notToolComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.NOTIFICATIONTOOL)
      switchList.value = notToolComponent.value?.config.checkedSwitch
      const res = await getAlarmMsgUnConfirmedCount()
      notiNum.value = res.data ?? 0
    }
    watch(() => chartEditStore.active.pageId, () => {
      getSwitchList()
    }, { immediate: true, deep: true })
    let operateMenuComp: CreateComponentType[] = ([])
    let operatePanelComp: CreateComponentType[] = ([])
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        getSwitchList()
      })
    }, { immediate: true, deep: true })
    const hidden = (comp: CreateComponentType, arr: ComponentCategoryEnum[]): boolean => {
      return arr.some(x => x === comp.category)
    }
    const filterShow = (compList: CreateComponentType[], arr: ComponentCategoryEnum[], isShow: boolean): void => {
      if (isShowMenu.value) operateMenuComp = []
      if (!isShowPanel.value) operatePanelComp = []
      compList.forEach(comp => {
        if (comp.category === ComponentCategoryEnum.COMBINATION && comp?.components) {
          filterShow(comp.components, arr, isShow)
        } else {
          if (hidden(comp, arr) && isShow) {
            comp.styles.show = false
            operateMenuComp.push(comp)
          }
          if (hidden(comp, arr) && !isShow) {
            comp.styles.show = true
          }
        }
      })
    }
    // 显示/隐藏面板
    const handleMenu = (): void => {
      if (isShowMenu.value)operateMenuComp = chartEditStore.getCurrentPageComponents.filter(x => x.styles.show)
      filterShow(operateMenuComp, [ComponentCategoryEnum.MENU_BAR, ComponentCategoryEnum.CHART], isShowMenu.value)
      isShowMenu.value = !isShowMenu.value
    }
    // 切换全屏
    const handleScreen = (): void => {
      const el = document.documentElement
      if (isFull.value && document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen()
      }
      if (!isFull.value) { el.requestFullscreen() }
      isFull.value = !isFull.value
    }
    // 点击通知
    const handleNotification = (): void => {
      isShowPanel.value = !isShowPanel.value
      if (isShowPanel.value)operatePanelComp = chartEditStore.getCurrentPageComponents.filter(x => x.styles.show)
      filterShow(operatePanelComp, [ComponentCategoryEnum.CHART], isShowPanel.value)
    }
    return () => (
      <div style={{ ...props.style, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        <div v-show={switchList.value.some(x => x === 'screenSwitch')} onClick={handleScreen}>
          <span v-show={!isFull.value}>全屏</span>
          <span v-show={isFull.value}>退出全屏</span>
        </div>
        <div v-show={switchList.value.some(x => x === 'menuSwitch')} onClick={handleMenu}>
          <span v-show={!isShowMenu.value}>显示菜单</span>
          <span v-show={isShowMenu.value}>隐藏菜单</span>
        </div>
        <div v-show={switchList.value.some(x => x === 'notiSwitch')} onClick={handleNotification}><Badge value={notiNum.value}><Icon size='18'><NotificationsOutline /></Icon></Badge></div>
        <AlarmListPanel isShowPanel={isShowPanel.value} />
      </div>
    )
  },
})
