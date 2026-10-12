
import { defineComponent, reactive } from 'vue'
import styles from './patrol-records.module.less'
import { PopOver, Page, Button } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import { InspectBusinessType, type InspectRecordVo } from '@ghcloud/cube-daily-inspection-service'
import dayjs from 'dayjs'
export const PatrolRecords = defineComponent({
  setup: () => {
    const resultSelectOptions = [
      {
        label: '正常',
        value: 'NORMAL'
      }, {
        label: '异常',
        value: 'ABNORMAL',
      }
    ]
    const { pageTitle } = usePageName()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      result: '',
      total: 100,
      period: '',
      keyword: ''
    })
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '巡查结果',
        fieldName: 'result',
        defaultValue: null,
        componentProps: {
          placeholder: '巡查结果',
          options: resultSelectOptions,
          onChange: (value: string): void => {
            searchParams.result = value
            searchParams.pageNumber = 1
            tableApi.query()
          }
        },
      },
      {
        component: 'RangePicker',
        label: '巡检时间',
        fieldName: 'period',
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
        }
      },

      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '名称'
        }
      },
    ]
    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? data.keyword as string : ''
        searchParams.period = data.period ? (data.period as string[]).join(',') : ''
        searchParams.result = data.result ? data.result as string : ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.keyword = ''
        searchParams.period = ''
        searchParams.result = ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      schema: formSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    })

    /**
     * 表格
     */
    const columns =
    [
      {
        dataIndex: 'targetName',
        title: '对象名称',
        slots: {
          customRender: 'targetName',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'inspectMethod',
        title: '巡检方式',
        ellipsis: true,
      },
      {
        dataIndex: 'taskName',
        title: '任务名称',
        ellipsis: true,
      },
      {
        dataIndex: 'nickname',
        title: '巡检人员',
        ellipsis: true,
      },
      {
        dataIndex: 'time',
        title: '巡检时间',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return (
            <PopOver
              content={time || ''}
            >
              {time || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'result',
        title: '结果',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text ? (text === 'NORMAL' ? '正常' : '异常') : ''}
            >
              <span class={text?.toLocaleLowerCase()}>
                {text ? (text === 'NORMAL' ? '正常' : '异常') : '--'}
              </span>
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'errNames',
        title: '异常明细',
        ellipsis: true,
      },
      {
        dataIndex: 'action',
        title: '操作',
        fixed: 'right',
        customRender: ({ record }: { record: InspectRecordVo; }): JSX.Element => {
          return (
            <>
              <Button
                type='link' onClick={() => {
                  history.pushState({}, '', `/portal/small-engineering/engineering-patrol-record-info?id=${record.id}`)
                }}
              >详情
              </Button>
            </>
          )
        }
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'SMALL_INSPECTION_RECORD',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeDailyInspectionService.getInspectRecordList({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          result: searchParams.result,
          keyword: searchParams.keyword,
          period: searchParams.period,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      }
    })
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    const slots = {
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={searchParams.pageNumber}
            pageSize={searchParams.pageSize}
            total={searchParams.total}
            onPageChange={handleChange}
          />
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout class={styles.container} title={pageTitle} v-slots={slots} showTableXScroll />
    )
  }
})
