import { cubeDeviceSuperviseService } from '@/api/service'
import { Button, Table, message } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import { defineComponent, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  id: string;
  businessKey: string;
}
/** 设备报警详情-联动动作 */
export const TabPaneLinkAction = defineComponent({
  props: ['id', 'businessKey'],
  setup: (props: Props) => {
    const { tenant } = useRoute().query as { tenant: string; }

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
    const logColumns = [
      {
        title: '执行时间',
        dataIndex: 'executeTime',
        key: 'executeTime',
        slots: {
          customRender: 'executeTime',
        },
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
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
        await cubeDeviceSuperviseService.manualControlIotDevice({ eventIotDeviceId: record.id, tenant })
        message.success('下发指令成功')
      } catch {
      }
    }
    const getLogList = async (): Promise<void> => {
      const result = await cubeDeviceSuperviseService.getIotDeviceProRecords(props.id, tenant)
      const data = result as { deviceId: string; }[]
      state.logList = data
      state.logList = data
    }
    const getDeviceLinkageList = async (): Promise<void> => {
      const result = await cubeDeviceSuperviseService.getIotDeviceListByEvent(props.id, tenant)
      const data = result as { deviceId: string; }[]
      state.linkageList = data
    }
    onMounted(async () => {
      try {
        state.loading = true
        await getLogList()
        await getDeviceLinkageList()
      } catch {
      } finally {
        state.loading = false
      }
    })

    return (): JSX.Element =>
      <>
        <VerticalLine title='设备联动' style='margin: 0 0 10px' />

        <Table
          dataSource={state.linkageList}
          columns={deviceColumns}
          pagination={false}
          size='small'
          loading={state.loading}
          scrollY={500}
        />
        <VerticalLine title='联动日志' style='margin: 15px 0 10px' />
        <Table
          dataSource={state.logList}
          columns={logColumns}
          pagination={false}
          size='small'
          loading={state.loading}
          scrollY={500}
        />
      </>
  }
})
