import { defineComponent, onMounted, reactive, ref, type PropType } from 'vue'
import { Button, Form, FormItem, Input, Page, PopOver, QuestionCircleOutlined, Table } from '@ghcloud/cube-ui'
import { CLayout } from '@/components/clayout/clayout'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { GatewayTree } from '@/components/tree'
import { aggregationListThinPage } from '@/api/device'
interface TableData {
  devNum: string;

  groupId: string;
  groupName: string;

  refCTLIDS: string;

  refCTLList: {
    id: string;
    name: string;
  }[];
  relGroupInfo: null | string;
  varCount: number;
}
export const DeviceModel = defineComponent({
  props: {
    channelId: {
      type: Number,
      default: 3
    },
    deviceName: {
      type: String,
      default: ''
    },
    association: {
      type: Object as PropType<TableData>,
      default: () => ([])
    }
  },
  setup: (props, context) => {
    const gatewayCode = ref<number>(0)
    const selectedRowKeysData = ref<string[]>([])
    const deviceTable = reactive<{ selectedRowKeys: string[]; columns: ColumnType[]; tableData: TableData[]; loading: boolean; }>({
      selectedRowKeys: [],
      columns: [
        {
          title: '设备名称',
          dataIndex: 'groupName',
          align: 'center',
          customRender: ({ text }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '设备编码',
          dataIndex: 'devNum',
          align: 'center',
          customRender: ({ text }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        }
      ],
      tableData: [],
      loading: false
    })
    const select = async (value: number): Promise<void> => {
      gatewayCode.value = value
      pagination.value.pageNumber = 1
      getAssociatedDevices()
    }
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getAssociatedDevices()
    }
    const keyword = ref(props.deviceName)
    // 获取关联设备列表
    const getAssociatedDevices = async (): Promise<void> => {
      if (!gatewayCode.value) return
      const params = {
        channelId: gatewayCode.value,
        keyword: keyword.value,
        pageSize: pagination.value.pageSize,
        pageNumber: pagination.value.pageNumber
      }
      const res = await aggregationListThinPage(params)
      deviceTable.tableData = res.data.rows
      pagination.value.total = res.data.pageTotal
    }
    const queryAssociated = async (): Promise<void> => {
      pagination.value.pageNumber = 1
      getAssociatedDevices()
    }
    const resetAssociated = async (): Promise<void> => {
      pagination.value.pageNumber = 1
      keyword.value = ''
      getAssociatedDevices()
    }
    const rowSelection = reactive({
      selectedRowKeys: selectedRowKeysData.value,
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value.length = 0
        selectedRowKeysData.value.push(...selectedRowKeys)
      },
      getCheckboxProps: (record: TableData) => ({
        disabled: record.groupId === props.association.groupId,
        // defaultChecked: true
      })
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div style='flex: 1;color: rgba(0, 0, 0, 0.65);font-size: 12px;margin-left: 8px; margin-top: 4px;'>
              <QuestionCircleOutlined /> 设备间共享事件。设备B关联设备A，则设备B获得A所有事件。
            </div>
          </>
        )
      },
      'layout-left': (): JSX.Element => {
        return (
          <>
            <div class='deviceLeft'>
              <div><GatewayTree levelNeed={2} checkable={false} onSelect={select} /> </div>
            </div>
          </>
        )
      },
      'layout-right': (): JSX.Element=> {
        return (
          <>
            <div class='deviceRight_title'>设备列表</div>
            <div style='height: calc(100% - 80px);display: flex;flex-direction: column; justify-content: space-between;'>
              <div style='margin-bottom: 10px;'>
                <Form layout='inline'>
                  <FormItem label='名称'>
                    <Input v-model:value={keyword.value} placeholder='输入名称搜索' showCount={false} onSearch={async () => queryAssociated()} onChange={async () => queryAssociated()} />
                  </FormItem>
                  <FormItem>
                    <Button type='primary' style='margin-right: 10px;' onClick={queryAssociated}>查询</Button>
                    <Button onClick={resetAssociated}>重置</Button>
                  </FormItem>
                </Form>
              </div>
              <div style='flex: 1;display: flex;flex-direction: column; justify-content: space-between;'>
                <Table
                  rowSelection={rowSelection}
                  loading={deviceTable.loading}
                  columns={deviceTable.columns}
                  dataSource={deviceTable.tableData}
                  size='small'
                  scrollY={400}
                  rowKey='groupId'
                  pagination={false}
                />
                <Page
                  class='pagePosition'
                  v-model:current={pagination.value.pageNumber}
                  v-model:pageSize={pagination.value.pageSize}
                  v-model:total={pagination.value.total}
                  onPageChange={pageChange}
                />
              </div>
            </div>
          </>
        )
      }
    }
    const showData = (): { gatewayCode: number;selectedRowKeys: string[]; } => {
      return {
        gatewayCode: gatewayCode.value,
        selectedRowKeys: selectedRowKeysData.value
      }
    }
    // 使用 expose 暴露组件内部的方法
    context.expose({ showData })
    onMounted(() => {
      props.association.relGroupInfo?.split(',').forEach((item: string, index: number) => {
        if ((index + 1) % 2 !== 0) {
          selectedRowKeysData.value.push(item)
        }
      })
      gatewayCode.value = props.channelId
      getAssociatedDevices()
    })
    return (): JSX.Element =>
      <>
        <CLayout title='设备关联' v-slots={layoutSlots} showFooter={false} />
      </>
  }
})
