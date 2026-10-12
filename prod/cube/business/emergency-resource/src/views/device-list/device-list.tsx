import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Modal, Table } from '@ghcloud/cube-ui'
import {
  getEmergencyDevice, getEmergencyUsedRecord,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './device-list-i'
import styles from './device-list.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const DeviceList = defineComponent({
  setup: () => {
    const item: SearchType = {
      name: '',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = () => {
      getscrollY()
    }
    onMounted(() => {
      nextTick(() => {
        getscrollY()
      })
    })
    // 查询设备表格数据===================================================================================================
    // 获取设备表格数据
    const requestEmergencyDevice = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          name: search.name,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getEmergencyDevice(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestEmergencyDevice()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestEmergencyDevice()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestEmergencyDevice()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestEmergencyDevice()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestEmergencyDevice()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '设备资料',
        dataIndex: 'fileNames',
        key: 'fileNames',
        customRender: ({ record }: { record: TableData; }) => {
          return (
            <>
              <Button type='link' onClick={() => { preview(record.filePaths ?? '') }}>{record.fileNames}</Button>
            </>
          )
        }
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '总数量',
        dataIndex: 'deviceNum',
        key: 'deviceNum',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '使用中',
        dataIndex: 'deviceUsedNum',
        key: 'deviceUsedNum',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '已损耗',
        dataIndex: 'deviceLossNum',
        key: 'deviceLossNum',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: TableData; }) => {
          return (
            <>
              <Button type='link' onClick={() => { openModal(record) }}>使用记录</Button>
            </>
          )
        }
      }
    ]
    // 操作记录弹窗=========================================================================================================
    const visible = ref<boolean>(false)
    const modalTableLoading = ref<boolean>(false)
    const modalTableData = ref()
    const modalItem = ref()
    const modelSearch = ref({
      total: 0,
      pageNumber: 1,
      pageSize: 10,
    })
    const requrstEmergencyUsedRecord = async (): Promise<void> => {
      modalTableLoading.value = true
      try {
        const params = {
          deviceId: modalItem.value.id,
          pageNumber: modelSearch.value.pageNumber,
          pageSize: modelSearch.value.pageSize
        }
        const res = await getEmergencyUsedRecord(params)
        modalTableLoading.value = false
        modelSearch.value.total = res.total
        modalTableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    const changeModelPage = (page: number, pageSize: number): void => {
      modelSearch.value.pageNumber = page
      modelSearch.value.pageSize = pageSize
      requestEmergencyDevice()
    }
    const changeModelSize = (current: number, size: number): void => {
      modelSearch.value.pageNumber = 1
      modelSearch.value.pageSize = size
      requestEmergencyDevice()
    }
    const openModal = async (item: { id: string; name?: string; }): Promise<void> => {
      visible.value = true
      modalItem.value = item
      requrstEmergencyUsedRecord()
    }
    const preview = (filePaths: string): void => {
      window.open(filePaths)
    }
    const modalTableColumn = [
      {
        title: '使用人',
        dataIndex: 'userName',
        key: 'userName'
      },
      {
        title: '使用时间',
        dataIndex: 'usedTime',
        key: 'usedTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '数量',
        dataIndex: 'usedNum',
        key: 'usedNum'
      },
      {
        title: '类型',
        dataIndex: 'usedTypeName',
        key: 'usedTypeName'
      }
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='设备名称'>
                <Input v-model:value={search.name} />
              </FormItem>
              <FormItem>
                <div class={styles.btns}>
                  <Button onClick={reset}>重置</Button>
                  <Button type='primary' onClick={handelSearch}>查询</Button>
                </div>
              </FormItem>
            </Form>
          </div>
        )
      },
      'content-table': () => {
        return (
          <>
            <div class={styles['content-right']}>
              <Table
                columns={recordTableColumns}
                data-source={tableData.value}
                loading={tableLoading.value}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
              <div class={styles['table-footer']}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={total.value}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div>
            </div>
          </>
        )
      },
    }
    return () =>
        <>
        <GLayout title='设备清单' showFooter={false} v-slots={gLayoutSlots} />
        <Modal
          visible={visible.value}
          title='使用记录'
          width='50%'
          onCancel={() => { visible.value = false }}
          onOk={() => { visible.value = false }}
        >
          <div style={{ marginBottom: '10px' }}>设备名称：<span>{modalItem.value.name}</span></div>
          <Table
            columns={modalTableColumn}
            dataSource={modalTableData.value}
            loading={modalTableLoading.value}
            rowKey='id'
            pagination={false}
            scrollY={440}
          />
          <div class={styles['table-footer']}>
            <GPagination
              current={modelSearch.value.pageNumber}
              pageSize={modelSearch.value.pageSize}
              total={modelSearch.value.total}
              onChangePage={changeModelPage}
              onChangeSize={changeModelSize}
            />
          </div>
        </Modal>
        </>
  }
})
