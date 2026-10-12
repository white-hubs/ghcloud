import { defineComponent, reactive, ref } from 'vue'
import { Button, PopOver, Page, PopConfirm, message } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { FeatureModal } from './feature-modal'
import { cubeMdataService } from '@ghcloud/cube-app-design/src/api/service'
import type { AreaFeature } from '@ghcloud/cube-mdata-service/src/type'

/** 特征管理 */
export const FeatureList = defineComponent({
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
          placeholder: '特征名称、特征描述'
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
        title: '特征名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '特征描述',
        dataIndex: 'describe',
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
        customRender: ({ record }: { record: AreaFeature; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
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
          name: formApi.formValues.keyword as string ?? '',
        }
        return cubeMdataService.getAreaFeaturePage(params)
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
    const featureModalRef = ref<{ openModal: (record?: AreaFeature) => void; }>()
    const handleAdd = (): void => {
      featureModalRef.value?.openModal()
    }
    const editRow = (record: AreaFeature): void => {
      featureModalRef.value?.openModal(record)
    }
    const deleteRow = async (record: AreaFeature): Promise<void> => {
      try {
        await cubeMdataService.deleteAreaFeature({ id: record.id ?? '' })
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
      <CubeLayout title={pageTitle} v-slots={slots} >
        <FeatureModal ref={featureModalRef} title={pageTitle} onEnter={() => {
          tableApi.query()
        }} />
      </CubeLayout>
    )
  }
})
