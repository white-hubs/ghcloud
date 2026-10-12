import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, RadioGroup, Table } from '@ghcloud/cube-ui'
import {
  getRechargeRecord,
} from '@/api/record'
import {
  BuyType, SaleType
} from './record-list-i'
import type {
  SearchType,
  TableData
} from './record-list-i'
import styles from '../water-meter-details.module.less'
import { timestampToDate, timestampToTime } from '@/utils/common'
import { logger } from '@/logger'
import { useRoute, useRouter } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'

export const RecordList = defineComponent({
  setup: () => {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    
    const item: SearchType = {
      pageNumber: 1,
      pageSize: 10,
    }
    const router = useRouter()
    const total = ref<number>(0)
    const search = reactive<SearchType>({ ...item })
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
    // 查询明细表格数据===================================================================================================
    // 获取明细表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          meterId: route.query.meterId
        }
        const res = await getRechargeRecord(params)
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
    // 表格==========================================================================================================
    const recordTableColumns = [
      {
        title: '创建时间',
        dataIndex: 'rechargeTime',
        key: 'rechargeTime',
        customRender: ({ text }: { text: number; }): string => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '售水金额',
        dataIndex: 'saleMoney',
        key: 'saleMoney',
      },
      {
        title: '购水类型',
        dataIndex: 'buyType',
        key: 'buyType',
        customRender: ({ text }: { text: number; }): string => {
          return BuyType.get(text) ?? '--'
        }
      },
      {
        title: '售水类型',
        dataIndex: 'saleType',
        key: 'saleType',
        customRender: ({ text }: { text: number; }): string => {
          return SaleType.get(text) ?? '--'
        }
      },
      {
        title: '上次累计金额',
        dataIndex: 'lastMoney',
        key: 'lastMoney',
      },
    ]
    // 记录详情=========================================================================================================
    const select = ref('recharge')
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <RadioGroup
            buttonStyle='solid'
            options={[{ label: '充值记录', value: 'recharge' }]}
            v-model:value={select.value}
          />
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
    const back = (): void => {
      router.replace({ path: '/water-meter-details' })
    }
    return (): JSX.Element =>
      <>
        <GLayout title='充值记录' showFooter={false} v-slots={gLayoutSlots}>
          <div style={{ marginBottom: '10px', textAlign: 'end' }}><Button onClick={back}>返回</Button></div>
        </GLayout>
      </>
  }
})
