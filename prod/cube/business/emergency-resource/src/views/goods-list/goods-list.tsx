import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Modal, Table } from '@ghcloud/cube-ui'
import {
  getInoutList,
  getMaterialListPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './goods-list-i'
import styles from './goods-list.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const GoodsList = defineComponent({
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
    // 查询物资表格数据===================================================================================================
    // 获取物资表格数据
    const requestMaterialListPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          name: search.name,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getMaterialListPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestMaterialListPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestMaterialListPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestMaterialListPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestMaterialListPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestMaterialListPage()
    }
    // 表格==========================================================================================================
    const recordTableColumns = [
      {
        title: '物资名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '物资分类',
        dataIndex: 'typeName',
        key: 'typeName',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '在库数量',
        dataIndex: 'storeNum',
        key: 'storeNum',
      },
      {
        title: '报损数量',
        dataIndex: 'lossNum',
        key: 'lossNum',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '操作',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ record }: { record: TableData; }) => {
          return (
            <>
              <Button type='link' onClick={() => { openModal(record) }}>出入库明细</Button>
            </>
          )
        }
      },
    ]
    const modalTableData = ref()
    // 操作记录弹窗=========================================================================================================
    const visible = ref<boolean>(false)
    const modalTableLoading = ref<boolean>(false)
    const modelSearch = ref({
      total: 0,
      pageNumber: 1,
      pageSize: 10
    })
    let goodName = ''
    const openModal = async (item: { name: string; id: string; }): Promise<void> => {
      visible.value = true
      modalTableLoading.value = true
      goodName = item.name
      const params = {
        pageNumber: modelSearch.value.pageNumber,
        pageSize: modelSearch.value.pageSize,
        suppliesId: item.id
      }
      const res = await getInoutList(params)
      modalTableLoading.value = false
      modalTableData.value = res.records
      modelSearch.value.total = res.total
    }
    const modalTableColumn = [
      {
        title: '记录号',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '记录时间',
        dataIndex: 'inoutTime',
        key: 'inoutTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '数量',
        dataIndex: 'inoutNum',
        key: 'inoutNum'
      },
      {
        title: '单位',
        dataIndex: 'inoutUnit',
        key: 'inoutUnit'
      },
      {
        title: '类型',
        dataIndex: 'inoutType',
        key: 'inoutType',
        customRender: ({ text }: { text: string; }) => {
          return <><span>{text === 'IN' ? '入' : '出'}</span></>
        }
      },
      {
        title: '分类标签',
        dataIndex: 'inoutTag',
        key: 'inoutTag',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      }
    ]
    const changeModelPage = (page: number, pageSize: number): void => {
      modelSearch.value.pageNumber = page
      modelSearch.value.pageSize = pageSize
      requestMaterialListPage()
    }
    const changeModelSize = (current: number, size: number): void => {
      modelSearch.value.pageNumber = 1
      modelSearch.value.pageSize = size
      requestMaterialListPage()
    }
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='物资名称'>
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
        <GLayout title='物资清单' showFooter={false} v-slots={gLayoutSlots} />
          <Modal
            visible={visible.value}
            title='出入库明细'
            width='50%'
            onCancel={() => { visible.value = false }}
            onOk={() => { visible.value = false }}
          >
            <div style={{ marginBottom: '10px' }}>物资名称：<span>{goodName}</span></div>
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
