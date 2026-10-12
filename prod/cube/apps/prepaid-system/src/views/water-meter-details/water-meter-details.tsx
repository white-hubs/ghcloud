import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import {
  getWaterRecord,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './water-meter-details-i'
import { useRouter, type LocationQueryRaw } from 'vue-router'
import styles from './water-meter-details.module.less'
import { logger } from '@/logger'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'

export const WaterMeterDetails = defineComponent({
  setup: () => {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    
    const item: SearchType = {
      meterId: '',
      pageNumber: 1,
      pageSize: 10,
    }
    // 记录详情=========================================================================================================
    const visible = ref<boolean>(false)
    const router = useRouter()
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(600)
    const tableData = ref<TableData[]>()
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
    // 查询水表明细表格数据===================================================================================================
    // 获取水表明细表格数据
    const requestWaterPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          meterId: search.meterId,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getWaterRecord(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestWaterPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestWaterPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestWaterPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestWaterPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestWaterPage()
    }
    const linkRecord = (item: LocationQueryRaw): void => {
      logger.debug(item)
      router.replace({ path: '/water-record-list', query: item })
      visible.value = true
    }
    // 表格==========================================================================================================
    const recordTableColumns = [
      {
        title: '水表编号',
        dataIndex: 'meterId',
        key: 'meterId',
      },
      {
        title: '商铺号',
        dataIndex: 'roomId',
        key: 'roomId',
      },
      {
        title: '剩余水量',
        dataIndex: 'account',
        key: 'account',
      },
      {
        title: '总购水金额',
        dataIndex: 'totalMoney',
        key: 'totalMoney',
      },
      {
        title: '累计购水量',
        dataIndex: 'totalPower',
        key: 'totalPower',
      },
      {
        title: '水价',
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: '是否失联',
        dataIndex: 'unConnect',
        key: 'unConnect',
        customRender: ({ text }: { text: number; }): string => {
          return text ? '是' : '否'
        },
      },
      {
        title: '是否欠费',
        dataIndex: 'oweStatus',
        key: 'oweStatus',
        customRender: ({ text }: { text: number; }): string => {
          return text ? '是' : '否'
        },
      },
      {
        title: '操作',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ record }: { record: LocationQueryRaw; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                linkRecord(record)
              }}>详情</Button>
            </>
          )
        }
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
      <>
        <GLayout title='水表明细' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
