
import { defineComponent, onMounted, reactive } from 'vue'
import { Button, PopOver, Page, Switch, AntModal, message, PopConfirm } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable, CubeSelect } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import dayjs from 'dayjs'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
import { appFunctionCodes } from '@/permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'
export const PatrolPlan = defineComponent({
  setup: () => {
    const RadioSelectOptions = [
      {
        label: '全部',
        value: ''
      },
      {
        label: '执行中',
        value: 'EXECUTING'
      },
      {
        label: '已结束',
        value: 'OVER'
      },
      {
        label: '已停用',
        value: 'STOP'
      }
    ]
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.projectPatrol
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      typeId: '',
      keyword: '',
      total: 100
    })

    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'RadioGroup',
        label: '',
        fieldName: 'status',
        defaultValue: '',
        componentProps: {
          options: RadioSelectOptions,
          buttonStyle: 'solid',
          optionType: 'button',
          onChange: (e: { target: { value: string; }; }): void => {
            searchParams.pageNumber = 1
            searchParams.status = e.target.value
            tableApi.query()
          }
        },
      },
      {
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        defaultValue: null,
        componentProps: {
          styles: {
            width: '200px'
          },
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' }
          ]
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'name',
        componentProps: {
          placeholder: '名称'
        }
      },
    ]
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
    /**
     * 表格
     */
    const columns = [
      {
        dataIndex: 'name',
        title: '名称',
        align: 'center',
        slots: {
          customRender: 'name',
        },
        ellipsis: true,
        width: 100,
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
        align: 'center',
        slots: {
          customRender: 'typeName',
        },
        ellipsis: true,
        width: 100,
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
        width: 100,
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
        width: 100,
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
        width: 100,
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
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): string => {
          if (text === 'EXECUTING') {
            return '执行中'
          } else if (text === 'OVER') {
            return '已结束'
          } else if (text === 'STOP') {
            return '已停用'
          } else {
            return '--'
          }
        },
      },
      {
        dataIndex: 'createByName',
        title: '创建人',
        align: 'center',
        slots: {
          customRender: 'createByName',
        },
        width: 100,
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
        width: 100,
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
        width: 100,
        slots: {
          customRender: 'enable',
        },
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
                        businessType: InspectBusinessType.SMALL_ENGINEERING
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
        fixed: 'right',
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
                  history.pushState({}, '', `/portal/small-engineering/engineering-patrol-plan-edit?type=info&id=${record.id}`)
                }}
              >详情
              </Button>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/small-engineering/engineering-patrol-plan-edit?type=edit&id=${record.id}`)
                }}
              >编辑
              </Button>
              <Button
                type='link' size='small' onClick={() => {
                  history.pushState({}, '', `/portal/small-engineering/engineering-patrol-plan-edit?type=copy&id=${record.id}`)
                }}
              >复制
              </Button>
              <PopConfirm
                title='确认删除该项？' onConfirm={async () => {
                  try {
                    await cubeDailyInspectionService.deleteInspectPlan(record.id, InspectBusinessType.SMALL_ENGINEERING)
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
      tableCode: 'INSPECTION_PLAN',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeDailyInspectionService.getInspectPlanList({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          status: searchParams.status,
          keywords: searchParams.keyword,
          businessType: InspectBusinessType.SMALL_ENGINEERING,
          typeId: searchParams.typeId,
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
    onMounted(async () => {
      const schema = {
        component: <CubeSelect optionsFetchApi={async () => {
          return cubeDailyInspectionService.getInspectTypeList({
            businessType: InspectBusinessType.SMALL_ENGINEERING
          })
        }}
        />,
        label: '巡检类型',
        fieldName: 'typeId',
        defaultValue: null,
        componentProps: {
          placeholder: '请选择',
          onChange: (value: string): void => {
            searchParams.pageNumber = 1
            searchParams.typeId = value
            tableApi.query()
          }
        }
      }
      formApi.updateFieldSchema(schema)
    })
    const slots = {
      'layout-header': (): JSX.Element =>
       <>{hasPermission(permission.createPlan)&&<Button
          type='primary' onClick={() => {
            history.pushState({}, '', '/portal/small-engineering/engineering-patrol-plan-edit?type=create')
          }}
        >新增
        </Button>}</> ,
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
