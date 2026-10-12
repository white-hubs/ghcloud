import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import {
  getElectricityRecord,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './electricity-inquiry-i'
import styles from './electricity-inquiry.module.less'
import { logger } from '@/logger'
import { timestampToDate } from '@/utils/common'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'

export const ElectricityInquiry = defineComponent({
  setup: () => {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    
    const item: SearchType = {
      period: [],
      meterId: '',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(600)
    const tableData = ref<TableData[]>([])
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
    // 查询用电表格数据===================================================================================================
    // 获取用电表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period?.join(',') ?? '',
          meterId: search.meterId,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getElectricityRecord(params)
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
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '电表编号',
        dataIndex: 'meterId',
        key: 'meterId',
        ellipsis: true,
        width: 180,
        fixed: 'left',
      },
      {
        title: '日期',
        dataIndex: 'useDate',
        key: 'useDate',
        customRender: ({ text }: { text: number; }): string => {
          return timestampToDate(text)
        },
        ellipsis: true,
        width: 180,
      },
      {
        title: '用电量',
        dataIndex: 'pv',
        key: 'pv',
        ellipsis: true,
        width: 180,
      },
      {
        title: '剩余金额',
        dataIndex: 'powerRemain',
        key: 'powerRemain',
        ellipsis: true,
        width: 180,
      },
      {
        title: '尖电能用电量',
        dataIndex: 'pvj',
        key: 'pvj',
        ellipsis: true,
        width: 180,
      },
      {
        title: '峰电能用电量',
        dataIndex: 'pvf',
        key: 'pvf',
        ellipsis: true,
        width: 180,
      },
      {
        title: '平电能用电能',
        dataIndex: 'pvp',
        key: 'pvp',
        ellipsis: true,
        width: 180,
      },
      {
        title: '谷电能用电能',
        dataIndex: 'pvg',
        key: 'pvg',
        ellipsis: true,
        width: 180,
      },
      {
        title: '当前抄表用电量',
        dataIndex: 'currentPv',
        key: 'currentPv',
        ellipsis: true,
        width: 180,
      },
      {
        title: '当前抄表尖电量',
        dataIndex: 'currentPvj',
        key: 'currentPvj',
        ellipsis: true,
        width: 180,
      },
      {
        title: '当前抄表峰电量',
        dataIndex: 'currentPvf',
        key: 'currentPvf',
        ellipsis: true,
        width: 180,
      },
      {
        title: '当前抄表平电量',
        dataIndex: 'currentPvp',
        key: 'currentPvp',
        ellipsis: true,
        width: 180,
      },
      {
        title: '当前抄表谷电量',
        dataIndex: 'currentPvg',
        key: 'currentPvg',
        ellipsis: true,
        width: 180,
      },
      {
        title: '上次抄表尖电量',
        dataIndex: 'lastPvj',
        key: 'lastPvj',
        ellipsis: true,
        width: 180,
      },
      {
        title: '上次抄表峰电量',
        dataIndex: 'lastPvf',
        key: 'lastPvf',
        ellipsis: true,
        width: 180,
      },
      {
        title: '上次抄表平电量',
        dataIndex: 'lastPvp',
        key: 'lastPvp',
        ellipsis: true,
        width: 180,
      },
      {
        title: '上次抄表谷电量',
        dataIndex: 'lastPvg',
        key: 'lastPvg',
        ellipsis: true,
        width: 180,
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='电表编号'>
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
      <GLayout title='用电查询' showFooter={false} v-slots={gLayoutSlots} />
  }
})
