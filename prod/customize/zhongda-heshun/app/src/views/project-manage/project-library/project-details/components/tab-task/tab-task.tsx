import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, PopOver, Page, Table } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { useCubeForm } from '@ghcloud/cube-app-design'
import dayjs from 'dayjs'
import styles from './tab-task.module.less'
import { cubeZhongdaHeshunService } from '@/api/service'
import { useTableScroll } from '@/hook/use-table-scroll'
import type { ProjectFileVO } from '@ghcloud/cube-zhongda-heshun-service'
interface Place {
  id: string;
  dataName: string;
  count: number;
}
interface Props {
  projectId: string;
}

export const TabProjectTask = defineComponent({
  name: 'TabProjectTask',
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  setup: (props: Props) => {
    const taskTypeId = ref()
    const tableData = ref<ProjectFileVO[]>([])
    const loading = ref(false)
    const typeOptions = ref(
      {
        'GROUP': '小组',
        'DEPT': '部门',
        'POST': '岗位',
        'ROLE': '角色'
      }
    )
    const statusSelectOptions = [
      {
        label: '全部',
        value: null,
        color: '#666666'
      },
      {
        label: '待接收',
        value: 'WAIT_RECEIVE',
        color: '#faad14'
      },
      {
        label: '待执行',
        value: 'WAIT_EXECUTE',
        color: '#1890ff'
      },
      {
        label: '进行中',
        value: 'EXECUTING',
        color: '#52c41a'
      },
      {
        label: '已结束',
        value: 'FINISHED',
        color: '#722ed1'
      },
      {
        label: '已终止',
        value: 'TERMINATED',
        color: '#f5222d'
      },
      {
        label: '已过期',
        value: 'EXPIRED',
        color: '#8c8c8c'
      }
    ]
    const { pageTitle } = usePageName()
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '任务状态',
        fieldName: 'status',
        defaultValue: null,
        componentProps: {
          options: statusSelectOptions
        }
      },
      {
        component: 'RangePicker',
        label: '截止时间',
        fieldName: 'submitTime',
        componentProps: {
          styles: {
            width: '240px',
          },
          valueFormat: 'YYYY-MM-DD',
        },
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'name',
        componentProps: {
          placeholder: '名称、人员搜索'
        }
      },

    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.pageNumber = 1
        searchParams.keyword = data.name ? data.name as string : ''
        getData()
      },
      handleReset: () => {
        searchParams.pageNumber = 1
        searchParams.keyword = ''
        searchParams.status = ''
        searchParams.typeId = ''
        getData()
      },
      schema: formSchema,

      showCollapseButton: true
    })

    const { scrollY } = useTableScroll()

    /**
     * 表格
     */
    const columns = [
      {
        title: '名称',
        dataIndex: 'taskName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属项目',
        dataIndex: 'projectName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '任务区域',
        dataIndex: 'taskAreaName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '任务时限',
        dataIndex: 'taskTimeLimitConfigStr',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          let time = null
          try {
            time = JSON.parse(text)
          } catch {
            time = null
          }
          let label = ''
          if (time){
            label = `${time.day ?? 0}天 ${time.hour ?? 0}时 ${time.minute ?? 0}分`
          }
          return <PopOver content={label || '--'}>{label || '--'}</PopOver>
        }
      },
      {
        title: '项目负责人',
        dataIndex: 'projectLeaderName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '执行小组长',
        dataIndex: 'notificationGroupName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text, record }: { text: string;record: Record<string, string>; }): JSX.Element => {
          const newNotificationType = record.notificationType as 'GROUP' | 'DEPT' | 'POST' | 'ROLE'
          const label = `${typeOptions.value[newNotificationType]} - ${text}`
          return <PopOver content={label || '--'}>{label || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const label = statusSelectOptions.find(item => item.value === text)?.label
          const color = statusSelectOptions.find(item => item.value === text)?.color
          return <PopOver content={label || '--'}> <span style={{ color: color }}>{label || '--'}</span> </PopOver>
        }
      },
      {
        title: '截止时间',
        dataIndex: 'deadline',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        align: 'center',
        slots: {
          customRender: 'action',
        },
        fixed: 'right',
        width: 200,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/zhongda-heshun/project-task-detail?id=${record.id}`)
                }}
              >详情
              </Button>


            </>
          )
        }
      },
    ]

    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      typeId: '',
      keyword: '',
      total: 0
    })
    const getData = async (): Promise<void> => {
      loading.value = true
      try {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          projectId: props.projectId as string ?? '',
          status: formApi.formValues.status as string ?? '',
          keyword: formApi.formValues.keyword as string ?? '',
          taskTypeId: taskTypeId.value,
        }
        const time = formApi.formValues.submitTime as string[]
        let deadLinePeriod = {}
        if (time && time.length > 1){
          deadLinePeriod = {
            begin: time[0],
            end: time[1]
          }
          Object.assign(params, { deadLinePeriod })
        }
        const data = await cubeZhongdaHeshunService.getTaskList(params)
        searchParams.total = data.total
        tableData.value = data.records
      } finally {
        loading.value = false
      }
    }

    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      getData()
    }

    onMounted(async () => {
      const response = await cubeZhongdaHeshunService.getTypeAllList({ dataType: 'TASK' }) as Place[]
      taskTypeId.value = response.find(item => item.dataName === pageTitle)?.id
      getData()
    })

    return (): JSX.Element => (
      // <> <CubeLayout showHeader={false} title={pageTitle} v-slots={slots} /></>
      <div class="layout-content-main">
        <div class={styles['layout-content-right']}>
          <CubeForm />
          {/* <CubeTable />
           */}
          <Table columns={columns} dataSource={tableData.value} loading={loading.value} scrollY={scrollY.value - 150} pagination={false}></Table>

          <div class={styles['layout-content-right-footer']}>
            <Page
              current={searchParams.pageNumber}
              pageSize={searchParams.pageSize}
              total={searchParams.total}
              onPageChange={handleChange}
            />
          </div>

        </div>
      </div>
    )
  }
})