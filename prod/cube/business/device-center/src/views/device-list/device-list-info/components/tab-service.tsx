import { getMethodTypeLabel } from '@/constants/method-type'
import { cubeDeviceCenterService } from '@/api/service'
import { CommandHistoryModal } from './command-history-modal'
import { CommandIssueModal } from './command-issue-modal'
import { Button, PopOver, Table, Tag } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'

interface DeviceServiceRow {
  methodCode: string;
  name: string;
  methodType: string;
  description: string;
  status: number | null;
  inputParams?: { params?: any[] } | null;
}

interface ProductMethodRow {
  methodCode?: string;
  name?: string;
  methodType?: string;
  description?: string;
  status?: number | null;
  inputParams?: { params?: any[] } | null;
}

export const TabService = defineComponent({
  props: {
    deviceId: {
      type: String,
      default: ''
    },
    prodId: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const loading = ref(false)
    const dataSource = ref<DeviceServiceRow[]>([])
    const commandHistoryModalRef = ref<{ openModal: (options?: { targetIdentifier?: string }) => void }>()
    const commandIssueModalRef = ref<{ openModal: (method: any) => void }>()

    const renderText = (value?: string): JSX.Element => {
      const text = value || '--'
      return <PopOver content={text}>{text}</PopOver>
    }

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        if (!props.prodId) {
          dataSource.value = []
          return
        }
        const res = await cubeDeviceCenterService.getProductMethod(props.prodId)
        const services = Array.isArray(res) ? res as ProductMethodRow[] : []
        dataSource.value = services.map((service) => {
          return {
            methodCode: service.methodCode || '',
            name: service.name || '',
            methodType: service.methodType || '',
            description: service.description || '',
            status: service.status ?? null,
            inputParams: service.inputParams ?? null
          }
        })
      } catch (_ignore) {
        dataSource.value = []
      } finally {
        loading.value = false
      }
    }

    const columns = [
      {
        title: '服务标识符',
        dataIndex: 'methodCode',
        ellipsis: true,
        width: 220,
        customRender: ({ text }: { text: string; }): JSX.Element => renderText(text)
      },
      {
        title: '服务名',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => renderText(text)
      },
      {
        title: '方法类型',
        dataIndex: 'methodType',
        ellipsis: true,
        width: 140,
        customRender: ({ text }: { text: string; }): JSX.Element => renderText(getMethodTypeLabel(text))
      },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => renderText(text)
      },
      {
        title: '启用状态',
        dataIndex: 'status',
        ellipsis: true,
        width: 120,
        align: 'center',
        customRender: ({ text }: { text: number | null; }): JSX.Element => {
          if (text === null) {
            return renderText()
          }
          return <Tag color={text === 1 ? 'green' : 'default'}>{text === 1 ? '启用' : '禁用'}</Tag>
        }
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 180,
        fixed: 'right',
        customRender: ({ record }: { record: DeviceServiceRow }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                size='small'
                onClick={() => {
                  commandHistoryModalRef.value?.openModal({
                    targetIdentifier: record.methodCode
                  })
                }}
              >
                操作记录
              </Button>
              <Button
                type='link'
                size='small'
                onClick={() => {
                  commandIssueModalRef.value?.openModal({
                    methodCode: record.methodCode,
                    name: record.name,
                    methodType: record.methodType,
                    inputParams: record.inputParams,
                    prodId: props.prodId
                  })
                }}
              >
                指令下发
              </Button>
            </>
          )
        }
      }
    ]

    onMounted(() => {
      getTableData()
    })

    return (): JSX.Element => (
      <>
        <Table
          rowKey={(record: DeviceServiceRow, index?: number): string => record.methodCode || `${record.name}-${index || 0}`}
          columns={columns}
          loading={loading.value}
          dataSource={dataSource.value}
          pagination={false}
          scrollY={500}
        />
        <CommandHistoryModal ref={commandHistoryModalRef} />
        <CommandIssueModal ref={commandIssueModalRef} deviceId={props.deviceId} />
      </>
    )
  }
})
