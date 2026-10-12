import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, DateRangePicker } from '@ghcloud/cube-ui'
import { getTaskPage } from '@/api/price-task'
import type { RecordState, InsertState } from './index.i'
import '@/styles/common.less'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'

export const PriceRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      name: '',
      period: '',
    })
    const columns = [
      {
        title: '采价人',
        dataIndex: 'userList',
        code: 'userList',
        ellipsis: true,
        customRender: ({ record }: { record: { userList: []; }; }): JSX.Element => {
          const { userList } = record

          const users = userList ? userList.map((item: { userName: string; }) => {
            return item.userName
          }) : []

          const text = users.length > 0 ? users.join(',') : ''
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价时间',
        dataIndex: 'createTime',
        code: 'createTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '任务名称',
        dataIndex: 'name',
        code: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价商品',
        dataIndex: 'goodsCategoryList',
        code: 'goodsCategoryList',
        ellipsis: true,
        customRender: ({ record }: { record: { goodsCategoryList: []; }; }): JSX.Element => {
          const { goodsCategoryList } = record

          const categorys = goodsCategoryList ? goodsCategoryList.map((item: { name: string; }) => {
            return item.name
          }) : []

          const text = categorys.length > 0 ? categorys.join(',') : ''
          return (
            <>
              <PopOver content={text || '--'}>{text || '--'}</PopOver>
            </>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        code: 'action',
        width: 180,
        customRender: ({ record }: { record: RecordState & InsertState & { secretKey: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                toDetail(record, 'detail')
              }}>详情</Button>
            </>
          )
        }
      }
    ]
    const loading = ref(false)
    const dataSource = ref<RecordState[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          name: formState.name,
          period: formState.period ? formState.period.toString() : '',
        }
        const res = await getTaskPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          pagination.value.total = total
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.name = ''
      formState.period = ''
      queryForm()
    }
    const toDetail = (record: RecordState, type: 'detail' | 'edit' | 'copy'): void => {
      history.pushState({ current: location.pathname + location.search }, '',
        `/portal/goods-purchase-price/record-detail?id=${record.id}&action=${type}&searchVal=${JSON.stringify(formState)}`)
    }
    onMounted(() => {
      getTableData()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 ' }}>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.name} placeholder='请输入任务/采价人名称' showCount={false} allowclear />
              </FormItem>
              <FormItem label='采价时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              scrollY={500}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
