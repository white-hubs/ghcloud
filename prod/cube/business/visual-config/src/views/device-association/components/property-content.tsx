import { defineComponent, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { Button, Cascader, Form, FormItem, Input, Modal, PopConfirm, Select, Table, message } from '@ghcloud/cube-ui'
import styles from '../device-association.module.less'
import type { TableData } from '@/views/device-relation/device-relation-i'
import { PropertyModal } from './property-modal'
import { addPropertySceneConfig, deletePropertySceneConfig, getAssemblyClassifyPage, propertySceneStall } from '@/api/mdata'
import type { PropertyRecord } from '@/api/models/mdata'

export const PropertyContent = defineComponent({
  props: {
    menuSelectedValue: {
      type: String as PropType<string>,
      default: ''
    },
    areaOptions: {
      type: Array,
      default: []
    },
    pageSearch: {
      type: Object as PropType<{ pageSize: number;pageNumber: number; }>,
      default: []
    },
    dataTypeList: {
      type: Array as PropType<{ key: string;name: string; }[]>,
      default: []
    },
  },
  emits: ['isRemoveDisabled', 'setPropertyPageNum', 'setDataType'],
  setup: (props, { emit, expose }) => {
    const dataType = ref('PROPERTY')
    const search = reactive({
      keyword: '',
      areaId: '',
      pageNumber: 1,
      pageSize: 10,
      typeId: undefined,
      pages: 0,
      total: 0
    })
    const propertyModalRef = ref<{ getStallData: () => { checkAll: boolean;styleRowKeysData: string[]; typeId: string;keyword: string; }; }>()
    const propertyType = ref<unknown[]>([])
    const tableColumns = [
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
        title: '设备区域',
        dataIndex: 'areaName',
        align: 'center',
        key: 'areaName',
      },
      {
        title: '模型编码',
        dataIndex: 'deviceNumber',
        align: 'center',
        key: 'deviceNumber'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        align: 'center',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <PopConfirm
                title='确定要移除该数据吗?'
                onConfirm={() => {
                  deleteDevice(record)
                }}
              >
                <Button type='link' size='small'>移除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const deviceTableData = reactive<{ tableData: unknown[]; deviceTableLoading: boolean;removeDisabled: boolean; }>({
      tableData: [],
      deviceTableLoading: false,
      removeDisabled: true
    })
    const confirmLoading = ref<boolean>(false)
    const rowKeysData = ref<string[]>([])
    const modal = reactive({
      visible: false,
      title: '资产关联',
      submitLoading: false,
      action: 'add'
    })
    const rowSelection = reactive({
      selectedRowKeys: rowKeysData.value,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string []) => {
        rowKeysData.value.length = 0
        rowKeysData.value.push(...selectedRowKeys)
        if (rowKeysData.value.length) {
          emit('isRemoveDisabled', false)
        } else {
          emit('isRemoveDisabled', true)
        }
      },
    })
    const deleteDevice = async (params: TableData): Promise<void> => {
      try {
        await deletePropertySceneConfig({ ids: [params.id] })
        message.success('移除成功')
        if (search.pages === search.pageNumber && deviceTableData.tableData.length === 1 && search.pageNumber !== 1) {
          search.pageNumber = search.pages - 1
          emit('setPropertyPageNum', { total: search.total, pageNumber: search.pageNumber })
        }
        requestDevicePage()
      } catch {
        message.error('删除失败')
      }
    }
    const reset = async (): Promise<void> => {
      Object.assign(search, {
        keyword: '',
        areaId: '',
        pageNumber: 1,
        pageSize: 10,
        typeId: undefined,
        total: 0
      })
      requestDevicePage()
    }
    const addDevice = async (): Promise<void> => {
      modal.visible = true
    }
    const handelAdd = async (): Promise<void> => {
      const res = propertyModalRef.value?.getStallData()
      const params = {
        sceneType: props.menuSelectedValue,
        typeId: res?.typeId,
        keyword: res?.keyword,
        bindWay: res?.checkAll ? 'ALL' : undefined,
        businessIds: res?.styleRowKeysData
      }

      if (res?.styleRowKeysData.length || res?.checkAll) {
        confirmLoading.value = true
        const data = await addPropertySceneConfig(params)
        if (data) {
          message.success('关联成功')
          confirmLoading.value = false
          modal.visible = false
        }
        requestDevicePage()
      } else {
        message.warning('请选择关联资产')
      }
    }
    const handelCancel = async (): Promise<void> => {
      modal.visible = false
    }
    const requestDevicePage = async (): Promise<void> => {
      if (!props.menuSelectedValue) {
        message.warning('请先选择关联菜单')
        return
      }
      deviceTableData.deviceTableLoading = true
      const params = {
        keyword: search.keyword,
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        sceneType: props.menuSelectedValue,
        areaId: search.areaId ? search.areaId[search.areaId.length - 1] : '',
        typeId: search?.typeId
      }
      const res = await propertySceneStall(params)
      search.total = res.total
      search.pages = res.pages
      emit('setPropertyPageNum', { total: search.total, pageNumber: search.pageNumber })
      deviceTableData.tableData = res.records.map((e: PropertyRecord) => {
        return {
          ...e,
          areaName: e.area.map(item => item.name).join('/')
        }
      })
      deviceTableData.deviceTableLoading = false
    }
    // 获取资产类型
    const getStallCategoryList = async (): Promise<void> => {
      const res = await getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: 'assetType' })
      propertyType.value = res.records as { id: string; name: string; }[]
    }
    const changeDataType = (value: string): void => {
      emit('setDataType', value)
    }
    watch(() => props.menuSelectedValue, () => {
      if (props.menuSelectedValue) {
        requestDevicePage()
      } else {
        search.total = 0
        deviceTableData.tableData = []
        emit('setPropertyPageNum', { total: search.total, pageNumber: 0 })
      }
    })
    watch(() => props.pageSearch, () => {
      search.pageSize = props.pageSearch.pageSize
      search.pageNumber = props.pageSearch.pageNumber
      requestDevicePage()
    }, { deep: true })
    onMounted(() => {
      requestDevicePage()
      getStallCategoryList()
    })
    const exposeData = (): { rowKeysData: string[]; } => {
      return {
        rowKeysData: rowKeysData.value
      }
    }
    expose({
      exposeData,
      requestDevicePage
    })
    return (): JSX.Element=>
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Form layout='inline' model={search} class={styles['content-right']}>
            <FormItem label='数据类型'>
              <Select
                style={{ width: '100px' }}
                v-model:value={dataType.value}
                options={props.dataTypeList}
                fieldNames={{ label: 'name', value: 'key' }}
                allow-clear={false} placeholder='请选择设备类型'
                onChange={changeDataType}
              />
            </FormItem>
            <FormItem>
              <Select
                style={{ width: '150px' }}
                v-model:value={search.typeId}
                options={propertyType.value}
                fieldNames={{ label: 'name', value: 'id' }}
                allow-clear placeholder='请选择资产类型'
                onChange={requestDevicePage}
              />
            </FormItem>
            <FormItem>
              <Input
                v-model:value={search.keyword}
                style={{ width: '200px' }}
                placeholder='请输入名称搜索'
                onChange={() => {
                  search.keyword = search.keyword ? search.keyword.replace(/\s+/g, '') : ''
                }}
              />
            </FormItem>
            <FormItem>
              <Cascader
                changeOnSelect
                style={{ width: '150px' }}
                v-model:value={search.areaId}
                field-names={{ label: 'name', value: 'id', children: 'children' }}
                options={props.areaOptions} placeholder='请选择区域'
              />
            </FormItem>
            <FormItem>
              <div class={styles.btns}>
                <Button type='primary' onClick={requestDevicePage}>查询</Button>
                <Button onClick={reset}>重置</Button>
              </div>
            </FormItem>
            <FormItem>
              <div class={styles.btns}>
                <Button type='primary' disabled={!props.menuSelectedValue} onClick={addDevice}>添加资产</Button>
              </div>
            </FormItem>
          </Form>
        </div>
        <div class={styles['content-table']}>
          <div class={styles['content-top']} />
          <Table
            class={styles.mt10}
            columns={tableColumns}
            dataSource={deviceTableData.tableData}
            loading={deviceTableData.deviceTableLoading}
            pagination={false}
            scrollY={440}
            rowKey='id'
            rowSelection={rowSelection}
          />
        </div>
        <Modal
          style='width:1000px;'
          visible={modal.visible}
          title={modal.title}
          confirm-loading={confirmLoading.value}
          onOk={handelAdd}
          onCancel={handelCancel}
        >
          {
            modal.visible && <PropertyModal ref={propertyModalRef} visible={modal.visible} propertyType={propertyType.value} menuSelectedValue={props.menuSelectedValue} />
          }
        </Modal>
      </>
  }
})
