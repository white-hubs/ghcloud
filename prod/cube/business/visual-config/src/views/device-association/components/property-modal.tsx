import { Button, Checkbox, Form, FormItem, Input, Page, Select, Table } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, type PropType, watch, onMounted } from 'vue'
import styles from '../../device-association/device-association.module.less'
import { getPropertyDetailedPage } from '@/api/mdata'
export const PropertyModal = defineComponent({
  props: {
    menuSelectedValue: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    propertyType: {
      type: Array,
      default: []
    },
  },
  setup: (props, { expose }) => {
    const selectTableColumn = [
      {
        title: '资产编码',
        dataIndex: 'serialNumber',
        align: 'center',
        key: 'serialNumber'
      },
      {
        title: '资产名称',
        dataIndex: 'name',
        align: 'center',
        key: 'name'
      },
      {
        title: '资产类型',
        dataIndex: 'typeName',
        align: 'center',
        key: 'typeName'
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        align: 'center',
        key: 'areaName'
      },
      {
        title: '模型编码',
        dataIndex: 'deviceNumber',
        align: 'center',
        key: 'deviceNumber'
      },
    ]
    const selectTableLoading = ref(false)
    const selectTableData = ref<unknown>([])
    const checkAll = ref<boolean>(false)
    const styleRowKeysData = ref<string[]>([])
    const formData = reactive({
      typeId: undefined,
      keyword: '',
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const styleRowSelection = reactive({
      selectedRowKeys: styleRowKeysData.value,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string []) => {
        styleRowKeysData.value.length = 0
        styleRowKeysData.value.push(...selectedRowKeys)
      },
    })
    const selectDevicePage = async (): Promise<void> => {
      selectTableLoading.value = true
      const res = await getPropertyDetailedPage({ ...formData, sceneType: props.menuSelectedValue })
      selectTableData.value = res.records.map((e) => {
        return {
          ...e,
          areaName: e.area.map(item => item.name).join('/')
        }
      })
      formData.total = res.total
      selectTableLoading.value = false
    }
    const reset = (): void => {
      Object.assign(formData, {
        typeId: undefined,
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      })
      selectDevicePage()
    }
    const selectChangePage = (page: number, pageSize: number): void => {
      formData.pageNumber = page
      formData.pageSize = pageSize
      selectDevicePage()
    }

    onMounted(() => {
      selectDevicePage()
    })
    watch(() => props.visible, () => {
      if (props.visible) {
        selectDevicePage()
        Object.assign(formData, {
          typeId: undefined,
          keyword: '',
          pageNumber: 1,
          pageSize: 10,
          total: 0
        })
        styleRowKeysData.value = []
        checkAll.value = false
      }
    })
    const getStallData = (): { checkAll: boolean;styleRowKeysData: string[]; typeId: string;keyword: string; } => {
      return {
        checkAll: checkAll.value,
        styleRowKeysData: styleRowKeysData.value,
        typeId: formData.typeId ?? '',
        keyword: formData.keyword,
      }
    }
    expose({
      getStallData,
    })
    return (): JSX.Element =>
      <>
        <Form layout='inline' model={formData}>
          <FormItem label='资产类型'>
            <Select
              style={{ width: '150px' }}
              v-model:value={formData.typeId}
              options={props.propertyType}
              fieldNames={{ label: 'name', value: 'id' }}
              allow-clear placeholder='请选择资产类型'
            />
          </FormItem>
          <FormItem label='资产名称:' name='keyword'>
            <Input
              maxlength={20}
              placeholder='请输入资产名称'
              v-model:value={formData.keyword}
            />
          </FormItem>
          <FormItem label='勾选当前所有' name='instanceName'>
            <Checkbox v-model:checked={checkAll.value} />
          </FormItem>
          <FormItem>
            <Button class={styles.ml10} type='primary' onClick={selectDevicePage}>查询</Button>
            <Button class={styles.ml10} type='primary' onClick={reset}>重置</Button>
          </FormItem>
        </Form>
        <Table
          style={{ marginTop: '10px' }}
          columns={selectTableColumn}
          dataSource={selectTableData.value}
          loading={selectTableLoading.value}
          pagination={false}
          scrollY={440}
          rowKey='id'
          rowSelection={styleRowSelection}
        />
        <Page
          style='margin-top:20px;text-align: right;'
          v-model:current={formData.pageNumber}
          v-model:pageSize={formData.pageSize}
          v-model:total={formData.total}
          onPageChange={selectChangePage}
        />
      </>
  }
})
