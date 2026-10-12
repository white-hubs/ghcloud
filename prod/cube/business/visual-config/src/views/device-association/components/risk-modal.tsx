import { Button, Cascader, Checkbox, Form, FormItem, Input, Page, Table } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, type PropType, watch, onMounted } from 'vue'
import styles from '../../device-association/device-association.module.less'
import { riskSourceLedgerPage } from '@/api/mdata'
export const RiskModal = defineComponent({
  props: {
    menuSelectedValue: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    riskType: {
      type: Array,
      default: []
    },
  },
  setup: (props, { expose }) => {
    const selectTableColumn = [
      {
        title: '风险源编码',
        dataIndex: 'serialNumber',
        align: 'center',
        key: 'serialNumber'
      },
      {
        title: '风险源名称',
        dataIndex: 'name',
        align: 'center',
        key: 'name'
      },
      {
        title: '分类',
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
        dataIndex: 'bimCode',
        align: 'center',
        key: 'bimCode'
      },
    ]
    const selectTableLoading = ref(false)
    const selectTableData = ref<unknown>([])
    const checkAll = ref<boolean>(false)
    const styleRowKeysData = ref<string[]>([])
    const formData = reactive({
      typeCode: '',
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
    const reset = (): void => {
      Object.assign(formData, {
        typeCode: '',
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      })
      selectDevicePage()
    }
    const selectDevicePage = async (): Promise<void> => {
      selectTableLoading.value = true
      const res = await riskSourceLedgerPage({ ...formData, typeCode: formData?.typeCode ? formData.typeCode[formData.typeCode.length - 1] : '', sceneType: props.menuSelectedValue })
      selectTableData.value = res.records.map(e => {
        return {
          ...e,
          areaName: e.area.map(item => item.name).join('/')
        }
      })
      formData.total = res.total
      selectTableLoading.value = false
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
          typeCode: '',
          keyword: '',
          pageNumber: 1,
          pageSize: 10,
          total: 0
        })
        styleRowKeysData.value = []
        checkAll.value = false
      }
    })
    const getStallData = (): { typeCode: string; checkAll: boolean;styleRowKeysData: string[]; keyword: string; } => {
      return {
        checkAll: checkAll.value,
        styleRowKeysData: styleRowKeysData.value,
        typeCode: formData?.typeCode ? formData.typeCode[formData.typeCode.length - 1] : '',
        keyword: formData.keyword,
      }
    }
    expose({
      getStallData,
    })
    return (): JSX.Element =>
      <>
        <Form layout='inline' model={formData}>
          <FormItem>
            <Cascader
              v-model:value={formData.typeCode}
              field-names={{ label: 'name', value: 'code', children: 'nextList' }}
              changeOnSelect
              options={props.riskType} placeholder='请选择风险源分类'
            />
          </FormItem>
          <FormItem label='风险源名称:' name='keyword'>
            <Input
              maxlength={20}
              placeholder='请输入风险源名称'
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
