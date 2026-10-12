import { defineComponent, reactive, ref } from 'vue'
import { Button, PopOver, PopConfirm, Page, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { ProjectVO } from '@ghcloud/cube-zhongda-heshun-service'
import { cubeZhongdaHeshunService } from '@/api/service'
import dayjs from 'dayjs'
import { ProjectDetails } from './project-details/project-details'

export const ProjectLibrary = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    const isDetail = ref(true)
    const detailId = ref('')
    const statusOptions = [
      {
        label: '全部',
        value: ''
      },
      {
        label: '待开始',
        value: 'WAITING',
        color: 'rgb(64, 145, 247)'
      },
      {
        label: '进行中',
        value: 'PROCESSING',
        color: 'green'
      },
      {
        label: '已完成',
        value: 'COMPLETED',
        color: 'gray'
      }
    ]

    const searchFormSchema = [
      {
        component: 'Select',
        label: '项目状态',
        fieldName: 'status',
        componentProps: {
          options: statusOptions,
          placeholder: '全部',
          onChange: (): void => {
            tableApi.query()
          }
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '项目名称，业主单位，负责人'
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
        title: '项目编号',
        dataIndex: 'projectCode',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '项目所在地',
        dataIndex: 'disinfectionLocationName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '业主单位',
        dataIndex: 'company',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '项目负责人',
        dataIndex: 'leaderName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '项目周期',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: ProjectVO; }): JSX.Element=> {
          const beginTime = dayjs(record.beginTime).format('YYYY-MM-DD');
          const endTime = dayjs(record.endTime).format('YYYY-MM-DD') ;
          return <PopOver content={`${beginTime} ~ ${endTime}`}>{`${beginTime} ~ ${endTime}`}</PopOver>
        }
      },
      {
        title: '项目状态',
        dataIndex: 'status',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          let status = '--'
          let color = ''
          if (text){
            const item = statusOptions.find((item) => item.value === text)
            status = item?.label ?? '--'
            color = item?.color ?? ''
          }
          return <PopOver content={status}> <span style={{ color: color }}>{status}</span> </PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        fixed: 'right',
        width: 250,
        align: 'center',
        customRender: ({ record }: { record: ProjectVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <Button type='link' size='small' onClick={() => {
                toDetails(record)
              }}>查看</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record)
              }}>
                <Button type='link' disabled={record.status !== 'WAITING'} size='small' danger>删除</Button>
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
          keyword: formApi.formValues.keyword as string ?? '',
          status: formApi.formValues.status as string ?? '',
        }
        return cubeZhongdaHeshunService.getProjectPageList(params)
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
      history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-library-edit`)
    }

    const handleEdit = async (record: ProjectVO): Promise<void> => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-library-edit?id=${record.id ?? ''}`)
    }

    const toDetails = async (record: ProjectVO): Promise<void> => {
      isDetail.value = false
      detailId.value = record.id
      // history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-details?id=${record.id}`)
    }

    const deleteRow = async (record: ProjectVO): Promise<void> => {
      try {
        await cubeZhongdaHeshunService.deleteProjectPage({ id: record.id })
        message.success('操作成功')
        tableApi.query()
      } catch {
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
      <>
        {isDetail.value ?
          <CubeLayout title={pageTitle ?? '项目库'} v-slots={slots} >
          </CubeLayout> : <ProjectDetails id={detailId.value} onCancel={()=>{
            isDetail.value = true
            tableApi.query()
          }} />
        }
      </>
    )
  }
})