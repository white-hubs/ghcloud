import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Button, Form, FormItem, Input, Table, Page } from '@ghcloud/cube-ui'
import { cubeSecurityManagementService } from '@/api/service'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'
interface Props {
  visible: boolean;
  disabledKeys: string[];
  selectedKeys: string[];
}
export const BroadcastDeviceModal = defineComponent({
  emits: ['cancel', 'save'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    disabledKeys: {
      type: Array as PropType<string[]>,
      default: []
    },
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: []
    },
  },
  setup: (props: Props, { emit }) => {
    const visible = ref(false)
    const dataSource = ref<SecurityDeviceRecord[]>([])
    const disabledList = ref<string[]>([])
    const save = (): void => {
      emit('save', selectedRowKeysData.value, selectedRowsData.value)
    }
    const cancel = (): void => {
      visible.value = false
      emit('cancel', false)
    }
    const deviceColumns = [

      {
        dataIndex: 'code',
        title: '设备编码',

      },
      {
        dataIndex: 'deviceName',
        title: '设备名称',
      },
      {
        dataIndex: 'deviceProdCategoryName',
        title: '产品品类',
      },
      {
        dataIndex: 'deviceProdName',
        title: '产品名称',
      },
      {
        dataIndex: 'brandName',
        title: '设备品牌',
      },
      {
        dataIndex: 'areaName',
        title: '所属区域',
      },
    ]
    const loading = ref(false)
    const pagination = ref<{
      pageSize: number;
      pageNumber: number;
      total?: number; }>({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = reactive<{ keyword: string; }>({
      keyword: '',
    })
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getBroadcastTemplatePage()
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.keyword = ''
      getBroadcastTemplatePage()
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getBroadcastTemplatePage()
    }
    const getBroadcastTemplatePage = async (): Promise<void> => {
      const params = {
        ...pagination.value,
        ...formState,
      }
      delete params?.total
      loading.value = true
      const appInfo = JSON.parse(sessionStorage.getItem('GH-currentApplication') as unknown as string) as { code: string; }
      const res = await cubeSecurityManagementService.getSecurityDevicePage({
        applicationCode: appInfo.code,
        ...params,
      })
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const selectedRowKeysData = ref<string[]>(props.selectedKeys || [])
    const selectedRowsData = ref<SecurityDeviceRecord[]>([])
    const rowSelection = ref({
      selectedRowKeys: selectedRowKeysData.value,
      onChange: (selectedRowKeys: string [], selectedRows: SecurityDeviceRecord[]) => {
        selectedRowKeysData.value = selectedRowKeys
        selectedRowsData.value = selectedRows
      },
      getCheckboxProps: (record: SecurityDeviceRecord) => {
        return {
          disabled: disabledList.value?.length
            ? disabledList.value?.includes(record.id)
            : false,
        }
      }
    })
    watch(() => props.visible, (val) => {
      visible.value = val
      if (val) {
        getBroadcastTemplatePage()
      }
    }, { immediate: true })
    watch(() => props.disabledKeys, (val) => {
      disabledList.value = val
    }, { immediate: true })
    return (): JSX.Element =>
      <>
        <Modal v-model:visible={visible.value} title='选择广播模板' onOk={save} onCancel={cancel} width={800}>
          <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
            <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Input style={{ width: '220px' }} placeholder='请输入名称搜索' v-model:value={formState.keyword} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Button type='primary' onClick={queryForm}>查询</Button>
              <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
            </FormItem>
          </Form>
          <Table
            rowKey='deviceId'
            columns={deviceColumns}
            dataSource={dataSource.value}
            pagination={false}
            loading={loading.value}
            rowSelection={rowSelection.value}
            scrollY={300}
          />
          <Page
            style={{ textAlign: 'right' }}
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        </Modal>
      </>
  }
})
