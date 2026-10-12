import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { Button, PopOver, Page, message, PopConfirm } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import dayjs from 'dayjs'
import { ProjectTaskAdd } from './project-task-add'
import { ProjectSelect } from '@/components/project-select/project-select'
import { cubeZhongdaHeshunService } from '@/api/service'
interface Place {
  id: string;
  dataName: string;
  count: number;
}
interface Props {
  tableCode: string;
}
export const ProjectTaskTemplate = defineComponent({
  props: {
    tableCode: {
      type: String,
      required: true
    },
  },
  setup: (props: Props) => {
    watch(() => props.tableCode, () => {
      data.value = null
    })
    const isAddMode = ref(false)
    const taskTypeId = ref()
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
        label: '已完成',
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
        component: <ProjectSelect showAll={true} />,
        label: '所属项目',
        fieldName: 'projectId',
      },
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
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      typeId: '',
      keyword: '',
      total: 0
    })
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.pageNumber = 1
        searchParams.keyword = data.name ? data.name as string : ''
        tableApi.query()
      },
      handleReset: () => {
        searchParams.pageNumber = 1
        searchParams.keyword = ''
        searchParams.status = ''
        searchParams.typeId = ''
        tableApi.query()
      },
      schema: formSchema,

      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    })

    const handleAdd = (): void => {
      isAddMode.value = true
    }

    const handleCancelAdd = (): void => {
      isAddMode.value = false
    }

    const handleSaveAdd = (): void => {
      isAddMode.value = false
      tableApi.query()
    }

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
        customRender: ({ record }: { text: string;record: Record<string, string>; }): JSX.Element => {
          const newNotificationType = record.notificationType
          let label = ``
          switch (newNotificationType) {
            case 'GROUP':
              label = `小组-${record.notificationGroupName}`
              break;
            case 'DEPT':
              label = `部门-${record.notificationDeptName}`
              break;
            case 'POST':
              label = `岗位-${record.notificationPostName}`
              break;
            case 'ROLE':
              label = `角色-${record.notificationRoleName}`
              break;
            default:
              label = '--'
          }
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
        dataIndex: 'time',
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

              <PopConfirm
                title='确认终止该任务？' onConfirm={async () => {
                  try {
                    // TODO: 请求接口
                    await cubeZhongdaHeshunService.updateTaskList(record.id)
                    message.success('终止成功')
                    tableApi.query()
                  } catch (error) {
                    const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
                    message.error(errorMessage || '请求失败')
                  }
                }}
              >
                <Button type='link' size='small' danger>任务终止</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const data = ref()
   
    const [CubeTable, tableApi] = useCubeTable({
      dataSource: data.value,
      columns,
      tableCode: props.tableCode,
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          projectId: formApi.formValues.projectId as string ?? '',
          status: formApi.formValues.status as string ?? '',
          keyword: formApi.formValues.name as string ?? '',
          taskTypeId: taskTypeId.value,
        }
        const time = formApi.formValues.submitTime as string[]
        let deadLinePeriod = {}
        if (time && time.length > 1){
          deadLinePeriod = time.join(',')

          Object.assign(params, { deadLinePeriod })
        }
        if (!taskTypeId.value){
          return {
            records: [],
            total: 0,
            pages: 1,
          }
        }
        return cubeZhongdaHeshunService.getTaskList(params)
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

    onMounted(async () => {
      const response = await cubeZhongdaHeshunService.getTypeAllList({ dataType: 'TASK' }) as Place[]
      taskTypeId.value = response.find(item => item.dataName === pageTitle)?.id
      tableApi.query()
    })
    const slots = {
      'layout-header': (): JSX.Element =>
        <Button type='primary'
          onClick={() => {
            // 新增
            handleAdd()
          }}
        >新增 </Button>,
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
      <> {!isAddMode.value ? <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll /> : (
        <ProjectTaskAdd onCancel={handleCancelAdd} taskTypeId={taskTypeId.value} onSave={handleSaveAdd} />
      )}</>
    )
  }
})