import { defineComponent, reactive } from 'vue'
import { Button, PopOver, Page } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { AppTypeSelect } from '@/components/app-type-select/app-type-select'
import dayjs from 'dayjs'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationEntity } from '@ghcloud/cube-application-center-service'
import { useRouter } from 'vue-router'

export const AppOwn = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const searchFormSchema = [
      {
        component: AppTypeSelect,
        label: '应用分类',
        fieldName: 'applicationGroupId',
        componentProps: {
          placeholder: '应用分类',
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
          placeholder: '应用名称'
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
        title: '应用编号',
        dataIndex: 'code',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '应用名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '应用分类',
        dataIndex: 'applicationGroupName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '当前版本',
        dataIndex: 'version',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
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
        customRender: ({ record }: { record: ApplicationEntity; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>详情</Button>
            </>
          )
        }
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: formApi.formValues.keyword as string ?? '',
          applicationGroupId: formApi.formValues.applicationGroupId as string ?? '',
        }
        return cubeApplicationCenterService.getMyApplications(params)
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
    const handleEdit = (record: ApplicationEntity): void => {
      router.push(`/app-details?id=${record.id}`)
    }

    const slots = {
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

    return (): JSX.Element =>(
      <CubeLayout title={pageTitle ?? '我的应用'} v-slots={slots} >
      </CubeLayout>
    )
  }

})