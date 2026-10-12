import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Modal, Table } from '@ghcloud/cube-ui'
import {
  getLightPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './detail-list-i'
import styles from './detail-list.module.less'
import { logger } from '@/logger'
import { timestampToDate } from '@/utils/common'
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
    const preview = (businessId: string): void => {
      logger.debug(businessId)
      window.open()
    }
    // 查询设备表格数据===================================================================================================
    // 获取设备表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          name: search.name,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getLightPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestLightPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestLightPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestLightPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestLightPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestLightPage()
    }
    // 操作记录弹窗=========================================================================================================
    const visible = ref<boolean>(false)
    const openModal = (businessId: string): void => {
      logger.debug(businessId)
      visible.value = true
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '设备名称',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '设备资料',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ record }: { record: TableData; }): JSX.Element=> {
          return (
            <>
              <Button type='link' onClick={() => {
                preview(record.id)
              }}>安全帽技术参数.pdf</Button>
            </>
          )
        }
      },
      {
        title: '备注',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
      },
      {
        title: '总数量',
        dataIndex: 'red',
        key: 'red',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '使用中',
        dataIndex: 'green',
        key: 'green',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '已损耗',
        dataIndex: 'yellow',
        key: 'yellow',
        customRender: ({ text }: { text: string; }): string=> {
          return text || '-'
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                openModal(record.id)
              }}>使用记录</Button>
            </>
          )
        }
      }
    ]

    const modalTableLoading = ref<boolean>(false)
    const modelSearch = ref({
      total: 0,
      pageNumber: 1,
      pageSize: 10,
    })
    const changeModelPage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestLightPage()
    }
    const changeModelSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestLightPage()
    }


    const modalTableColumn = [
      {
        title: '使用人',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '使用时间',
        dataIndex: 'code',
        key: 'code',
        customRender: ({ text }: { text: number; }): string => {
          return timestampToDate(text)
        }
      },
      {
        title: '数量',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '类型',
        dataIndex: 'code',
        key: 'code'
      }
    ]
    const modalTableData = ref([])
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
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
      'content-table': (): JSX.Element => {
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
    return (): JSX.Element =>
      <>
        <GLayout title='设备清单' showFooter={false} v-slots={gLayoutSlots} />
        <Modal
          visible={visible.value}
          title='使用记录'
          width='50%'
          onCancel={() => {
            visible.value = false
          }}
          onOk={() => {
            visible.value = false
          }}
        >
          <div style={{ marginBottom: '10px' }}>设备名称：<span>11</span></div>
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
