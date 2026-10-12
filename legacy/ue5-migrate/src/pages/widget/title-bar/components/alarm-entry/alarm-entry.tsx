import { defineComponent, reactive, ref } from 'vue'
import styles from './alarm-entry.module.less'
import { Badge } from 'ant-design-vue'
import { getAssetsImage } from '@/utils/getImage'
import { recordStatus } from '@/api/alarm'
import { useStateStore } from '@/pages/state/use-state-store'
import { EventCore } from '@/pages/event/event-core'

export const AlarmEntry = defineComponent({
  setup () {
    const { globalState } = useStateStore()
    const count = ref(0)
    const storagePanel = reactive({
      leftPanel: '',
      rightPanel: ''
    })
    /** 获取报警数量 */
    const getAlarmCount = async (): Promise<void> => {
      const res = await recordStatus()
      count.value = res.alarmUnresolvedHandlerNum
    }
    EventCore.registerEvent('refreshAlarmBadge', getAlarmCount)
    EventCore.registerEvent('alarmPlaneUnmounted', () => {
      storagePanel.leftPanel = ''
      storagePanel.rightPanel = ''
    })
    getAlarmCount()

    function handleClick (): void {
      globalState.panel.visible = false

      if (storagePanel.leftPanel || storagePanel.rightPanel) {
        setTimeout(() => {
          globalState.panel.leftPanelName = storagePanel.leftPanel
          globalState.panel.rightPanelName = storagePanel.rightPanel
          storagePanel.leftPanel = ''
          storagePanel.rightPanel = ''
          globalState.panel.visible = true
        }, 500)
      } else {
        setTimeout(() => {
          storagePanel.leftPanel = globalState.panel.leftPanelName
          storagePanel.rightPanel = globalState.panel.rightPanelName
          globalState.panel.leftPanelName = null
          globalState.panel.rightPanelName = null
          globalState.panel.visible = true
          globalState.panel.rightPanelName = 'AlarmListPanel'
        }, 500)
      }
    }

    return (): JSX.Element => {
      return (
        <div class={styles.alarm} onClick={handleClick}>
          <Badge dot={count.value > 0}>
            <img src={getAssetsImage('alarm.png')} />
          </Badge>
        </div>
      )
    }
  }
})
