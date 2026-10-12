import { computed, defineComponent, reactive, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { Button, Form, FormItem, Input, Modal, Table, message } from '@ghcloud/cube-ui'
import { getSwitchDeviceList } from '@/apis'
import { GPagination } from '@/components/common/pagination'
interface DeviceVo {
  deviceName: string;
  deviceId: string;
  id: string;
  thirdPartyId: string;
}
export const SelectDeviceModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedRowKeys: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    selectedRow: {
      type: Array as PropType<DeviceVo[]>,
      default: () => []
    }
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const columns = [{
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '设备编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '产品分类',
      dataIndex: 'deviceProdCategoryName',
      key: 'deviceProdCategoryName',
    },
    {
      title: '设备型号',
      dataIndex: 'deviceProdName',
      key: 'deviceProdName',
    },
    {
      title: '设备区域',
      dataIndex: 'areaName',
      key: 'areaName',
    },
    ]
    const state = reactive<{
      selectedRowKeys: string[];
      selectedRows: DeviceVo[];
      searchParams: {
        pageNumber: number;
        pageSize: number;
        total: number;
        keyword: string;
      };
      dataSource: unknown[];
    }>({
      selectedRowKeys: [],
      selectedRows: [],
      dataSource: [],
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        keyword: ''
      }
    })
    const handleCancel = (): void => {
      emit('update:visible', false)
    }
    watch(() => props.visible, async () => {
      if (props.visible) {
        await getList()
        state.selectedRowKeys = props.selectedRowKeys
        state.selectedRows = props.selectedRow
      }
    })
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: state.selectedRowKeys,
        onSelect: selectChange,
        onSelectAll: selectAllChange
      }
    })
    const selectChange = (record: DeviceVo, selected: boolean): void => {
      if (!selected) {
        state.selectedRowKeys = state.selectedRowKeys.filter(item => item !== record.id)
        state.selectedRows = state.selectedRows.filter(item => item.id !== record.id)
      } else {
        state.selectedRowKeys.push(record.id)
        state.selectedRows.push(record)
      }
    }
    const selectAllChange = (selected: boolean, selectedRows: DeviceVo[], changeRows: DeviceVo[]): void => {
      if (!selected) {
        const changeRowsIds = new Set(changeRows.map(item => item.id))
        state.selectedRowKeys = state.selectedRowKeys.filter(item => !changeRowsIds.has(item))
        state.selectedRows = state.selectedRows.filter(item => !changeRowsIds.has(item.id))
      } else {
        state.selectedRowKeys = state.selectedRowKeys.concat(changeRows.map(item => item.id))
        state.selectedRows = state.selectedRows.concat(changeRows)
      }
    }
    const getList = async (): Promise<void> => {
      const { data } = await getSwitchDeviceList({
        ...state.searchParams
      })
      state.dataSource = data.records
      state.searchParams.total = data.total
    }
    const handleOk = (): void => {
      if (!state.selectedRows.length) {
        message.warn('请选择设备')
        return
      }
      emit('ok', state.selectedRows)
      emit('update:visible', false)
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.keyword = ''
      state.searchParams.pageNumber = 1
      getList()
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    return () => (
      <Modal v-model:visible={props.visible} title='设备选择' onCancel={handleCancel} onOk={handleOk}>
        <div class={styles.searchBar}>
          <Form layout='inline'>
            <FormItem>
              <Input placeholder='请输入' v-model:value={state.searchParams.keyword} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        </div>
        <Table columns={columns} rowKey='id' rowSelection={rowSelection.value} pagination={false} dataSource={state.dataSource} size='small' />
        <div class={styles.page}>
          <GPagination total={state.searchParams.total} pageSize={state.searchParams.pageSize} current={state.searchParams.pageNumber} onChange={changePage} />
        </div>
      </Modal>

    )
  }
})
