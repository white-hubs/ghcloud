
import { defineComponent, onMounted, reactive } from 'vue'
import { Button, PopOver, Page, PopConfirm, message, Switch, AntModal } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import dayjs from 'dayjs'
import { PlanStatusColor, PlanStatusMap, PlanStatusOptions } from '@ghcloud/cube-daily-inspection-service'

export const InspectPlan = defineComponent({

  setup: () => {
    const { pageTitle } = usePageName()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      typeId: '',
      keyword: '',
      total: 0
    })
    /**
     * 表格
     */
    const columns = [
      {
        dataIndex: 'name',
        title: '计划名称',
        slots: {
          customRender: 'name',
        },
        align: 'center',
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
        dataIndex: 'typeName',
        title: '巡检类型',
        slots: {
          customRender: 'typeName',
        },
        align: 'center',
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
        dataIndex: 'receiveType',
        title: '执行部门/人',
        align: 'center',
        slots: {
          customRender: 'receiveType',
        },
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string>; }): JSX.Element | string => {
          if (text === '1') {
            return (
              <PopOver
                content={record?.receiveNames ? record?.receiveNames : ''}
              >
                {record?.receiveNames ? record?.receiveNames : '--'}
              </PopOver>
            )
          } else {
            if (record?.receiveDeptNames && record?.receivePostNames) {
              return (
                <PopOver
                  content={
                    record?.receiveDeptNames + '/' + record?.receivePostNames
                  }
                >
                  {record?.receiveDeptNames + '/' + record?.receivePostNames}
                </PopOver>
              )
            } else if (record?.receiveDeptNames || record?.receivePostNames) {
              return (
                <PopOver
                  content={
                    record?.receiveDeptNames + record?.receivePostNames
                  }
                >
                  {record?.receiveDeptNames + record?.receivePostNames}
                </PopOver>
              )
            } else if (record?.receiveRoleNames) {
              return (
                <PopOver
                  content={
                    record?.receiveRoleNames
                  }
                >
                  {record?.receiveRoleNames}
                </PopOver>
              )
            } else {
              return '--'
            }
          }
        },
      },
      {
        dataIndex: 'targetNum',
        title: '巡检对象数',
        align: 'center',
        slots: {
          customRender: 'targetNum',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text || '--'}
            >
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'validEndTime',
        title: '失效时间',
        align: 'center',
        slots: {
          customRender: 'validEndTime',
        },
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return (
            <PopOver
              content={time}
            >
              {time}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'status',
        title: '状态',
        align: 'center',
        slots: {
          customRender: 'status',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const textVal = text ? PlanStatusMap.get(text) : ''
          return (
            <PopOver
              content={textVal || ''}
            >
              <span style={{ color: PlanStatusColor.get(text || '')}}>{textVal || '--'}</span>
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'createByName',
        title: '创建人',
        align: 'center',
        slots: {
          customRender: 'createByName',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text}
            >
              {text}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'createTime',
        title: '创建时间',
        align: 'center',
        slots: {
          customRender: 'createTime',
        },
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return (
            <PopOver
              content={time}
            >
              {time}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'enable',
        title: '停用/启用',
        align: 'center',
        slots: {
          customRender: 'enable',
        },
        fixed: 'right',
        customRender: ({ record }: { record: { enable: boolean;name: string;id: string; }; }): JSX.Element => {
          return (
            <Switch
              v-model:checked={record.enable} checkedValue unCheckedValue={false} onChange={() => {
                AntModal.confirm({
                  title: `是否确认${record.enable ? '启用' : '禁用'}计划${record.name}`,
                  onOk: async () => {
                    try {
                      await cubeDailyInspectionService.updatePlanStatus({
                        id: record.id,
                        startFlag: record.enable,
                      })
                      message.success(`${record.enable ? '启用' : '禁用'}成功`)
                      tableApi.query()
                    } catch (error) {
                      const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
                      message.error(errorMessage || '请求失败')
                    }
                  },
                  onCancel: () => {
                    record.enable = !record.enable
                  }
                })
              }} checked-children='启用' un-checked-children='禁用'
            />
          )
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
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
                  history.pushState({}, '', `/portal/daily-inspection/inspect-plan-edit?type=info&id=${record.id}`)
                }}
              >详情
              </Button>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/daily-inspection/inspect-plan-edit?type=edit&id=${record.id}`)
                }}
              >编辑
              </Button>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/daily-inspection/inspect-plan-edit?type=copy&id=${record.id}`)
                }}
              >复制
              </Button>
              <PopConfirm
                title='确认删除该项？' onConfirm={async () => {
                  try {
                    await cubeDailyInspectionService.deleteInspectPlan(record.id)
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
      tableCode: 'DAILY_INSPECTION_PLAN',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeDailyInspectionService.getInspectPlanList({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          status: searchParams.status,
          keywords: searchParams.keyword,
          typeId: searchParams.typeId,
        })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      },
    })
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '状态',
        fieldName: 'status',
        defaultValue: '',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '全部',
              value: ''
            },
            ...Object.keys(PlanStatusOptions).map((item) => {
              return {
                label: PlanStatusOptions[item as keyof typeof PlanStatusOptions],
                value: item
              }
            })
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1
            searchParams.status = value
            tableApi.query()
          }
        },
      },
      {
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        componentProps: {

        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '计划名称'
        }
      },
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query() // URL/session 回填后自动首查
      },
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? data.keyword as string : ''
        searchParams.pageNumber = 1
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
      showCollapseButton: true
    })
    onMounted(async () => {
      const result = await cubeDailyInspectionService.getInspectTypeList()
      const schema = {
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        defaultValue: '',
        componentProps: {
          options: result,
          placeholder: '请选择',
          allowClear: true,
          fieldNames: { label: 'name', value: 'id' },
          onChange: (value: string): void => {
            searchParams.pageNumber = 1
            searchParams.typeId = value
            tableApi.query()
          }
        }
      }
      formApi.updateFieldSchema(schema)
      formApi.formValues.typeId = searchParams.typeId
    })
    const slots = {
      'layout-header': (): JSX.Element =>
        <Button
          type='primary' onClick={() => {
            history.pushState({}, '', '/portal/daily-inspection/inspect-plan-edit?type=create')
          }}
        >新增
        </Button>,
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
