import { Button, Checkbox, Form, FormItem, Input, Page, Select, Table } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, type PropType, watch, onMounted } from 'vue'
import styles from '../../device-association/device-association.module.less'
import { stallPage } from '@/api/mdata'
export const StallModal = defineComponent({
  props: {
    menuSelectedValue: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    stallType: {
      type: Array,
      default: []
    },
  },
  setup: (props, { expose }) => {
    const selectTableColumn = [
      {
        title: '档位编号',
        dataIndex: 'code',
        align: 'center',
        key: 'code'
      },
      {
        title: '档位名称',
        dataIndex: 'name',
        align: 'center',
        key: 'name'
      },
      {
        title: '档位类型',
        dataIndex: 'typeName',
        align: 'center',
        key: 'typeName'
      },
      {
        title: '所在区域',
        dataIndex: 'areaNames',
        align: 'center',
        key: 'areaNames'
      },
      {
        title: '模型编码',
        dataIndex: 'visualizationCode',
        align: 'center',
        key: 'visualizationCode'
      },
    ]
    const selectTableLoading = ref(false)
    const selectTableData = ref<unknown>([])
    const checkAll = ref<boolean>(false)
    const styleRowKeysData = ref<string[]>([])
    const formData = reactive({
      categoryId: '',
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
        categoryId: '',
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      })
      selectDevicePage()
    }
    const selectDevicePage = async (): Promise<void> => {
      selectTableLoading.value = true
      const res = await stallPage({ ...formData, sceneType: props.menuSelectedValue })
      selectTableData.value = res.records
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
          categoryId: '',
          keyword: '',
          pageNumber: 1,
          pageSize: 10,
          total: 0
        })
        styleRowKeysData.value = []
        checkAll.value = false
      }
    })
    const getStallData = (): { checkAll: boolean;styleRowKeysData: string[]; categoryId: string;keyword: string; } => {
      return {
        checkAll: checkAll.value,
        styleRowKeysData: styleRowKeysData.value,
        categoryId: formData.categoryId,
        keyword: formData.keyword,
      }
    }
    expose({
      getStallData,
    })
    return (): JSX.Element=>
      <>
        <Form layout='inline' model={formData}>
          <FormItem label='档位类型'>
            <Select
              style={{ width: '150px' }}
              v-model:value={formData.categoryId}
              options={props.stallType}
              fieldNames={{ label: 'name', value: 'id' }}
              allow-clear placeholder='请选择档位类型'
            />
          </FormItem>
          <FormItem label='档位名称:' name='keyword'>
            <Input
              maxlength={20}
              placeholder='请输入档位名称'
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
