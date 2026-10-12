import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { Button, DateRangePicker, Form, FormItem, Table, Select, message } from '@ghcloud/cube-ui'
import { GPagination } from '@/components/common/pagination'
import { getDeviceAttrOptions, getDeviceAttrHistoryList } from '@/api/device-center'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
export const GatherRecordTab = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{ dataSource: Record<string, unknown>[];selectType: string;loading: boolean;selectOptions: Record<string, string>[];searchParams: Record<string, string | number | null>; }>({
      dataSource: [],
      loading: false,
      selectOptions: [],
      selectType: '',
      searchParams: {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        attribute: null
      }
    })
    const columns = [
      {
        title: '采集时间',
        dataIndex: 'ts',
        key: 'ts',
        align: 'center',
        customRender: ({ text }: { text: string; }): string => {
          return dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '采集明细',
        dataIndex: 'value',
        key: 'value',
        align: 'center',
        customRender: ({ text }: { text: string; }): string => {
          return text || '--'
        }
      },
    ]
    const period = ref<string[]>([])
    const getList = async (): Promise<void> => {
      if (!state.searchParams.attribute) {
        message.error('请选择设备属性!')
        return
      }

      try {
        state.loading = true
        const params = {
          deviceId: route.params.id as string,
          startTime: period.value ? period.value[0] : '',
          endTime: period.value ? period.value[1] : '',
          attribute: state.searchParams.attribute
        }
        const { data } = await getDeviceAttrHistoryList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const getOptions = async (): Promise<void> => {
      const params = {
        deviceId: route.params.id as string
      }
      const result = await getDeviceAttrOptions(params)
      const data = result.data as { attributeCode: string; attributeName: string; }[]
      if (data.length) {
        state.selectOptions = data
        state.searchParams.attribute = data[0].attributeCode
      }
    }
    onMounted(async () => {
      await getOptions()
      await getList()
    })
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.pageSize = 10
      state.searchParams.keyword = ''
      period.value = []
      getList()
    }
    const handleChangePicker = (value: string[]): void => {
      period.value = [dayjs(value[0]).format('YYYY-MM-DD 00:00:00'), dayjs(value[1]).format('YYYY-MM-DD 23:59:59')]
    }
    const handleSelectChange = (val: string, option: { dataType: string;attributeName: string;attributeCode: string; }): void => {
      state.selectType = option.dataType
      state.searchParams.attribute = val
      getList()
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
                <Select v-model:value={state.searchParams.attribute} onChange={handleSelectChange} placeholder='属性' style={{ width: '200px' }} options={state.selectOptions} fieldNames={{ label: 'attributeName', value: 'attributeCode' }} />
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
              current={state.searchParams.pageNumber as number}
              pageSize={state.searchParams.pageSize as number}
              total={state.searchParams.total as number ?? 0}
              onChange={changePage}
            />
          </div>
        </div>
      </>
    )
  }
})
