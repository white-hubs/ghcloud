import { defineComponent, onMounted, ref } from 'vue'
import styles from './alarm-content.module.less'
import { getIotDeviceListByEvent } from '@/api/linkage'
import { getOperatorLogs } from '@/api/alarm'
import { RightOutlined } from '@ant-design/icons-vue'
import { AlarmInfo } from '../alarm-info/alarm-info'
import { AlarmFlow } from '../alarm-flow/alarm-flow'
import { NearbyEquipment } from '../nearby-equipment/nearby-equipment'

interface Props {
  alarmData: Record<string, unknown>;
}

/** 适用于报警详情弹窗的内容 */
export const AlarmContent = defineComponent({
  props: ['alarmData'],
  setup: (props: Props) => {
    const tabsList = ref(['报警详情'])
    const activeTabs = ref('报警详情')

    const getDeviceLinkageList = async (): Promise<void> => {
      const data = await getIotDeviceListByEvent({
        eventId: props.alarmData.businessKey,
      })
      if (data?.length) {
        tabsList.value.push('联动预案')
      }
    }
    const getFlowPath = async (): Promise<void> => {
      const data = await getOperatorLogs(props.alarmData.id)
      if (data.length) {
        tabsList.value.push('处理流程')
      }
    }
    const getNearbyEquipment = async (): Promise<void> => {
      // const data = await getOperatorLogs(props.alarmData.id)
      // if (data.length)
      tabsList.value.push('附近设备')
      // }
    }
    // const openPlan = (): void => {
    //   const { globalState } = useStateStore()
    //   eventInstance.emitEvent('removeAllEffect')
    //   globalState.business.alarmDetail = props.alarmData
    //   globalState.panel.visible = false
    //   globalState.panel.leftPanelName = 'floorEquipment'
    //   globalState.panel.rightPanelName = 'emergency-drill'
    //   globalState.panel.universalPanelVo.left = { items: '' }
    //   globalState.panel.universalPanelVo.right = { items: '' }
    //   closeAllModal()
    //   setTimeout(() => {
    //     globalState.panel.visible = true
    //   }, 500);
    // }
    onMounted(async () => {
      await getFlowPath()
      await getNearbyEquipment()
      // await getDeviceLinkageList()
    })

    return (): JSX.Element => (
      <div class={styles['alarmDetail-modal-content']}>
        <div class={styles['content-tabs']}>
          {
            tabsList.value.map(e => {
              return (
                <div
                  class={e === activeTabs.value ? styles.active : ''}
                  key={e}
                  onClick={() => {
                    activeTabs.value = e
                  }}
                >
                  <div>{e}</div>
                  <span><RightOutlined /></span>
                </div>
              )
            })
          }
          {/* <Button size='small' type='primary' class={styles['plan-btn']} onClick={openPlan}>预案</Button> */}
        </div>
        <div class={styles['content-body']}>
          {activeTabs.value === '报警详情' && <AlarmInfo alarmData={props.alarmData} />}
          {activeTabs.value === '处理流程' && <AlarmFlow alarmData={props.alarmData} />}
          {activeTabs.value === '附近设备' && <NearbyEquipment alarmData={props.alarmData} />}

          {/* {activeTabs.value === '联动预案' && <AlarmPlan alarmData={props.alarmData} />} */}
        </div>
      </div>
    )
  }
})
