import { Button, Checkbox, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, Table, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { cubeDeviceCenterService } from '@/api/service'
import dayjs from 'dayjs'

/** 设备弹窗 */
interface Props {
  title: string;
  value: { id: string; name: string; }[];
  searchParams: Record<string, unknown>;
  multiple?: boolean;
  applicationCode?: string;
  filterTagCodes?: string[];
}
export const IotDeviceTable = defineComponent({
  props: ['title', 'value', 'searchParams', 'multiple', 'applicationCode', 'filterTagCodes'],
  emits: ['update:value', 'selection', 'checkAll'],
  setup (props: Props, { emit, expose }) {
    const loading = ref(false)
    const parentOptions = ref<{ label: string; value: string; }[]>([])
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = reactive({
      devNumLike: '',
      devNameLike: undefined,
      parentDevNum: undefined
    })
    const period = ref([])
    const selectedRowKeysData = ref<string[]>([])
    const selectedRowsData = ref<{ parentDevNum: string; devNum: string; devName: string; }[]>([])
    const rowSelection = ref({
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string [], selectedRows: { parentDevNum: string; devNum: string; devName: string; id: string; }[]) => {
        selectedRowKeysData.value = selectedRowKeys
        selectedRowsData.value = selectedRows
        emit('update:value', selectedRows)
        emit('selection', selectedRows)
        if (selectedRows.length > 0) {
          checkAll.value = false
        }
      }
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        dataSource.value = []
        pagination.value.total = 0
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          devNumLike: formState.devNumLike ?? '',
          parentDevNum: formState.parentDevNum ?? '',
          devNameLike: formState.devNameLike ?? '',
          startTime: period.value && period.value[0] ? dayjs(period.value[0]).format('YYYY-MM-DD 00:00:00') : '',
          endTime: period.value && period.value[1] ? dayjs(period.value[1]).format('YYYY-MM-DD 23:59:59') : '',
        }
        const res = await cubeDeviceCenterService.getDeviceMgtPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records.map((i, index) => {
            return {
              ...i,
              id: `${i.devNum}${i.devName}-${index}`
            }
          })
          pagination.value.total = total
        }
      } catch {
      } finally {
        loading.value = false
        selectedRowKeysData.value = []
        selectedRowsData.value = []
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      selectedRowKeysData.value.length = 0
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.devNumLike = ''
      formState.devNameLike = undefined
      formState.parentDevNum = undefined
      period.value = []
      queryForm()
    }
    const checkAll = ref(false)

    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '设备序列号',
        dataIndex: 'devNum',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: 'devName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '网关名称',
        dataIndex: 'parentDevName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '网关编号',
        dataIndex: 'parentDevNum',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]

    const getParentOptions = async (): Promise<void> => {
      cubeDeviceCenterService.getDeviceMgtPage({
        onlyParent: true,
        pageNumber: 1,
        pageSize: 1000
      }).then(res => {
        if (res) {
          const { records } = res
          parentOptions.value = records.map(r => {
            return { label: r.devName ?? '', value: r.devNum ?? '' }
          })
        }
      })
    }
    onMounted(async () => {
      selectedRowKeysData.value = []
      selectedRowsData.value = []
      getParentOptions()
      queryForm()
    })
    expose({
      queryForm,
      selectedRowsData,
      selectedRowKeysData,
      dataSource,
      period,
      formState
    })

    return (): JSX.Element=>
      <div style='display: flex; flex-direction: column; justify-content: space-between;min-height: 500px;'>
        <div style='display: flex; flex-direction: column;min-height: 500px;'>
          <Form layout='inline' style={{ margin: '10px 0 ' }}>
            <FormItem label='网关名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Select options={parentOptions.value} style={{ width: '180px' }} placeholder='请选择网关' v-model:value={formState.parentDevNum} showSearch optionFilterProp='label' />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='时间范围'>
              <DateRangePicker show-time valueFormat='YYYY-MM-DD HH:mm:ss' v-model:value={period.value} allowClear={false} />
            </FormItem>
            <FormItem label='设备序列号' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Input
                v-model:value={formState.devNumLike} placeholder='设备序列号' showCount={false}
                allowClear
              />
            </FormItem>
            <FormItem label='设备名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Input
                v-model:value={formState.devNameLike} placeholder='设备名称' showCount={false}
                allowClear
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Button type='primary' onClick={queryForm}>查询</Button>
              <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Checkbox
                v-model:checked={checkAll.value}
                onUpdate:checked={() => {
                  emit('checkAll', checkAll.value, pagination.value.total)
                }}
                style={{ marginLeft: '10px' }}
              >勾选所有
              </Checkbox>
            </FormItem>
          </Form>
          <Table rowKey='id' rowSelection={rowSelection.value} columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={400} />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>已选：{selectedRowKeysData.value.length} 条数据</span>
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        </div>
      </div>
  }
})
