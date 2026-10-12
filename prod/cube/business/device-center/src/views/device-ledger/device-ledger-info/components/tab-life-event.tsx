import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select } from '@ghcloud/cube-ui'
import '@/styles/common.less'
import dayjs from 'dayjs'
import { useTableScroll } from '@/hook/use-table-scroll'
import { cubeDeviceSuperviseService } from '@/api/service'
import { logger } from '@/logger'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'

interface LifeState {
  id: string | number;
  url: string;
  eventId: string;
  eventType: string;
  applicationCode: string;
  processInstanceId: string;
  eventTypeName: string;
}
export const TabLifeEvent = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
  },
  setup (props) {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      eventType: undefined,
      period: [],
    })
    const columns = [
      {
        title: '时间',
        dataIndex: 'eventTime',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '事件类型',
        dataIndex: 'eventTypeName',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '事件名称',
        dataIndex: 'eventName',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '事件状态',
        dataIndex: 'eventStatus',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        customRender: ({ record }: { record: LifeState; }): JSX.Element=> {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                goDetail(record)
              }}>详情</Button>
            </>
          )
        }
      }
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
          deviceId: props.id,
          eventType: formState.eventType,
          period: formState.period ? formState.period.join(',') : ''
        }
        const res = await cubeDeviceSuperviseService.getDeviceLifeEvents(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
        logger.error(error)
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
      formState.period = []
      formState.eventType = undefined
      queryForm()
    }
    const eventTypeOptions = ref<{ label: string; value: string; }[]>([])
    const getQuery = async (): Promise<void> => {
      try {
        const res = await cubeDeviceSuperviseService.getDeviceLifeEventTypes(props.id)
        eventTypeOptions.value = Object.keys(res).map((key: number | string) => {
          return {
            label: res[(key as number)] as string,
            value: key as string,
          }
        })
      } catch {

      }
    }
    const goDetail = (record: LifeState): void => {
      let target = ''
      const baseFlowEngine = [
        'ATTENDANCE_MANAGEMENT',
        'PERSONNELMANAGEMENT',
        'OFFICIAL_MANAGEMENT',
        'WORK_REPORT',
        'SMALLENFINEERING',
        'HIDDENDANGER',
        'FAULT',
        'OUTSOURCE_REPAIR',
        'RETROFIT',
      ]
      if (baseFlowEngine.includes(record.applicationCode)) {
        target = `/portal/stream-engine-render/index?businessType=${record.eventType}&processInstanceId=${record.processInstanceId}&type=detail&title=${record.eventTypeName}&appName=agencyCenter`
      } else {
        target = `${record.url}?type=detail&id=${record.eventId}&businessKey=${record.eventType}`
      }
      history.pushState({ current: location.pathname + location.search }, '', target)
    }
    const { tabScrollY } = useTableScroll()
    onMounted(() => {
      getQuery()
      getTableData()
    })
    return (): JSX.Element =>
      <>
        <Form layout='inline' style={{ margin: '10px 0 ' }}>
          <FormItem label='事件类型' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
            <Select
              v-model:value={formState.eventType}
              placeholder='请选择事件类型'
              options={eventTypeOptions.value}
              style={{ width: '180px' }}
              onChange={() => getTableData}
            />
          </FormItem>
          <FormItem label='时间范围' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
            <DateRangePicker v-model:value={formState.period} onChangePicker={() => getTableData} />
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
          tableCode={`${tableCode}LifeEvent`}
          pagination={false}
          scrollY={tabScrollY.value - 20}
          applicationCode={__ENV__.applicationCode}
        />
        {
          dataSource.value.length > 0 &&
            <Page
              class='mt-20px'
              style={{ marginTop: '20px', display: 'flex', justifyContent: 'right' }}
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />
        }
      </>
  }
})
