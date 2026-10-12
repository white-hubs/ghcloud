import { defineComponent, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { Button, Cascader, Form, FormItem, Input, Modal, PopConfirm, Select, Table, message } from '@ghcloud/cube-ui'
import styles from '../device-association.module.less'
import type { TableData } from '@/views/device-relation/device-relation-i'
import { DeviceModal } from './device-modal'
import { cubeDeviceCenterService } from '@ghcloud/generic-component/src/api/service'

export const DeviceContent = defineComponent({
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
  emits: ['isRemoveDisabled', 'setPageNum', 'setDataType'],
  setup: (props, { emit, expose }) => {
    const deviceModalRef = ref<{ getDeviceData: () => { checkAll: boolean;styleRowKeysData: string[]; categoryCode: string[];keyword: string; }; }>()
    const dataType = ref('DEVICE')
    const confirmLoading = ref<boolean>(false)
    const search = reactive({
      keyword: '',
      areaId: '',
      pageNumber: 1,
      pageSize: 10,
      pages: 0,
      total: 0
    })
    const emptyArea = ref(0)
    const tableColumns = [
      {
        title: '设备名称',
        dataIndex: 'name',
        align: 'center',
        key: 'name'
      },
      {
        title: '设备编号',
        dataIndex: 'code',
        align: 'center',
        key: 'code'
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        align: 'center',
        key: 'areaName',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return <>{record.area?.pathName ?? '-'}</>
        }
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
    const rowKeysData = ref<string[]>([])
    const modal = reactive({
      visible: false,
      title: '设备关联',
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
        await cubeDeviceCenterService.delDeviceConfig(props.menuSelectedValue, { businessIds: [params.id] })
        message.success('移除成功')
        if (search.pages === search.pageNumber && deviceTableData.tableData.length === 1 && search.pageNumber !== 1) {
          search.pageNumber = search.pages - 1
          emit('setPageNum', { total: search.total, pageNumber: search.pageNumber })
        }
        requestDevicePage()
        getAreaEmptyDeviceTotal()
      } catch {
      }
    }
    const reset = async (): Promise<void> => {
      Object.assign(search, {
        keyword: '',
        areaId: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      })
      requestDevicePage()
    }
    const addDevice = async (): Promise<void> => {
      modal.visible = true
    }
    const handelAdd = async (): Promise<void> => {
      const res = deviceModalRef.value?.getDeviceData()
      const params = {
        deviceBindWay: res?.checkAll ? 'ALL_EQUIPMENT' : 'APPOINT_EQUIPMENT',
        keyword: res?.keyword,
        categoryCode: res?.categoryCode,
        sceneType: props.menuSelectedValue,
        businessIds: res?.styleRowKeysData ?? [],
        deviceProdCategoryCodeConcat: res?.categoryCode?.join('-') ?? ''
      }

      if (res?.styleRowKeysData.length || res?.checkAll) {
        confirmLoading.value = true
        await cubeDeviceCenterService.addDeviceSceneConfig(params)
        requestDevicePage()
        getAreaEmptyDeviceTotal()
        message.success('关联成功')
        confirmLoading.value = false
        modal.visible = false
      } else {
        message.warning('请选择关联设备')
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
        tagCodes: [`custom.app::visual.${props.menuSelectedValue}`],
        anyAreaId: search.areaId ? search.areaId[search.areaId.length - 1] : '',
      }
      const res = await cubeDeviceCenterService.getDeviceInstancePageAll(params)
      search.total = res.total
      search.pages = res.pages
      emit('setPageNum', { total: search.total, pageNumber: search.pageNumber })
      deviceTableData.tableData = res.records
      deviceTableData.deviceTableLoading = false
    }
    const getAreaEmptyDeviceTotal = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.areaEmptyDeviceTotal({ tagCodes: [`custom.app::visual.${props.menuSelectedValue}`] })
      emptyArea.value = res.totalNum
    }
    const changeDataType = (value: string): void => {
      emit('setDataType', value)
    }
    watch(() => props.menuSelectedValue, () => {
      if (props.menuSelectedValue) {
        requestDevicePage()
        getAreaEmptyDeviceTotal()
      } else {
        deviceTableData.tableData = []
        search.total = 0
        emit('setPageNum', { total: search.total, pageNumber: 0 })
      }
    })
    watch(() => props.pageSearch, () => {
      if (props.menuSelectedValue) {
        search.pageSize = props.pageSearch.pageSize
        search.pageNumber = props.pageSearch.pageNumber
        requestDevicePage()
      }
    }, { deep: true })
    onMounted(() => {
      if (props.menuSelectedValue) {
        requestDevicePage()
      }
    })
    const exposeData = (): { rowKeysData: string[]; } => {
      return {
        rowKeysData: rowKeysData.value
      }
    }
    expose({
      exposeData,
      requestDevicePage,
      getAreaEmptyDeviceTotal
    })
    return (): JSX.Element =>
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
                <Button type='primary' disabled={!props.menuSelectedValue} onClick={addDevice}>添加设备</Button>
              </div>
            </FormItem>
          </Form>
        </div>
        <div class={styles['content-table']}>
          <div class={styles['content-top']}>
            <div class={styles['deice-title']}>以下有 <span class={styles['deice-value']}>{emptyArea.value}</span>  个设备的所在区域为空，会导致可视化模型上展示不出来，请到物联设备台账中补充。</div>
          </div>
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
            modal.visible && <DeviceModal ref={deviceModalRef} visible={modal.visible} menuSelectedValue={props.menuSelectedValue} />
          }
        </Modal>
      </>
  }
})
