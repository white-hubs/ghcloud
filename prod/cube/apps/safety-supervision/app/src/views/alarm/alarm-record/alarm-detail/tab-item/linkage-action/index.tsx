import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { Button, Table, message } from '@ghcloud/cube-ui'
import moment from 'moment'
import { getIotDeviceProRecords, getIotDeviceListByEvent, getDeviceInfo, executeControlIotDevice } from '@/api/alarm'
import { useRoute } from 'vue-router'

interface Props {
  marketInfo: Record<string, string>;
}
export const LinkageAction = defineComponent({
  props: {
    marketInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  setup: (props: Props) => {
    const route = useRoute()
    const isMarket = route.query.fromPage === 'market'
    const state = reactive<{ deviceInfoList: Record<string, unknown>[];linkagedeviceInfoList: Record<string, unknown>[];linkageList: Record<string, unknown>[];loading: boolean;logList: Record<string, unknown>[]; }>({
      deviceInfoList: [],
      linkagedeviceInfoList: [],
      logList: [],
      linkageList: [],
      loading: false,
    })
    // 属性转换
    const translateAttr = (deviceId: string, propCode: string, propValue: string): string => {
      const deviceInfo = state.deviceInfoList.find((e) => (e.detail as { id: string; }).id === deviceId)
      if (deviceInfo) {
        const attributeKeyValue =
          (deviceInfo.deviceAttributes as { attributeCode: string;attributeKeyValueVos: Record<string, string>[]; }[]).find((e) => e.attributeCode === propCode)
        if (!attributeKeyValue) return ''
        const attributeKeyValueVos = attributeKeyValue.attributeKeyValueVos ?? []
        const findVos = attributeKeyValueVos.find((e) => e.value === propValue)
        return findVos ? findVos.keyName : propValue
      }
      return propValue
    }
    const linkageTranslateAttr = (deviceId: string, propCode: string, propValue: string): string => {
      const deviceInfo = state.linkagedeviceInfoList.find((e) => (e.detail as { id: string; }).id === deviceId)
      if (deviceInfo) {
        const attributeKeyValue =
          (deviceInfo.deviceAttributes as { attributeCode: string;attributeKeyValueVos: Record<string, string>[]; }[]).find((e) => e.attributeCode === propCode)
        if (!attributeKeyValue) return ''
        const attributeKeyValueVos = attributeKeyValue.attributeKeyValueVos ?? []
        const findVos = attributeKeyValueVos.find((e) => e.value === propValue)
        return findVos ? findVos.keyName : propValue
      }
      return propValue
    }
    const actionResult = [
      {
        value: 'ARRIVAL',
        label: '下发成功',
      },
      {
        value: 'ISSUING',
        label: '下发中',
      },
      {
        value: 'SUCCESS',
        label: '执行成功',
      },
      {
        value: 'FAIL',
        label: '执行失败',
      },
      {
        value: 'EXPIRED',
        label: '执行超时',
      },
    ]
    const deviceColumns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
      {
        title: '设备属性',
        dataIndex: 'propName',
        key: 'propName',
      },
      {
        title: '执行动作',
        dataIndex: 'propValue',
        key: 'propValue',
        customRender: ({ record }: { record: Record<string, string>; }): string => {
          return linkageTranslateAttr(record.deviceId, record.propCode, record.propValue)
        },
      },
      {
        title: '执行时机',
        dataIndex: 'executeMode',
        key: 'executeMode',
        customRender: ({ text }: { text: string; }): string => {
          return text === 'AUTOMATIC' ? '自动' : '手动'
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element=> {
          return <Button type='link' onClick={async () => handleExecute(record)}>执行</Button>
        }
      },
    ]
    const marketDeviceColumns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
      {
        title: '设备属性',
        dataIndex: 'propName',
        key: 'propName',
      },
      {
        title: '执行动作',
        dataIndex: 'propValue',
        key: 'propValue',
        customRender: ({ record }: { record: Record<string, string>; }): string=> {
          return linkageTranslateAttr(record.deviceId, record.propCode, record.propValue)
        },
      },
      {
        title: '执行时机',
        dataIndex: 'executeMode',
        key: 'executeMode',
        customRender: ({ text }: { text: string; }): string => {
          return text === 'AUTOMATIC' ? '自动' : '手动'
        },
      },
    ]
    const logColumns = [
      {
        title: '执行时间',
        dataIndex: 'executeTime',
        key: 'executeTime',
        slots: {
          customRender: 'executeTime',
        },
        customRender: ({ text }: { text: number; }): string=> {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        },
      },
      {
        title: '触发人',
        dataIndex: 'operatorName',
        key: 'operatorName',
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
      {
        title: '设备属性',
        dataIndex: 'propName',
        key: 'propName',
      },
      {
        title: '执行动作',
        dataIndex: 'propValue',
        key: 'propValue',
        customRender: ({ record }: { record: Record<string, string>; }): string=> {
          return translateAttr(record.deviceId, record.propCode, record.propValue)
        },
      },
      {
        title: '执行结果',
        dataIndex: 'executeStatus',
        key: 'executeStatus',
        slots: {
          customRender: 'executeStatus',
        },
        customRender: ({ text }: { text: string; }): string => {
          const data = actionResult.find(item => item.value === text)
          if (data) {
            return data.label
          } else {
            return '--'
          }
        },
      },
    ]
    const handleExecute = async (record: Record<string, string>): Promise<void> => {
      try {
        const param = {
          eventIotDeviceId: record.id,
          url: props.marketInfo.url,
          tenant: props.marketInfo.tenant,
          token: props.marketInfo.token
        }
        await executeControlIotDevice(param)
        await getDeviceLinkageList()
        message.success('下发指令成功')
      } catch {
      }
    }
    const getLogList = async (): Promise<void> => {
      const result = await getIotDeviceProRecords({
        eventId: route.query.businessKey as string,
        url: props.marketInfo.url,
        tenant: props.marketInfo.tenant,
        token: props.marketInfo.token
      })
      const data = result.data as { deviceId: string; }[]
      state.logList = data
      if (data.length) {
        // for (const item of data) {
          
        //   const { data } = await getDeviceInfo({
        //     id: item.deviceId,
        //     url: props.marketInfo.url,
        //     tenant: props.marketInfo.tenant,
        //     token: props.marketInfo.token
        //   })
        //   state.deviceInfoList = [...state.linkagedeviceInfoList, data]
        // }
        state.deviceInfoList = [...state.linkagedeviceInfoList]
      }
      state.logList = data
    }
    const getDeviceLinkageList = async (): Promise<void> => {
      const result = await getIotDeviceListByEvent({
        eventId: route.query.businessKey as string,
        url: props.marketInfo.url,
        tenant: props.marketInfo.tenant,
        token: props.marketInfo.token
      })
      const data = result.data as { deviceId: string; }[]
      state.linkageList = data
      if (data.length) {
        // for (const item of data) {
        //   const { data } = await getDeviceInfo({
        //     id: item.deviceId,
        //     url: props.marketInfo.url,
        //     tenant: props.marketInfo.tenant,
        //     token: props.marketInfo.token
        //   })
        //   state.linkagedeviceInfoList = [...state.linkagedeviceInfoList, data]
        // }
        state.linkagedeviceInfoList = [...state.linkagedeviceInfoList]
      }
    }

    onMounted(async () => {
      getDeviceLinkageList()
      getLogList()
    })
    return (): JSX.Element=> (
      <>
        <div class={styles['linkage-action']}>
          <div class={styles.title}>设备联动</div>
          <Table
            dataSource={state.linkageList}
            columns={isMarket ? marketDeviceColumns : deviceColumns}
            pagination={false}
            size='small'
            loading={state.loading}
            scrollY={500}
          />
          <div class={styles.title} style={{ marginTop: '16px' }}>联动日志</div>
          <Table
            dataSource={state.logList}
            columns={logColumns}
            pagination={false}
            size='small'
            loading={state.loading}
            scrollY={500}
          />
        </div>

      </>
    )
  }
})
