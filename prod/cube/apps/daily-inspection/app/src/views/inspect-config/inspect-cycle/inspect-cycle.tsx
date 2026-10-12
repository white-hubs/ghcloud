import { defineComponent, reactive, ref } from 'vue'
import { Button, PopOver, Page, PopConfirm, message, AntModal } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeDailyInspectionService } from '@/api/server'
import { InspectCycleModal } from './inspect-cycle-modal'
import { filterEmptyValues } from '@/hook/utils'

export const InspectCycle = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')

    const searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '周期名称'
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
      schema: searchFormSchema,
      showCollapseButton: true
    })

    const columns = [
      {
        title: '周期名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '表达式',
        dataIndex: 'cron',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
        fixed: 'right',
        width: 180,
        customRender: ({ record }: { record: { id: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record.id)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const selectedRowKeys = ref<string[]>([])
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      rowSelection: 'checkbox',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: formApi.formValues.keyword as string
        }
        return cubeDailyInspectionService.getInspectCronPage(filterEmptyValues(params))
      },
      fetchLoaded: (data) => {
        page.total = data.total
      },
      rowSelectionChange: (keys) => {
        selectedRowKeys.value = keys as string[]
      },
    })
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }
    const inspectCycleModalRef = ref<{ openModal: (record?: unknown) => void; }>()
    const handleAdd = (): void => {
      inspectCycleModalRef.value?.openModal()
    }
    const editRow = (record: unknown): void => {
      inspectCycleModalRef.value?.openModal(record)
    }
    const deleteRow = async (id: string): Promise<void> => {
      try {
        await cubeDailyInspectionService.deleteInspectCron(id)
        message.success('操作成功')
        tableApi.query()
      } catch {
      }
    }
    const batchDeleteLoading = ref(false)
    const handleBatchDelete = (): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除当前选中?',
        async onOk () {
          try {
            batchDeleteLoading.value = true
            await cubeDailyInspectionService.batchDeleteInspectCron({
              ids: tableApi.getSelectedRowKeys()?.join(',')
            })
            message.success('操作成功')
            tableApi.query()
          } catch {
          }finally {
            AntModal.destroyAll()
            batchDeleteLoading.value = false
          }
        },
        onCancel () {
          AntModal.destroyAll()
        }
      })
    }
    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button type='primary' onClick={handleAdd}>新增</Button>
        )
      },
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
            <span style={{ marginRight: '16px' }}>已选 {selectedRowKeys.value.length} 项</span>
            <Button disabled={selectedRowKeys.value.length === 0} type='primary' danger loading={batchDeleteLoading.value} onClick={handleBatchDelete}>批量删除</Button>
          </>
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots}>
        <InspectCycleModal ref={inspectCycleModalRef} title={pageTitle} onEnter={() => {
          tableApi.query()
        }} />
      </CubeLayout>
    )
  }
})
