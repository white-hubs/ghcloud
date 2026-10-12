import { defineComponent, ref, reactive } from 'vue'
import { Button, PopOver, PopConfirm, Page, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { DataTypeVO } from '@ghcloud/cube-zhongda-heshun-service'
import { cubeZhongdaHeshunService } from '@/api/service'
import { ProjectTypeModal } from './project-type-modal'

export const ProjectType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })

    const searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '分类名称'
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
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element=> {
          return <PopOver content={index + 1 || '--'}>{index + 1 || '--'}</PopOver>
        }
      },
      {
        title: '分类名称',
        dataIndex: 'dataName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '备注说明',
        dataIndex: 'remark',
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
        customRender: ({ record }: { record: DataTypeVO; }): JSX.Element => {
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
          keyword: formApi.formValues.keyword as string ?? '',
          dataType: 'PROJECT'
        }
        return cubeZhongdaHeshunService.getTypeList(params)
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
    const featureModalRef = ref<{ openModal: (record?: DataTypeVO, readonly?: boolean) => void; }>()
    const handleAdd = (): void => {
      featureModalRef.value?.openModal()
    }
    const handleEdit = (record: DataTypeVO): void => {
      featureModalRef.value?.openModal(record)
    }
    const deleteRow = async (record: DataTypeVO): Promise<void> => {
      try {
        await cubeZhongdaHeshunService.deleteProjectType(record.id)
        message.success('操作成功')
        tableApi.query()
      } catch {
        message.error('操作失败')
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
      <CubeLayout title={pageTitle ?? '项目分类'} v-slots={slots} >
        <ProjectTypeModal ref={featureModalRef} title={pageTitle ?? '项目分类'} onEnter={() => {
          tableApi.query()
        }} />
      </CubeLayout>
    )
  }
})