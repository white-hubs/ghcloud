import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Table, Select, ImagePreviewGroup, Image } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import './index.less'
import { getComplaintPage } from '@/api/operation'
import dayjs from 'dayjs'

export const EnterpriseComplaint = defineComponent({
  setup: () => {
    const columns = [
      {
        title: '用户类型',
        dataIndex: 'userType',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '用户名称',
        dataIndex: 'username',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '内容',
        dataIndex: 'content',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '投诉建议',
        dataIndex: 'sortType',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '提交时间',
        dataIndex: 'createTime',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '回复内容',
        dataIndex: 'contentReply',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '回复时间',
        dataIndex: 'replyTime',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '图片',
        dataIndex: 'imgUrl',
        ellipsis: true,
        width: '120px',
        customRender: (text: unknown) => {
          const value = text as { path: string; }[]
          if (!value) return '--'
          if (!value.length) return '--'
          return (
            <>
              <ImagePreviewGroup>
                {value.map((item, index) => {
                  return <Image src={item?.path || item } width={60} height={60} key={item?.path || index} />
                })}
              </ImagePreviewGroup>
            </>
          )
        }
      },
    ]
    const dataSource = ref<unknown[]>([])
    const searchPeriod = ref<string[]>([])
    const statusOptions = ref([
      { label: '未处理', value: '1' },
      { label: '处理中', value: '2' },
      { label: '处理完成', value: '3' },
    ])
    const state = reactive({
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        status: null,
        total: 0,
      },
    })
    const getTableData = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          status: state.searchParams.status,
          period: searchPeriod.value ? searchPeriod.value.join(',') : '',
        }
        const res = await getComplaintPage(params)
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
        status: null,
        total: 0
      }
      state.searchParams = initParams
      searchPeriod.value = []
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
              <FormItem label='提交时间' class='search-item'>
                <DateRangePicker v-model:value={searchPeriod.value} valueFormat='YYYY-MM-DD' />
              </FormItem>
              <FormItem label='处理状态' class='search-item'>
                <Select placeholder='请选择处理状态' options={statusOptions.value} v-model:value={state.searchParams.status} style='min-width: 150px;' />
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
        <Layout title='企业投诉' v-slots={layoutSlots} />
      </>
  }
})
