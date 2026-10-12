import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, RadioGroup, Table } from '@ghcloud/cube-ui'
import {
  getEleRechargeRecord,
  getEleMeterReadingRecord
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './record-list-i'
import styles from '../electricity-meter-details.module.less'
import { logger } from '@/logger'
import { useRoute, useRouter } from 'vue-router'
import { meterReadingColumns, rechargeColumns } from './columns'
import { timestampToDate, timestampToTime } from '@/utils/common'
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
    // 查询明细表格数据===================================================================================================
    let recordTableColumns = [
      {
        title: '采集时间',
        dataIndex: 'collectTime',
        key: 'collectTime',
        customRender: ({ text }: { text: number; }): string => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '剩余金额',
        dataIndex: 'powerRemain',
        key: 'powerRemain',
      },
      {
        title: '总用电量',
        dataIndex: 'powerTatol',
        key: 'powerTatol',
      },
      {
        title: '尖电能',
        dataIndex: 'powerHigher',
        key: 'powerHigher',
      },
      {
        title: '峰电能',
        dataIndex: 'powerHigh',
        key: 'powerHigh',
      },
      {
        title: '平电能',
        dataIndex: 'powerFlat',
        key: 'powerFlat',
      },
      {
        title: '谷电能',
        dataIndex: 'powerLow',
        key: 'recopowerLowrdId',
      },
      {
        title: '尖电价',
        dataIndex: 'priceHigher',
        key: 'priceHigher',
      },
      {
        title: '峰电价',
        dataIndex: 'priceHigh',
        key: 'priceHigh',
      },
      {
        title: '平电价',
        dataIndex: 'priceFlat',
        key: 'priceFlat',
      },
      {
        title: '谷电价',
        dataIndex: 'priceLow',
        key: 'priceLow',
      },

    ]
    // 获取充值记录
    const eleRechargeRecordData = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          meterId: route.query.meterId
        }
        const res = await getEleRechargeRecord(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    // 获取抄表记录
    const eleMeterReadingRecordData = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          meterId: route.query.meterId
        }
        const res = await getEleMeterReadingRecord(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }

    // 记录详情=========================================================================================================
    const select = ref('meter-reading')
    onMounted(() => {
      eleMeterReadingRecordData()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      select.value === 'recharge' ? eleRechargeRecordData() : eleMeterReadingRecordData()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      select.value === 'recharge' ? eleRechargeRecordData() : eleMeterReadingRecordData()
    }
    // 表格==========================================================================================================

    const selectChange = (item: string): void => {
      select.value = item
      if (item === 'recharge') {
        recordTableColumns = rechargeColumns
        eleRechargeRecordData()
      } else {
        recordTableColumns = meterReadingColumns
        eleMeterReadingRecordData()
      }
    }
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <RadioGroup
            buttonStyle='solid'
            options={[{ label: '抄表记录', value: 'meter-reading' }, { label: '充值记录', value: 'recharge' }]}
            v-model:value={select.value}
            onChange={selectChange}
          />
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-right']}>
              <AliasTable
                rowKey='id'
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
    const back = (): void => {
      router.replace({ path: '/electricity-meter-details' })
    }
    return (): JSX.Element =>
      <>
        <GLayout title='电表明细' showFooter={false} v-slots={gLayoutSlots}>
          <div style={{ marginBottom: '10px', textAlign: 'end' }}><Button onClick={back}>返回</Button></div>
        </GLayout>
      </>
  }
})
