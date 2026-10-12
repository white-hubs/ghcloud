import { defineComponent, reactive } from 'vue'
import { Button, PopOver, PopConfirm, message, Page } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { ProjectAreaVO } from '@ghcloud/cube-zhongda-heshun-service'
import { cubeZhongdaHeshunService } from '@/api/service'
import { ProjectSelect } from '@/components/project-select/project-select'
import { useRoute } from 'vue-router'

export const ProjectArea = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    const searchFormSchema = [
      {
        component: <ProjectSelect showAll={true} />,
        label: '所属项目',
        fieldName: 'projectId',
      },
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
        title: '所属项目',
        dataIndex: 'projectName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '区域',
        dataIndex: 'areaName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '详情',
        dataIndex: 'areaDetail',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        width: 250,
        align: 'center',
        customRender: ({ record }: { record: ProjectAreaVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          projectId: formApi.formValues.projectId as string ?? '-',
        }
        return cubeZhongdaHeshunService.getProjectAreaPage(params)
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

    const handleEdit = (record?: ProjectAreaVO): void => {
      if (record?.projectId) {
        history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-area-edit?projectId=${record?.projectId}&&id=${record?.id}`)
      } else {
        history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-area-edit`)
      }
    }

    const deleteRow = async (record: ProjectAreaVO): Promise<void> => {
      try {
        if (!record.id) return
        await cubeZhongdaHeshunService.deleteProjectArea(record.projectId, record.id)
        message.success('操作成功')
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button type='primary' onClick={handleEdit}>新增</Button>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <CubeForm />
            <CubeTable />
          </>
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
      <CubeLayout title={pageTitle ?? '消杀区域'} v-slots={slots} >
      </CubeLayout>
    )
  }
})