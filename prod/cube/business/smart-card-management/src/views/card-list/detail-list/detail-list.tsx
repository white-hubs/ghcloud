import {
  defineComponent, onMounted,
  reactive,
  ref
} from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, TabPane, Table, Tabs } from '@ghcloud/cube-ui'
import { getAccessPage, getLadderControlPage, getVisitingPage } from '@/api/record'
import type {
  SearchType, TableData,
} from './detail-list-i'
import { timestampToDate, timestampToTime } from '@/utils/common'
import { logger } from '@/logger'
import { useRoute, useRouter } from 'vue-router'
import styles from '../card-list.module.less'
import { GPagination } from '@/components/common/pagination'
export const DetailList = defineComponent({
  setup: () => {
    const item: SearchType = {
      pageNumber: 1,
      pageSize: 10,
    }
    const route = useRoute()
    const router = useRouter()
    const total = ref<number>(0)
    const search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const tableList = ref([
      { key: 1, name: '访客记录' },
      { key: 2, name: '门禁使用记录' },
      { key: 3, name: '梯控使用记录' },
      { key: 4, name: '可视对讲使用记录' },
    ])
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询表格数据===================================================================================================
    // 获取访客表格数据
    const requestVisitingPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          cardNo: route.query.cardNo,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getVisitingPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    // 获取门禁记录表格数据
    const requestgetAccessPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          cardNo: route.query.cardNo,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getAccessPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    // 获取梯控记录表格数据
    const requestLadderControlPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          cardNo: route.query.cardNo,
          accessType: 'TK',
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getLadderControlPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    // 可视对讲记录
    const requestIntercomPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          cardNo: route.query.cardNo,
          accessType: 'KSDJ',
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getLadderControlPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestVisitingPage()
    })
    // 表格==========================================================================================================
    const inOutType = (text: number): string => {
      let type = '未知'
      if (text === 0) {
        type = '出'
      } else if (text === 1) {
        type = '进'
      } else {
        type = '未知'
      }
      return type
    }
    const recordTableColumns = ref([
      {
        title: '访客记录ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '被访人姓名',
        dataIndex: 'receptionistName',
        key: 'receptionistName',
      },
      {
        title: '访客姓名',
        dataIndex: 'visitorName',
        key: 'visitorName',
      },
      {
        title: '访客手机号',
        dataIndex: 'phoneNo',
        key: 'phoneNo',
      },
      {
        title: '访客车牌号',
        dataIndex: 'plateNo',
        key: 'plateNo',
      },
      {
        title: '来访时间',
        dataIndex: 'visitStartTime',
        key: 'visitStartTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '离开时间',
        dataIndex: 'visitEndTime',
        key: 'visitEndTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '来访事由',
        dataIndex: 'visitPurpose',
        key: 'visitPurpose',
      },
      {
        title: '卡号',
        dataIndex: 'cardNo',
        key: 'cardNo',
      },
      {
        title: '访客状态',
        dataIndex: 'visitorStatusName',
        key: 'visitorStatusName',
      },
    ])

    const tabchange = (item: number): void => {
      search.pageNumber = 1
      search.pageSize = 10
      if (item === 1) {
        recordTableColumns.value = [
          {
            title: '访客记录ID',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: '被访人姓名',
            dataIndex: 'receptionistName',
            key: 'receptionistName',
          },
          {
            title: '访客姓名',
            dataIndex: 'visitorName',
            key: 'visitorName',
          },
          {
            title: '访客手机号',
            dataIndex: 'phoneNo',
            key: 'phoneNo',
          },
          {
            title: '访客车牌号',
            dataIndex: 'plateNo',
            key: 'plateNo',
          },
          {
            title: '来访时间',
            dataIndex: 'visitStartTime',
            key: 'visitStartTime',
            customRender: ({ text }: { text: number; }) => {
              return timestampToDate(text) + timestampToTime(text)
            }
          },
          {
            title: '离开时间',
            dataIndex: 'visitEndTime',
            key: 'visitEndTime',
            customRender: ({ text }: { text: number; }) => {
              return timestampToDate(text) + timestampToTime(text)
            }
          },
          {
            title: '来访事由',
            dataIndex: 'visitPurpose',
            key: 'visitPurpose',
          },
          {
            title: '卡号',
            dataIndex: 'cardNo',
            key: 'cardNo',
          },
          {
            title: '访客状态',
            dataIndex: 'visitorStatusName',
            key: 'visitorStatusName',
          },
        ]
        requestVisitingPage()
      } else if (item === 2) {
        recordTableColumns.value = [
          {
            title: '门禁事件ID',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: '事件名称',
            dataIndex: 'eventName',
            key: 'eventName',
          },
          {
            title: '门禁点名称',
            dataIndex: 'doorName',
            key: 'doorName',
          },
          {
            title: '使用时间',
            dataIndex: 'eventTime',
            key: 'eventTime',
            customRender: ({ text }: { text: number; }) => {
              return timestampToDate(text) + timestampToTime(text)
            }
          },
          {
            title: '人员名称',
            dataIndex: 'personName',
            key: 'personName',
          },
          {
            title: '卡号',
            dataIndex: 'cardNo',
            key: 'cardNo',
          },
          {
            title: '进出类型',
            dataIndex: 'inAndOutType',
            key: 'inAndOutType',
            customRender: ({ text }: { text: number ; }) => {
              return inOutType(Number(text))
            }
          },

        ]
        requestgetAccessPage()
      } else if (item === 3) {
        recordTableColumns.value = [
          {
            title: '使用记录ID',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: '事件名称',
            dataIndex: 'eventName',
            key: 'eventName',
          },
          {
            title: '使用时间',
            dataIndex: 'eventTime',
            key: 'eventTime',
            customRender: ({ text }: { text: number; }) => {
              return timestampToDate(text) + timestampToTime(text)
            }
          },
          {
            title: '人员名称',
            dataIndex: 'personName',
            key: 'personName',
          },
          {
            title: '卡号',
            dataIndex: 'cardNo',
            key: 'cardNo',
          },
          {
            title: '电梯名称',
            dataIndex: 'alias',
            key: 'alias',
          },
          {
            title: '设备名称',
            dataIndex: 'deviceName',
            key: 'deviceName',
          },

        ]
        requestLadderControlPage()
      } else {
        recordTableColumns.value = [
          {
            title: '使用记录ID',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: '事件名称',
            dataIndex: 'eventName',
            key: 'eventName',
          },
          {
            title: '使用时间',
            dataIndex: 'eventTime',
            key: 'eventTime',
            customRender: ({ text }: { text: number; }) => {
              return timestampToDate(text) + timestampToTime(text)
            }
          },
          {
            title: '人员名称',
            dataIndex: 'personName',
            key: 'personName',
          },
          {
            title: '卡号',
            dataIndex: 'cardNo',
            key: 'cardNo',
          },
          {
            title: '设备名称',
            dataIndex: 'deviceName',
            key: 'deviceName',
          },
        ]
        requestIntercomPage()
      }
      logger.debug(item)
    }
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestVisitingPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestVisitingPage()
    }

    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex' }}>
            <div style={{ width: '33%' }}>卡号:{route.query.cardNo}</div>
            <div style={{ width: '33%' }}>持卡人:{route.query.personName}</div>
           <div style={{ width: '33%' }}>使用状态:{route.query.useStatus === 'NORMAL' ? '正常' : '挂失'}</div>
          </div>
        )
      },
      'content-table': () => {
        return (
          <>
            <Tabs onTabChange={tabchange}>
              {tableList.value.map(e => {
                return <TabPane key={e.key} tab={e.name} />
              })}
            </Tabs>
            <div>
              <Table
                columns={recordTableColumns.value}
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
    const back = (): void => {
      router.replace({ path: '/card-list' })
    }
    return () =>
        <GLayout title='智能卡详情' showFooter={false} v-slots={gLayoutSlots}>
          <div style={{ marginBottom: '10px', textAlign: 'end' }}><Button onClick={back}>返回</Button></div>
        </GLayout>
  }
})
