import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeFormAuditService } from '@/api/service'
import { CubeLayout, useCubeForm, useCubeTable, DeptCascaderSelect } from '@ghcloud/cube-app-design'
import { BusinessTypeSelect } from '@/components/business-type-select/business-type-select'
import { PopOver, Page, Space, Button, message, DateRangePicker, Input, Select, Modal, PopConfirm } from '@ghcloud/cube-ui'
import dayjs from "dayjs";
import { flowStatus, statusText } from '@/utils'
import type { FlowProcessVO } from '@ghcloud/cube-form-audit-service'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission/index'


/** 工单列表 */
export const WorkOrderRecord = defineComponent({
  setup: () => {
    const route = useRoute()
    /**
     * 「我的」与「全部」：优先按路由 name（与 router 双入口一致），兼容旧链接 `?isUser=true`
     */
    const isUserQueryMode = computed((): boolean => {
      if (route.name === 'work-order-mine') {
        return true
      }
      if (route.name === 'work-order-record') {
        return false
      }
      return false
    })

    const permission = appFunctionCodes.workOrderRecord ?? null
    const hasDeletePermission = permission && hasPermission(permission.deleted)

    const { pageTitle } = usePageName()

    // 删除确认弹窗相关状态
    const deleteModalVisible = ref(false)
    const deleteLoading = ref(false)
    const deleteModalTitle = ref('')
    const deleteModalContent = ref('')
    const deleteIds = ref<string[]>([])
    const selectedRowKeysData = ref<string[]>([])

    /**
     * 执行删除工单操作
     */
    const deleteWorkOrder = async (ids: string[]): Promise<void> => {
      deleteLoading.value = true
      try {
        await cubeFormAuditService.deleteWorkOrder(ids)
        message.success('删除成功')
        tableApi.query()
      } catch {
        message.error('删除失败')
      } finally {
        deleteLoading.value = false
        closeDeleteModal()
      }
    }

    const deleteRow = async (id: string): Promise<void> => {
      tableApi.loading.value = true
      try {
        await cubeFormAuditService.deleteWorkOrder([id])
        message.success('删除成功')
        tableApi.query()
      } catch {
        message.error('删除失败')
      } finally {
        tableApi.loading.value = false
      }
    }


    /**
     * 打开删除确认弹窗（批量删除）
     */
    const openBatchDeleteModal = (): void => {
      if (selectedRowKeysData.value.length === 0) {
        return
      }
      deleteModalTitle.value = '确认删除'
      deleteModalContent.value = `确定要删除选中的 ${selectedRowKeysData.value.length} 项工单吗？`
      deleteIds.value = [...selectedRowKeysData.value]
      deleteModalVisible.value = true
    }

    /**
     * 关闭删除确认弹窗
     */
    const closeDeleteModal = (): void => {
      deleteModalVisible.value = false
      deleteModalTitle.value = ''
      deleteModalContent.value = ''
      deleteIds.value = []
    }

    /**
     * 确认删除操作
     */
    const confirmDelete = (): void => {
      if (deleteIds.value.length > 0) {
        deleteWorkOrder(deleteIds.value)
      }
    }

    const columns = [
      {
        title: '编号',
        dataIndex: 'formNo',
        ellipsis: true,
        width: 200,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '申请名称',
        dataIndex: 'instanceName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text ?? '--'}>
              {text ?? '--'}
            </PopOver>
          )
        },
      },
      {
        title: '发起人',
        dataIndex: 'startUserName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text ?? '--'}>
              {text ?? '--'}
            </PopOver>
          )
        },
      },
      {
        title: '发起部门',
        dataIndex: 'organizationName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text ?? '--'}>
              {text ?? '--'}
            </PopOver>
          )
        },
      },
      {
        title: '发起时间',
        dataIndex: 'submitedTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const value = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
          return (
            <PopOver content={value}>
              {value}
            </PopOver>
          )
        },
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const value = text ? statusText(text) : "-";
          return (
            <PopOver content={value}>
              {value}
            </PopOver>
          )
        },
      },
      {
        title: '处理进度',
        dataIndex: 'activeNodeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        customRender: ({ record }: { record: FlowProcessVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                goDetail(record)
              }}>详情</Button>
              {hasDeletePermission && (
                <PopConfirm
                  title='是否确认删除?'
                  ok-text='确定'
                  cancel-text='取消'
                  onConfirm={() => {
                    if (record.processInstanceId) {
                      deleteRow(record.processInstanceId)
                    }
                  }}
                >
                  <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
                </PopConfirm>
              )}
            </>
          )
        }
      }

    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        tableApi.query()
      },
      handleReset: () => {
        tableApi.query()
      },
      schema: [],
      showCollapseButton: true
    })
    const resetSearchFormByRoute = (): void => {
      formApi.setFormValues({
        submitTime: null,
        organizationId: null,
        status: '',
        businessType: null,
        username: null,
      })
    }
    const searchFormSchema = [
      {
        component: DateRangePicker,
        label: '发起时间',
        fieldName: 'submitTime',
        defaultValue: null,
      },
      {
        component: DeptCascaderSelect,
        label: '发起部门',
        fieldName: 'organizationId',
        componentProps: {
          placeholder: '发起部门'
        }
      },
      {
        component: Select,
        label: '处理状态',
        fieldName: 'status',
        componentProps: {
          placeholder: '处理状态',
          options: [
            {
              label: '全部',
              value: ''
            },
            ...Object.keys(flowStatus).map((item) => {
              return {
                label: flowStatus[item as keyof typeof flowStatus],
                value: item
              }
            })
          ],
        },
      },
      {
        component: BusinessTypeSelect,
        label: '工单类型',
        fieldName: 'businessType',
        defaultValue: null,
        componentProps: {}
      },
      {
        component: Input,
        label: '发起人',
        fieldName: 'username',
        defaultValue: null,
        componentProps: {}
      },
    ]
    formApi.updateSchema(searchFormSchema)

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'processInstanceId',
      rowSelection: 'checkbox',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          businessType: formApi.formValues.businessType as string ?? '',
          organizationId: formApi.formValues.organizationId as string ?? '',
          status: formApi.formValues.status as string ?? '',
          submitTime: formApi.formValues.submitTime as string ?? '',
          username: formApi.formValues.username as string ?? '',
          applicationCode: 'FORM_ASSESSMENT',
        }
        if (isUserQueryMode.value) {
          return cubeFormAuditService.getFlowProcessPage({
            ...params,
            type: 'ALL',
          })
        }
        return cubeFormAuditService.getAppraisalProcessAllPage(params)
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[]
      },
      fetchLoaded: (data) => {
        page.total = data.total
      }
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }

    /** 跳转到详情页 */
    const goDetail = (record: FlowProcessVO): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.processInstanceId}&currentTaskId=${record.currentTaskId}&status=${record.status}&type=detail&title=审批详情`)
    }

    const exportLoading = ref(false)
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true
        const params = {
          applicationCode: 'FORM_ASSESSMENT',
          businessType: formApi.formValues.businessType as string ?? '',
          organizationId: formApi.formValues.organizationId as string ?? '',
          username: formApi.formValues.username as string ?? '',
          submitTime: formApi.formValues.submitTime as string ?? '',
          status: formApi.formValues.status as string ?? '',
        }
        let res = null
        if (isUserQueryMode.value) {
          res = await cubeFormAuditService.exportLegacyWorkOrderList(params)
        } else {
          res = await cubeFormAuditService.exportWorkOrderList(params)
        }
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '工单记录.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

      } catch {
        message.error('操作失败')
      } finally {
        exportLoading.value = false
      }
    }

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Space>
            { hasDeletePermission && <Button
                disabled={ selectedRowKeysData.value.length === 0}
                type='primary' danger onClick={openBatchDeleteModal}
                loading={deleteLoading.value}
              >批量删除</Button>
            }
            <Button
              disabled={page.total === 0}
              type='primary' onClick={handleExport}
              loading={exportLoading.value}
            >导出
            </Button>
          </Space>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
            {/* 删除确认弹窗 */}
            <Modal
              visible={deleteModalVisible.value}
              title={deleteModalTitle.value}
              onCancel={closeDeleteModal}
              width={400}
              footer={
                <>
                  <Button onClick={closeDeleteModal}>取消</Button>
                  <Button type="primary" danger onClick={confirmDelete} loading={deleteLoading.value}>确认</Button>
                </>
              }
            >
              <p>{deleteModalContent.value}</p>
            </Modal>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-show={page.total > 0}
            current={page.pageNumber}
            pageSize={page.pageSize}
            total={page.total}
            onPageChange={handleChange}
          />
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            { hasDeletePermission && <span style={{ marginRight: '10px' }}>已选{selectedRowKeysData.value.length}项</span> }
          </>
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? '工单记录'} v-slots={layoutSlots} />
    )

  }
})
