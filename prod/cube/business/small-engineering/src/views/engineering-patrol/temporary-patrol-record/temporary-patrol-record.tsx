import { cubeSmallEngineeringService } from '@/api/server'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { Button, Page, PopOver } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive } from 'vue'
import type { TemporaryPatrolRecordVO } from '@ghcloud/cube-small-engineering-service'
import styles from './temporary-patrol-record.module.less'

export const TemporaryPatrolRecord = defineComponent({
  name: 'TemporaryPatrolRecord',
  setup: () => {
    const { pageTitle } = usePageName()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 100,
      period: '',
      keyword: ''
    })

    const columns =
        [
          {
            dataIndex: 'projectName',
            title: '对象名称',
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
            customRender: (): JSX.Element => {
              return (
                <PopOver content={'临时巡检'}>
                  {'临时巡检'}
                </PopOver>
              )
            },
          },
          {
            dataIndex: 'name',
            title: '任务名称',
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
            dataIndex: 'userName',
            title: '巡检人员',
            ellipsis: true,
          },
          {
            dataIndex: 'completeTime',
            title: '巡检时间',
            ellipsis: true,
            customRender: ({ text }: { text: string; }): JSX.Element => {
              const time = dayjs(text).format('YYYY-MM-DD HH:mm')
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
            dataIndex: 'action',
            title: '操作',
            fixed: 'right',
            customRender: ({ record }: { record: TemporaryPatrolRecordVO; }): JSX.Element => {
              return (
                <>
                  <Button
                    type='link' onClick={() => {
                      history.pushState({}, '', `/portal/small-engineering/engineering-temporary-patrol-details?id=${record.id}`)
                    }}
                  >详情
                  </Button>
                </>
              )
            }
          },
        ]

    const formSchema = [
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
        let period = ''
        if (data.period) {
          const times = data.period as string[]
          if (times.length === 2){
            period = `${times[0]} 00:00:00,${times[1]} 23:59:59`
          }
        }
        searchParams.keyword = data.keyword ? data.keyword as string : ''
        searchParams.period = period
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.keyword = ''
        searchParams.period = ''
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
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'SMALL_TEMPORARY_PATROL_RECORD',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeSmallEngineeringService.temporaryPatrolRecord({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          keyword: searchParams.keyword,
          period: searchParams.period,
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