import {
  defineComponent,
  reactive,
  onMounted,
  computed,
} from 'vue'
import moment from 'moment'
import { getDeviceInfo } from '@/api/equipment'
import {
  getIotDeviceListByEvent,
  manualControlIotDevice,
  getIotDeviceProRecords,
} from '@/api/linkage'
import styles from './alarm-plan.module.less'
import { message } from 'ant-design-vue'

export const AlarmPlan = defineComponent({
  props: {
    alarmData: {
      type: Object,
      default: {},
    }
  },
  setup (props) {
    const actionResult = {
      ARRIVAL: '下发成功',
      ISSUING: '下发中',
      SUCCESS: '执行成功',
      FAIL: '执行失败',
      EXPIRED: '执行超时',
    }

    const state = reactive({
      linkageData: [],
      recordData: [],
      deviceInfoList: [],
    })

    const translateAttr = computed(() => (deviceId, propCode, propValue) => {
      const deviceInfo = state.deviceInfoList.find((e) => e.detail.id === deviceId)
      if (deviceInfo) {
        const attributeKeyValueVos =
          deviceInfo.deviceAttributes.find((e) => e.attributeCode === propCode)?.attributeKeyValueVos ?? []
        return attributeKeyValueVos.find((e) => e.value === propValue)?.keyName || propValue
      }
      return propValue
    })

    const getDeviceLinkageList = async (): Promise<void> => {
      const data = await getIotDeviceListByEvent({
        eventId: props.alarmData.businessKey,
      })
      if (data) {
        state.linkageData = data
        data.forEach((e) => {
          getDeviceInfo(e.deviceId).then((res) => {
            state.deviceInfoList.push(res)
          })
        })
      }
    }

    const implement = async (record): Promise<void> => {
      const data = await manualControlIotDevice({
        eventIotDeviceId: record.id,
      })
      if (data) {
        message.success('下发指令成功！')
      }
    }

    const getDeviceLinkageRecord = async (): Promise<void> => {
      const data = await getIotDeviceProRecords({
        eventId: props.alarmData.businessKey,
      })
      if (data) {
        state.recordData = data
      }
    }

    onMounted(() => {
      getDeviceLinkageList()
      getDeviceLinkageRecord()
    })

    return (
      <div class={styles.alarmDetailPlan}>
        <div class={styles.planTable}>
          <div class={styles.title}>设备联动</div>
          <div class={styles.tableContainer}>
            <div class={styles.tableHeader}>
              <div>设备名称</div>
              <div>设备属性</div>
              <div>执行动作</div>
              <div>执行时机</div>
              <div>操作</div>
            </div>
            <div class={styles.tableBody}>
              {state.linkageData.map((item) => (
                <div class={styles.tableBodyItem} key={item.id}>
                  <div>{item.deviceName}</div>
                  <div>{item.propName}</div>
                  <div>{translateAttr.value(item.deviceId, item.propCode, item.propValue)}</div>
                  <div>{item.executeMode === 'AUTOMATIC' ? '自动' : '手动'}</div>
                  <div>
                    <a-button type='link' onClick={() => { implement(item) }}>执行</a-button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div class={styles.planTable}>
          <div class={styles.title}>联动日志</div>
          <div class={styles.tableContainer}>
            <div class={styles.tableHeader}>
              <div>执行时间</div>
              <div>触发人员</div>
              <div>设备名称</div>
              <div>设备属性</div>
              <div>执行动作</div>
              <div>执行结果</div>
            </div>
            <div class={styles.tableBody}>
              {state.recordData.map((item) => (
                <div class={styles.tableBodyItem} key={item.id}>
                  <div>{moment(item.executeTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                  <div>{item.operatorName}</div>
                  <div>{item.deviceName}</div>
                  <div>{item.propName}</div>
                  <div>{translateAttr.value(item.deviceId, item.propCode, item.propValue)}</div>
                  <div
                    style={{
                      color:
                        item.executeStatus === 'SUCCESS'
                          ? '#1EC138'
                          : item.executeStatus === 'FAIL'
                            ? '#FF3D3D'
                            : '#FF9737',
                    }}
                  >
                    {actionResult[item.executeStatus]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
