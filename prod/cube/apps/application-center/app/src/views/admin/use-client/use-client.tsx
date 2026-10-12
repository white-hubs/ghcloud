import { defineComponent, ref, reactive } from 'vue'
import { Button, PopOver, PopConfirm, Page } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeApplicationCenterService } from '@/api/service'
import type { TerminalEntity } from '@ghcloud/cube-application-center-service'
import { UseClientModal } from './use-client-modal'

export const UseClient = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
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
          placeholder: '应用端'
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
        title: '应用端',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        width: 400,
        align: 'center',
        customRender: ({ record }: { record: TerminalEntity; }): JSX.Element => {
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
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: formApi.formValues.keyword as string ?? '',
        }
        return cubeApplicationCenterService.getTerminals(params)
      },
      fetchLoaded: (data) => {
        page.total = data.total
      }
    })
    const featureModalRef = ref<{ openModal: (record?: TerminalEntity, readonly?: boolean) => void; }>()

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }
    const handleAdd = (): void => {
      featureModalRef.value?.openModal()
    }
    const handleEdit = (record: TerminalEntity): void => {
      featureModalRef.value?.openModal(record)
    }
    const deleteRow = async (record: TerminalEntity): Promise<void> => {
      try {
        await cubeApplicationCenterService.deleteTerminal(record.id);
      } finally {
        tableApi.query()
      }
    }

    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button type='primary' onClick={handleAdd}>新增</Button>
          </div>
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
      <CubeLayout title={pageTitle ?? '应用端'} v-slots={slots} >
        <UseClientModal ref={featureModalRef} title={'应用端'} onEnter={() => {
          tableApi.query()
        }} />
      </CubeLayout>
    )
  }

})