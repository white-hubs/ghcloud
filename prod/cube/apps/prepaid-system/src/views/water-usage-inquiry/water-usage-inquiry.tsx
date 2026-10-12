import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import {
  getUseWaterRecord,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './water-usage-inquiry-i'
import styles from './water-usage-inquiry.module.less'
import { logger } from '@/logger'
import { timestampToDate } from '@/utils/common'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'

export const WaterUsageInquiry = defineComponent({
  setup: () => {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    
    const item: SearchType = {
      meterId: '',
      period: [],
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(600)
    const scrollHandle = (): void => {
      let tableHeight = 0
      const clientHeight = document.querySelector('#content-table')?.clientHeight
      if (clientHeight) {
        tableHeight = clientHeight - 160
      }
      scrollY.value = tableHeight
    }
    onMounted(async () => {
      // 设置表格滚动
      scrollHandle()
      window.addEventListener('resize', function () {
        scrollHandle()
      })
    })
    const tableData = ref<TableData[]>()
    // 查询用水表格数据===================================================================================================
    // 获取用水表格数据
    const requestUseWaterRecord = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period.join(','),
          meterId: search.meterId,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getUseWaterRecord(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestUseWaterRecord()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestUseWaterRecord()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestUseWaterRecord()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestUseWaterRecord()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestUseWaterRecord()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '日期',
        dataIndex: 'useDate',
        key: 'useDate',
        customRender: ({ text }: { text: number; }): string => {
          return timestampToDate(text)
        }
      },
      {
        title: '电表编号',
        dataIndex: 'meterId'
      },
      {
        title: '用水量',
        dataIndex: 'pv',
        key: 'pv'
      },
      {
        title: '剩余金额',
        dataIndex: 'powerRemain',
        key: 'powerRemain'
      },
      {
        title: '当前抄表用水量',
        dataIndex: 'currentPv',
        key: 'currentPv'
      },
      {
        title: '上次抄表用水量',
        dataIndex: 'lastPv',
        key: 'lastPv'
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='水表编号'>
                <Input v-model:value={search.meterId} />
              </FormItem>
              <FormItem label='日期'>
                <DateRangePicker v-model:value={search.period} />
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
              <AliasTable
                columns={recordTableColumns}
                loading={tableLoading.value}
                dataSource={tableData.value}
                tableCode={tableCode}
                pagination={false}
                scrollY={scrollY.value}
                rowKey='id'
                applicationCode={__ENV__.applicationCode}
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
      <GLayout title='用水查询' showFooter={false} v-slots={gLayoutSlots} />
  }
})
