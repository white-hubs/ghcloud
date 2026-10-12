import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { Button, DateRangePicker, Form, FormItem, Table } from '@ghcloud/cube-ui'
import { GPagination } from '@/components/common/pagination'
import { getOperateLogList } from '@/api'
import { useRoute } from 'vue-router'
// import moment from 'moment'
import dayjs from 'dayjs'
export const OpearteLogTab = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive({
      dataSource: [],
      loading: false,
      selectOptions: [],
      searchParams: {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      }
    })
    const columns = [
      {
        title: '商户名称',
        dataIndex: 'wholesalerName',
        key: 'wholesalerName',
        align: 'center'
      },
      {
        title: '档位编号',
        dataIndex: 'gearPositionCode',
        key: 'gearPositionCode',
        align: 'center'
      },
      {
        title: '档位区域',
        dataIndex: 'gearPositionArea',
        key: 'gearPositionArea',
        align: 'center'
      },
      {
        title: '操作时间',
        dataIndex: 'logTime',
        key: 'logTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
      },
      {
        title: '操作内容',
        dataIndex: 'remark',
        key: 'remark',
        align: 'center'
      },
    ]
    const period = ref<string[]>([dayjs().format('YYYY-MM-DD 00:00:01'), dayjs().format('YYYY-MM-DD 23:59:59')])
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          deviceId: route.params.id as string,
          ...state.searchParams,
          logTypeEnum: 'HARDWARE_LOG',
          period: period.value ? period.value.join(',') : ''
        }
        const { data } = await getOperateLogList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }

    onMounted(() => {
      getList()
    })
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.pageSize = 10
      state.searchParams.keyword = ''
      period.value = [dayjs().format('YYYY-MM-DD 00:00:01'), dayjs().format('YYYY-MM-DD 23:59:59')]
      getList()
    }
    const handleChangePicker = (value: string[]): void => {
      period.value = [dayjs(value[0]).format('YYYY-MM-DD 00:00:01'), dayjs(value[1]).format('YYYY-MM-DD 23:59:59')]
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    return (): JSX.Element => (
      <>
        <div class={styles['gather-record']}>
          <div>
            <Form layout='inline'>
              <FormItem>
                <DateRangePicker picker='date' v-model:value={period.value} onChangePicker={handleChangePicker} />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                </div>
              </FormItem>
            </Form>
          </div>
          <div class={styles['table-container']}>
            <Table
              dataSource={state.dataSource}
              columns={columns}
              size='small'
              scrollY={500}
              loading={state.loading}
              pagination={false}
            />
          </div>
          <div class={styles.page}>
            <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />
          </div>
        </div>
      </>
    )
  }
})
