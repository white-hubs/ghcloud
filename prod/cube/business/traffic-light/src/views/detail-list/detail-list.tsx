import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Table } from '@ghcloud/cube-ui'
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
export const DetailList = defineComponent({
  setup: () => {
    const item: SearchType = {
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    const search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询交通灯表格数据===================================================================================================
    // 获取交通灯表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
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
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '记录编号',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '记录时间',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ text }: { text: number; }): string=> {
          return timestampToDate(text)
        }
      },
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        key: 'areaName',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '红',
        dataIndex: 'red',
        key: 'red',
        customRender: ({ text }: { text: string; }): string=> {
          return text || '-'
        }
      },
      {
        title: '绿',
        dataIndex: 'green',
        key: 'green',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '黄',
        dataIndex: 'yellow',
        key: 'yellow',
        customRender: ({ text }: { text: string; }): string=> {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
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
      <GLayout title='交通灯明细' showFooter={false} v-slots={gLayoutSlots} />
  }
})
