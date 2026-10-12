import { defineComponent, onMounted, reactive, type PropType } from 'vue'
import { Card } from '../custom-card'
import styles from './index.module.less'
import type { AlarmDetails, LinkageDevice, LinkageExecuteRecord } from '@ghcloud/cube-alarm-center-service'
import { cubeLinkageService } from '../../../../../api/server'
import { Empty, showNotify } from 'vant'
import dayjs from 'dayjs'
import 'vant/es/notify/style'
enum ExecuteTypeMode {
  AUTOMATIC = '自动',
  MANUAL = '手动'
}
export const LinkageAction = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {}
    }
  },
  setup: (props) => {
    const state = reactive<{
      linkageAction: LinkageDevice[];
      linkageRecord: LinkageExecuteRecord[];
    }>({
      linkageAction: [],
      linkageRecord: []
    })
    const getLinkageActionDevice = async (): Promise<void> => {
      const result = await cubeLinkageService.getLinkageDevicesAction({ eventId: props.details.businessKey })
      state.linkageAction = result
    }
    const getLinkageRecord = async (): Promise<void> => {
      const result = await cubeLinkageService.getLinkageDeviceRecords({ eventId: props.details.businessKey })
      state.linkageRecord = result
    }
    const handleExecute = async (id: string): Promise<void> => {
      try {
        await cubeLinkageService.updateExecuteOrder({ eventIotDeviceId: id })
        await getLinkageRecord()
        showNotify({
          type: 'success',
          message: '执行成功'
        })
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    onMounted(() => {
      getLinkageActionDevice()
      getLinkageRecord()
    })
    return (): JSX.Element => (
      <>
        <Card title='联动动作'>
          <div class={styles.deviceLinkage}>
            {
              state.linkageAction.length > 0 && state.linkageAction.map((item) => {
                return (
                  <div class={styles.deviceLinkageItem} key={item.id}>
                    <div class={styles.deviceInfo}>
                      <div class={styles.deviceNameTriggerMode}>
                        <div class={styles.deviceName}>{item.deviceName}</div>
                        <div class={styles.tiggerMode}>{ExecuteTypeMode[item.executeMode as keyof typeof ExecuteTypeMode]}</div>
                      </div>
                      <div class={styles.attr}>
                        <span class={styles.attrName}>{item.propName}：</span>
                        <span>{item.translatedValue}</span>
                      </div>
                    </div>
                    {item.executeMode === 'MANUAL' && <div class={styles.deviceAction} onClick={() => {
                      handleExecute(item.id)
                    }}>执行</div>}
                  </div>
                )
              })
            }
            {state.linkageAction.length === 0 && <Empty description='暂无联动动作' />}

          </div>
        </Card>
        <Card title='联动日志'>
          {state.linkageRecord.length > 0 && state.linkageRecord.map(item => {
            return (
              <div class={styles.linkageLog} key={item.id}>
                <div class={styles.logItem}>
                  <div class={styles.logItemTitle}>
                    <div class={styles.time}>{item.executeTime ? dayjs(item.executeTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                    {/* <div class={styles.action}>查看&nbsp;&gt;</div> */}
                  </div>
                  <div class={styles.deviceInfo}>
                    <div class={styles.deviceNameStatus}>
                      <div class={styles.deviceName}>{item.deviceName}</div>
                      <div class={styles.status}>成功</div>
                    </div>
                    <div class={styles.attr}>
                      <span class={styles.person}>{item.operatorName}</span>
                      <span class={styles.attrName}>{item.propName}：</span>
                      <span>{item.translatedValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {
            state.linkageRecord.length === 0 && <Empty description='暂无联动日志' />
          }
        </Card>
      </>

    )
  }
})
