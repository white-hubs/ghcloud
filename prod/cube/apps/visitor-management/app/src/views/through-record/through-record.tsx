import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeVisitorManagementService } from '@/api/service'
import dayjs from 'dayjs'
import { EnterOrExit, colorDescriptions } from '@ghcloud/cube-visitor-management-service/src/types'

/** 通行记录 */
export const ThroughRecord = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive({
      name: '',
      period: [],
    })
    /**
     * 进出门类型，0 - 开门，1 - 进门，2 - 出门
     */

    const statusOptions = ref([
      { label: '开门', value: EnterOrExit.OPEN },
      { label: '进门', value: EnterOrExit.ENTER },
      { label: '出门', value: EnterOrExit.OUT },
    ])
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      // {
      //   title: '区域',
      //   dataIndex: 'areaName',
      //   ellipsis: true,
      //   width: 180,
      //   customRender: ({ text }: { text: string; }) => {
      //     return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      //   }
      // },
      {
        title: '方向',
        dataIndex: 'enterOrExit',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: EnterOrExit; }): JSX.Element => {
          const textVal = typeof text === 'number' || text !== null
            ? statusOptions.value.find(s => s.value === text)?.label || ''
            : '';
          return (
            <PopOver content={textVal || '--'}>
              <span style={{ color: colorDescriptions[text] }}>{textVal || '--'}</span>
            </PopOver>
          )
        }
      },
      {
        title: '通行时间',
        dataIndex: 'swingTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '通行人姓名',
        dataIndex: 'personName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '通行人ID',
        dataIndex: 'personId',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
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
          period: formState.period ? formState.period.join(',') : formState.period,
        }
        const res = await cubeVisitorManagementService.getPassRecordPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
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
      formState.period = []
      queryForm()
    }
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='通行时间'>
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem label='通行人' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.name} placeholder='请输入姓名' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} />
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
        <Layout title={pageTitle ?? '通行记录'} v-slots={layoutSlots} />
      </>
  }
})
