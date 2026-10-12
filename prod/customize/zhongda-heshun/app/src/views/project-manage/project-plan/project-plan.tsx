import { defineComponent, onMounted, reactive } from 'vue'
import { Button, PopOver, Page, Switch, AntModal, message, PopConfirm } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import dayjs from 'dayjs'
import { cubeZhongdaHeshunService } from '@/api/service'
interface SearchParamsType {
  pageNumber: number;
  pageSize: number;
  keyword: string;
  status: string | null;
  enable: string | null;
  submitTime?: string[] | null;
  period?: {
    begin: string;
    end: string;
  };
  total: number;
}
export const ProjectPlan = defineComponent({
  setup: () => {
    const typeSelectOptions = [
      {
        label: '全部',
        value: null,
        color: '#666666'
      },
      {
        label: '生效中',
        value: 'EFFECTIVE',
        color: '#52c41a'
      },
      {
        label: '已停用',
        value: 'DISABLED',
        color: '#8c8c8c'
      },
      {
        label: '已结束',
        value: 'ENDED',
        color: '#f5222d'
      },
      {
        label: '未开始',
        value: 'NOT_STARTED',
        color: '#1890ff'
      }
    ]
    const statusSelectOptions = [
      {
        label: '全部',
        value: null
      },
      {
        label: '启用',
        value: 'ENABLE'
      },
      {
        label: '停用',
        value: 'DISABLE'
      }
    ]
    const { pageTitle } = usePageName()
    const searchParams = reactive<SearchParamsType>({
      pageNumber: 1,
      pageSize: 10,
      enable: null,
      status: null,
      keyword: '',
      submitTime: null,
      total: 100
    })
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '计划状态',
        fieldName: 'status',
        defaultValue: null,
        componentProps: {
          options: typeSelectOptions
        }
      },
      {
        component: 'Select',
        label: '启停状态',
        fieldName: 'enable',
        defaultValue: null,
        componentProps: {
          options: statusSelectOptions
        }
      },
      {
        component: 'RangePicker',
        label: '创建时间',
        fieldName: 'submitTime',
        componentProps: {
          styles: {
            width: '240px'
          },
          valueFormat: 'YYYY-MM-DD',
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'name',
        componentProps: {
          placeholder: '项目计划名称、负责人'
        }
      },
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.pageNumber = 1
        searchParams.keyword = data.name ? data.name as string : ''
        searchParams.status = data.status ? data.status as string : ''
        searchParams.enable = data.enable ? data.enable as string : ''
        searchParams.submitTime = data.submitTime ? data.submitTime as string[] : null
        tableApi.query()
      },
      handleReset: () => {
        searchParams.pageNumber = 1
        searchParams.keyword = ''
        searchParams.status = null
        searchParams.enable = null
        searchParams.submitTime = null
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
    const columns = [
      {
        title: '计划名称',
        dataIndex: 'planName',
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
        title: '负责人',
        dataIndex: 'projectLeaderName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '周期',
        dataIndex: 'taskGenerationCycleConfigs',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: {
          type: string;
          day?: string;
          time: string;
        }[]; }): JSX.Element => {
          let label = ''
          text.map((item) => {
            if (item.type === 'DAILY'){
              label = '每天1次'
            } else if (item.type === 'WEEKLY'){
              label = `每周${text.length}次`
            } else if (item.type === 'MONTHLY'){
              label = `每月${text.length}次`
            }
          })
          return <PopOver content={label || '--'}>{label || '--'}</PopOver>
        }
      },
      {
        title: '生效时间',
        dataIndex: 'beginTime',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '失效时间',
        dataIndex: 'endTime',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const label = typeSelectOptions.find(item => item.value === text)?.label
          const color = typeSelectOptions.find(item => item.value === text)?.color

          return <PopOver content={label || '--'}><span style={{ color: color }}>{label || '--'}</span></PopOver>
        }
      },
      {
        title: '停用/启用',
        dataIndex: 'enableBool',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { enableBool: boolean;planName: string;id: string; }; }): JSX.Element => {
          return (
            <Switch
              v-model:checked={record.enableBool} checkedValue unCheckedValue={false} onChange={() => {
                AntModal.confirm({
                  title: `是否确认${record.enableBool ? '启用' : '禁用'}计划${record.planName}`,
                  onOk: async () => {
                    try {
                      const enable = record.enableBool ? 'ENABLE' : 'DISABLE'
                      await cubeZhongdaHeshunService.changeProjectPlanPage(record.id, enable)
                      message.success(`${record.enableBool ? '启用' : '禁用'}成功`)
                      tableApi.query()
                    } catch (error) {
                      const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
                      message.error(errorMessage || '请求失败')
                    }
                  },
                  onCancel: () => {
                    record.enableBool = !record.enableBool
                  }
                })
              }} checked-children='启用' un-checked-children='禁用'
            />
          )
        },
      },
      {
        title: '创建人',
        dataIndex: 'createName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
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
                  history.pushState({}, '', `/portal/zhongda-heshun/project-plan-edit?id=${record.id}&&type=info`)
                }}
              >详情
              </Button>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/zhongda-heshun/project-plan-edit?id=${record.id}&&type=copy`)
                }}
              >复制
              </Button>
              <PopConfirm
                title='确认删除该项？' onConfirm={async () => {
                  try {
                    // TODO: 请求接口
                    await cubeZhongdaHeshunService.deleteProjectPlan(record.id)
                    message.success('删除成功')
                    tableApi.query()
                  } catch (error) {
                    const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
                    message.error(errorMessage || '请求失败')
                  }
                }}
              >
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'PROJECT_PLAN',
      rowKey: 'id',
      fetchApi: async () => {
        const params: {
          pageNumber: number;
          pageSize: number;
          keyword?: string;
          status?: string;
          enable?: string;
          period?: string | undefined;
        } = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          status: formApi.formValues.status as string ?? '',
          enable: formApi.formValues.enable as string ?? '',
          keyword: formApi.formValues.name as string ?? '',
          period: undefined
        }
        const period = formApi.formValues.submitTime as string[] ?? undefined;
        if (period && period.length > 1){
          params.period = period.join(',')
        }
        return cubeZhongdaHeshunService.getProjectPlanPage(params)
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
      // const schema = {
      //   component: <CubeSelect optionsFetchApi={async () => {
      //     // TODO: 接口请求
      //     return new Promise(() => {
      //       return {}
      //     })
      //   }}
      //   />,
      //   label: '项目类型',
      //   fieldName: 'typeId',
      //   defaultValue: null,
      //   componentProps: {
      //     placeholder: '请选择',
      //     onChange: (value: string): void => {
      //       searchParams.pageNumber = 1
      //       searchParams.typeId = value
      //       tableApi.query()
      //     }
      //   }
      // }
      // formApi.updateFieldSchema(schema)
    })
    const slots = {
      'layout-header': (): JSX.Element =>
        <Button type='primary'
          onClick={() => {
            history.pushState({}, '', '/portal/zhongda-heshun/project-plan-edit?type=create')
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
      <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />
    )
  }
})
