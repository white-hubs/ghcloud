import { Descriptions, DescriptionsItem, Modal, PopOver, Table, message } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref } from 'vue'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { cubeOperatingRoomService } from '@/api/service'
import type { MedicalRuleTriggerDetailVO, TriggerNorm } from '@ghcloud/cube-operating-room-service'
import type { MsgRecordPageVO } from '@ghcloud/cube-message-center-service/src/types'

interface Props {
  labelWidth: string;
  id: string;
  tenant: string;
}
export const LimitInfoModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
    id: {
      type: String,
      default: ''
    },
    tenant: {
      type: String,
      default: ''
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const handleOk = debounce(async () => {
      modalVisible.value = false
      emit('enter')
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
    }
    const columns = [
      {
        title: '上报时间',
        dataIndex: 'uploadTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '设置范围',
        dataIndex: 'lowerLimit',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: TriggerNorm; }): JSX.Element => {
          const textVal = `${record.lowerLimit} - ${record.upperLimit}`
          return <PopOver content={textVal ?? '--'}>{textVal ?? '--'}</PopOver>
        }
      }
    ]
    const tableColumns = computed(() => {
      const columnList = dataSource.value.map((item) => {
        return {
          title: `${item.normName}${item.unit}`,
          dataIndex: `${item.normCode}`,
          ellipsis: true,
          width: 180,
          customRender: ({ record }: { record: TriggerNorm; }): JSX.Element=> {
            const value = record.normValue
            return <PopOver content={value ?? '--'}><span style={{ color: 'ff4d4f' }}>{value ?? '--'}</span></PopOver>
          }
        }
      })
      const uniqueDataList = Array.from(
        new Map([...columns, ...columnList].map(item => [item.dataIndex, item])).values()
      )
      return uniqueDataList
    })

    const loading = ref(false)
    const detail = ref<MedicalRuleTriggerDetailVO>()
    const dataSource = ref<TriggerNorm[]>([])

    const getTableData = async (id: string | number, messageId: string): Promise<void> => {
      try {
        loading.value = true
        dataSource.value = []
        detail.value = undefined
        const res = await cubeOperatingRoomService.getMedicalRuleTriggerDetail(`${id}`, messageId)
        if (res) {
          detail.value = res
          dataSource.value = res.norms ?? []
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    const msgRecord = ref<MsgRecordPageVO>()
    const openModal = async (row?: MsgRecordPageVO): Promise<void> => {
      if (row?.businessId) {
        getTableData(row.businessId, `${row?.id}`)
      }
      msgRecord.value = row
      modalVisible.value = true
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='消息详情'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='800px'
        >
          <Descriptions title={msgRecord.value?.msgContent}>
            <DescriptionsItem label='消息来源'>{msgRecord.value?.sourceTenantName || '--'}</DescriptionsItem>
            <DescriptionsItem label='所属部门'>{detail.value?.departName ?? '--'}</DescriptionsItem>
            <DescriptionsItem label='手术室'>{detail.value?.deviceName ?? '--'}</DescriptionsItem>
          </Descriptions>
          <Table columns={tableColumns.value} loading={loading.value} dataSource={dataSource.value} pagination size='small' scrollY={300} />
        </Modal>
      </>
  }
})
