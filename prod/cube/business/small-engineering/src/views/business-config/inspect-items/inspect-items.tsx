import { defineComponent, reactive } from 'vue'
import { Button, PopOver, Page, PopConfirm, message } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeDailyInspectionService } from '@/api/server'
import { filterEmptyValues } from '@/hook/utils'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'

/** 巡检项列表 */
export const InspectItems = defineComponent({
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
          placeholder: '巡检项名称'
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
        title: '巡检项名称',
        dataIndex: 'alias',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '巡检项内容',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '巡检结果项',
        dataIndex: 'resultNames',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '适用对象',
        dataIndex: 'referTypeNames',
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
                detailRow(record.id)
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                editRow(record.id)
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
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: formApi.formValues.keyword as string,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        }
        return cubeDailyInspectionService.getInspectItemTemplatePage(filterEmptyValues(params))
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
    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', '/portal/small-engineering/inspect-items-form?type=add')
    }
    const editRow = (id: string): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/small-engineering/inspect-items-form?type=edit&id=${id}`)
    }
    const detailRow = (id: string): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/small-engineering/inspect-items-form?type=detail&id=${id}`)
    }
    const deleteRow = async (id: string): Promise<void> => {
      try {
        await cubeDailyInspectionService.deleteInspectItemTemplate(id, { businessType: InspectBusinessType.SMALL_ENGINEERING })
        message.success('操作成功')
        tableApi.query()
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
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
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots} />
    )
  }
})
