import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Button, Select, DateRangePicker } from '@ghcloud/cube-ui'
import { getTerminalProgramList, getAppContactDeviceList } from '@/apis/index'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { AliasTable } from '@ghcloud/generic-component'
export const TerminalShowList = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      scrollY: number;
      deviceOptions: { label: string; value: string;thirdPartyId: string; }[];
      period: Dayjs[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        clientId: string;
        total: number;
        keyword: string;
        selectValue: string;
      };
    }>({
      loading: false,
      dataSource: [],
      deviceOptions: [],
      scrollY: 500,
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        clientId: '',
        selectValue: '',
        keyword: ''
      },
      period: []
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          period: state.period ? state.period.join(',') : ''
        }
        const { data } = await getTerminalProgramList({
          ...params,
        })
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '节目名称',
        dataIndex: 'name',
        key: 'name',
        customRender: ({ text }: { text: number; }) => {
          return text || '--'
        }
      },
      {
        title: '开始时间',
        dataIndex: 'beginDate',
        key: 'beginDate',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
      },
      {
        title: '结束时间',
        dataIndex: 'endDate',
        key: 'endDate',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
      },
      {
        title: '有效星期',
        dataIndex: 'weeks',
        key: 'weeks',
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
    ]
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleChange = (value: string, option: { thirdPartyId: string; }): void => {
      state.searchParams.clientId = option.thirdPartyId
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.keyword = ''
      state.searchParams.pageNumber = 1
      state.period = []
      getList()
    }
    onMounted(async () => {
      getScrollY()
      await getAppDeviceList()
      state.searchParams.selectValue = state.deviceOptions.length ? state.deviceOptions[0].value : ''
      state.searchParams.clientId = state.deviceOptions.length ? state.deviceOptions[0].thirdPartyId : ''
      await getList()
    })
    const getScrollY = (): void => {
      const content = document.querySelector('.layout-table')
      if (!content) {
        state.scrollY = 500
        return
      }
      state.scrollY = content.clientHeight - 50
    }
    const devicePage = {
      pageNumber: 1,
      pageSize: 10,
      pages: 0
    }
    const getAppDeviceList = async (): Promise<void> => {
      const { data } = await getAppContactDeviceList(devicePage)
      const list = data.records.map(item => {
        return {
          label: item.deviceName,
          value: item.id,
          thirdPartyId: item.thirdPartyId
        }
      })
      state.deviceOptions = [...state.deviceOptions, ...list]
      devicePage.pages = data.pages
    }
    const handlePopupScroll = (e: Event): void => {
      e.preventDefault()
      const { scrollTop, offsetHeight, scrollHeight } = e.target as unknown as HTMLDivElement
      if (scrollTop + offsetHeight === scrollHeight && devicePage.pages > devicePage.pageNumber) {
        devicePage.pageNumber++
        getAppDeviceList()
      }
    }
    const handleSearchSelect = async (input: string): Promise<void> => {
      const { data } = await getAppContactDeviceList({
        keyword: input,
        pageSize: 1000,
        pageNumber: 1
      })
      const list = data.records.map(item => {
        return {
          label: item.deviceName,
          value: item.id,
          thirdPartyId: item.thirdPartyId
        }
      })
      state.deviceOptions = list
      devicePage.pages = data.pages
    }
    const layoutSlots = {
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem label='选择设备'>
              <Select style={{ width: '180px' }} onChange={handleChange} filterOption={false} show-search onSearch={handleSearchSelect} onPopupScroll={handlePopupScroll} placeholder='请输入名称' options={state.deviceOptions} v-model:value={state.searchParams.selectValue} />
            </FormItem>
            <FormItem label='选择日期'>
              <DateRangePicker v-model:value={state.period} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': () => {
        return <AliasTable columns={columns} rowKey='id' scrollX={0} loading={state.loading} tableCode='TERMINAL_SHOW_LIST' applicationCode='INFORMATION_PUBLISH' dataSource={state.dataSource} pagination={false} scrollY={500} />
      },
      'footer-page': () => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return () => <GLayout title='终端节目列表' v-slots={layoutSlots} />
  }
})
