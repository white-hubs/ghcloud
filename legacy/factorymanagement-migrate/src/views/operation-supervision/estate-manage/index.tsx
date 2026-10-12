import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Table, Select, InputNumber } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import './index.less'
import { getEstateContractPage } from '@/api/operation'
import dayjs from 'dayjs'

export const EstateManage = defineComponent({
  setup: () => {
    const columns = [
      {
        title: '合同编号',
        dataIndex: 'contractNo',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '合同名称',
        dataIndex: 'contractName',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '经营类型',
        dataIndex: 'businessType',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '装修期',
        dataIndex: 'zxq',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '装修期是否免租',
        dataIndex: 'isZxqCharge',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: boolean; }) => {
          const textVal = (text === null || text === undefined) ? '' : text  ? '是' : '否'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '签订日期',
        dataIndex: 'signDate',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '起租日期',
        dataIndex: 'startDate',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '止租日期',
        dataIndex: 'endDate',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '合同预警天数',
        dataIndex: 'warnDay',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '是否预定',
        dataIndex: 'isReserve',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: boolean; }) => {
          const textVal = (text === null || text === undefined) ? '' : text  ? '是' : '否'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '是否续签',
        dataIndex: 'isContinue',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: boolean; }) => {
          const textVal = (text === null || text === undefined) ? '' : text  ? '是' : '否'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '预警状态',
        dataIndex: 'warnStatus',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '合同类型',
        dataIndex: 'contractType',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '合同逾期天数',
        dataIndex: 'overdueDay',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const dataSource = ref<unknown[]>([])
    const searchPeriod = ref<string[]>([])
    const conditionOptions = ref([
      { label: '大于', value: 'GT' },
      { label: '大于等于', value: 'GE' },
      { label: '等于', value: 'EQ' },
      { label: '小于等于', value: 'LE' },
      { label: '小于', value: 'LT' },
    ])
    const state = reactive({
      loading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        targetType: null,
        planMonth: null,
        warnCondition: null,
        warnDay: null,
        overdueCondition: null,
        overdueDay: null,
        total: 0,
      },
    })
    const getTableData = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          ...state.searchParams,
          period: searchPeriod.value ? searchPeriod.value.join(',') : '',
        }
        const res = await getEstateContractPage(params)
        dataSource.value = res.records
        state.searchParams.total = res.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getTableData()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      const initParams = {
        pageNumber: 1,
        pageSize: 10,
        planMonth: null,
        targetType: null,
        warnCondition: null,
        warnDay: null,
        overdueCondition: null,
        overdueDay: null,
        total: 0
      }
      state.searchParams = initParams
      getTableData()
    }
    const { scrollY } = useTableScroll()
    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': () => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0' }}>
              <FormItem label='签订日期' class='search-item'>
                <DateRangePicker v-model:value={searchPeriod.value} allowClear picker='date' valueFormat='YYYY-MM-DD' />
              </FormItem>
              <FormItem label='合同预警天数' class='search-item'>
                <Select placeholder='预警条件' options={conditionOptions.value} v-model:value={state.searchParams.warnCondition} style='width: 100px;' />
              </FormItem>
              <FormItem class='search-item'>
                <InputNumber placeholder='请输入预警天数' v-model:value={state.searchParams.warnDay} max={999999999} style='width: 140px !important;' />
              </FormItem>
              <FormItem label='合同逾期天数' class='search-item'>
                <Select placeholder='逾期条件' options={conditionOptions.value} v-model:value={state.searchParams.overdueCondition} style='width: 100px;' />
              </FormItem>
              <FormItem class='search-item'>
                <InputNumber placeholder='请输入逾期天数' v-model:value={state.searchParams.overdueDay} max={999999999} style='width: 140px !important;' />
              </FormItem>
              <FormItem class='search-item'>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              rowKey='id'
              dataSource={dataSource.value}
              columns={columns}
              loading={state.loading}
              pagination={false}
              size='middle' scrollX={1000} scrollY={scrollY.value}
            />
          </>
        )
      },
      'footer-page': () => {
        return (
          <Page
            v-model:current={state.searchParams.pageNumber}
            v-model:pageSize={state.searchParams.pageSize}
            v-model:total={state.searchParams.total}
            onPageChange={changePage}
          />
        )
      }
    }
    return () =>
      <>
        <Layout title='物业管理' v-slots={layoutSlots} />
      </>
  }
})
