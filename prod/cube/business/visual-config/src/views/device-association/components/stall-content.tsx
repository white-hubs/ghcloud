import { defineComponent, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { Button, Cascader, Form, FormItem, Input, Modal, PopConfirm, Select, Table, message } from '@ghcloud/cube-ui'
import styles from '../device-association.module.less'
import { addStallSceneConfig, deleteStallSceneConfig, stallCategoryList, stallSceneStall } from '@/api/mdata'
import type { TableData } from '@/views/device-relation/device-relation-i'
import { StallModal } from './stall-modal'
import { cubeDeviceCenterService } from '@ghcloud/generic-component/src/api/service'
import { useUtils } from '@/hooks/use-utils'

export const StallContent = defineComponent({
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
  emits: ['isRemoveDisabled', 'setStallPageNum', 'setDataType'],
  setup: (props, { emit, expose }) => {
    const stallModalRef = ref<{ getStallData: () => { checkAll: boolean;styleRowKeysData: string[]; categoryId: string;keyword: string; }; }>()
    const search = reactive({
      categoryId: undefined,
      keyword: '',
      areaId: [],
      pageNumber: 1,
      pageSize: 10,
      pages: 0,
      total: 0
    })
    const dataType = ref('STALL')
    const emptyArea = ref(0)
    const stallType = ref<unknown[]>([])
    const confirmLoading = ref<boolean>(false)
    const tableColumns = [
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
      title: '档位关联',
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
      const { getProjectId } = useUtils()
      const projectId = getProjectId()
      await deleteStallSceneConfig({ sceneType: props.menuSelectedValue }, { businessIds: [params.id], projectId })
        message.success('移除成功')
        if (search.pages === search.pageNumber && deviceTableData.tableData.length === 1 && search.pageNumber !== 1) {
          search.pageNumber = search.pages - 1
          emit('setStallPageNum', { total: search.total, pageNumber: search.pageNumber })
        }
        requestDevicePage()
        getAreaEmptyDeviceTotal()
    }
    // 获取档位类型
    const getStallCategoryList = async (): Promise<void> => {
      const res = await stallCategoryList()
      stallType.value = res
    }

    const reset = async (): Promise<void> => {
      Object.assign(search, {
        categoryId: undefined,
        keyword: '',
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
      try {
        const res = stallModalRef.value?.getStallData()
        const params = {
          sceneType: props.menuSelectedValue,
          categoryId: res?.categoryId,
          keyword: res?.keyword,
          stallBindWay: res?.checkAll ? 'ALL_STALL' : 'APPOINT_STALL',
          businessIds: res?.styleRowKeysData
        }

        if (res?.styleRowKeysData.length || res?.checkAll) {
          confirmLoading.value = true
          const data = await addStallSceneConfig(params)
          requestDevicePage()
          if (data === 'OK') {
            message.success('关联成功')
            confirmLoading.value = false
            modal.visible = false
          }
        } else {
          message.warning('请选择关联档位')
        }
      } catch {
      } finally {
        setTimeout(() => {
          confirmLoading.value = false
          modal.visible = false
        }, 500)
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
        categoryId: search.categoryId,
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        areaId: search.areaId ? search.areaId[search.areaId.length - 1] : '',
        sceneType: props.menuSelectedValue,
      }
      const res = await stallSceneStall(params)
      search.total = res.total
      search.pages = res.pages
      emit('setStallPageNum', { total: search.total, pageNumber: search.pageNumber })
      deviceTableData.tableData = res.records
      deviceTableData.deviceTableLoading = false
    }
    const getAreaEmptyDeviceTotal = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.areaEmptyDeviceTotal({ tagCodes: [`custom.app::visual.${props.menuSelectedValue}`] })
      emptyArea.value = res.totalNum
    }
    watch(() => props.menuSelectedValue, () => {
      if (props.menuSelectedValue) {
        requestDevicePage()
        getAreaEmptyDeviceTotal()
      } else {
        deviceTableData.tableData = []
        search.total = 0
        emit('setStallPageNum', { total: search.total, pageNumber: 0 })
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
      getStallCategoryList()
    })
    const exposeData = (): { rowKeysData: string[]; } => {
      return {
        rowKeysData: rowKeysData.value
      }
    }
    const changeDataType = (value: string): void => {
      emit('setDataType', value)
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
                v-model:value={search.categoryId}
                options={stallType.value}
                fieldNames={{ label: 'name', value: 'id' }}
                allow-clear placeholder='请选择档位类型'
              />
            </FormItem>
            <FormItem>
              <Input
                v-model:value={search.keyword}
                style={{ width: '200px' }}
                placeholder='请输入名称搜索'
              />
            </FormItem>
            <FormItem>
              <Cascader
                style={{ width: '150px' }}
                changeOnSelect
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
                <Button type='primary' disabled={!props.menuSelectedValue} onClick={addDevice}>添加档位</Button>
              </div>
            </FormItem>
          </Form>
        </div>
        <div class={styles['content-table']}>
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
            modal.visible && <StallModal ref={stallModalRef} stallType={stallType.value} visible={modal.visible} menuSelectedValue={props.menuSelectedValue} />
          }
        </Modal>
      </>
  }
})
