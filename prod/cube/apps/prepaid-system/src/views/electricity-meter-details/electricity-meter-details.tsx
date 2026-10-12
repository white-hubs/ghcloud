import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import type {
  SearchType,
  TableData,
} from './electricity-meter-details-i'
import { useRouter, type LocationQueryRaw } from 'vue-router'
import styles from './electricity-meter-details.module.less'
import { logger } from '@/logger'
import { getElectricityMeter } from '@/api/record'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'

export const ElectricityMeterDetails = defineComponent({
  setup: () => {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')

    const item: SearchType = {
      meterId: '',
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
    const tableData = ref<TableData[]>([])
    // 查询电表明细表格数据===================================================================================================
    // 获取电表明细表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          meterId: search.meterId,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getElectricityMeter(params)
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
    // 记录详情=========================================================================================================
    const router = useRouter()
    const linkRecord = (item: LocationQueryRaw): void => {
      router.replace({ path: '/electricity-record-list', query: { meterId: item.meterId } })
    }
    // 表格==========================================================================================================
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
        title: '商铺号',
        dataIndex: 'roomId',
        key: 'roomId',
        customRender: ({ text }: { text: number; }): string | number => {
          return text ?? '--'
        }
      },
      {
        title: '剩余电费',
        dataIndex: 'powerRemain',
        key: 'powerRemain',
      },
      {
        title: '型号',
        dataIndex: 'model',
        key: 'model',
      },
      {
        title: '合并计量余额',
        dataIndex: 'money',
        key: 'money',
        customRender: ({ text }: { text: string; }): string => {
          return text || '--'
        }
      },
      {
        title: '是否欠费',
        dataIndex: 'oweMoney',
        key: 'oweMoney',
        customRender: ({ text }: { text: boolean ; }): string => {
          return text ? '是' : '否'
        }
      },
      {
        title: '是否失联',
        dataIndex: 'unConnect',
        key: 'unConnect',
        customRender: ({ text }: { text: boolean; }): string => {
          return text ? '是' : '否'
        }
      },
      {
        title: '分合闸状态',
        dataIndex: 'openOrClose',
        key: 'openOrClose',
        customRender: ({ text }: { text: number; }): string => {
          return text ? '拉闸' : '合闸'
        }
      },
      {
        title: '总用电量',
        dataIndex: 'powerTotal',
        key: 'powerTotal',
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
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
              <FormItem label='电表编号'>
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
        <GLayout title='电表明细' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
