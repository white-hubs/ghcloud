import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, PopOver, Page, PopConfirm, message, Switch, type DataNode } from '@ghcloud/cube-ui'
import { CubeLayout, CubeTreeSearch, InspectStandardModalTable, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeDailyInspectionService, cubeSmallEngineeringService } from '@/api/server'
import styles from './inspect-standard.module.less'
import { filterEmptyValues } from '@/hook/utils'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
import type { EventDataNode, TreeDataItem } from 'ant-design-vue/es/tree'

interface TreeSelected {
  selected: boolean;
  selectedNodes: TreeDataItem[];
  node: EventDataNode;
  event: string;
}
export const InspectStandard = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')

    const isChecked = ref(false)
    const targetType = ref('')

    const searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '巡检标准'
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
        title: '巡检标准',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设为默认巡检标准',
        dataIndex: 'defaultStandard',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: { defaultStandard: boolean; id: string; }; }): JSX.Element => {
          return <Switch v-model:checked={record.defaultStandard} checked-children='启用' un-checked-children='停用' onChange={async (e) => handleSwitch(e, record)} />
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
          targetTypeEq: true,
          targetType: targetType.value as string,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        }
        return cubeDailyInspectionService.getInspectStandardPage(filterEmptyValues(params))
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
      history.pushState({ current: location.pathname + location.search }, '', '/portal/small-engineering/inspect-standard-form?type=add')
    }
    const editRow = (id: string): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/small-engineering/inspect-standard-form?type=edit&id=${id}`)
    }
    const detailRow = (id: string): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/small-engineering/inspect-standard-form?type=detail&id=${id}`)
    }
    const handleSwitch = async (enable: boolean, record: { defaultStandard: boolean; id: string; }): Promise<void> => {
      if (!record?.id) return
      if (!targetType.value) {
        message.warning('请选择关联标准')
        record.defaultStandard = !enable
        return
      }
      try {
        const params = {
          defaultStandard: Number(enable),
          standardId: record?.id,
          targetType: targetType.value + '',
          targetCategory: InspectBusinessType.SMALL_ENGINEERING,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        }
        await cubeDailyInspectionService.setDefaultStandard(params)
        message.success('操作成功')
        tableApi.query()
      } catch (error) {
        record.defaultStandard = !enable
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    const deleteRow = async (id: string): Promise<void> => {
      try {
        await cubeDailyInspectionService.deleteInspectStandard(id, { businessType: InspectBusinessType.SMALL_ENGINEERING })
        message.success('操作成功')
        tableApi.query()
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    const queryProjectType = async (search?: string): Promise<DataNode[]> => {
      const params = {
        name: search || ''
      }
      return cubeSmallEngineeringService.getProjectTypeList(params) as unknown as DataNode[]
    }
    const handleTypeSelect = (value: unknown, e: TreeSelected): void => {
      isChecked.value = !isChecked.value
      const { id, name } = e.node
      targetType.value = id
      if (isRelation.value) {
        inspectStandardModalTableRef.value?.openModal(targetType.value, name)
        isRelation.value = false
      } else {
        targetType.value = e.selected ? id : ''
        tableApi.query()
      }
    }
    const isRelation = ref(false)
    onMounted(() => {
      tableApi.query()
    })
    const inspectStandardModalTableRef = ref<{ openModal: (type: string, name: string) => void; }>()
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
            <div class={styles['page-flex']}>
              <div class={styles['page-left']}>
                <CubeTreeSearch
                  optionsFetchApi={queryProjectType}
                  onSelect={(value: unknown, e: TreeSelected) => {
                    handleTypeSelect(value, e)
                  }}
                  rightButton={
                    <Button
                      type='link'
                      onClick={() => {
                        isRelation.value = true
                      }}
                    >
                      关联标准
                    </Button>
                  }
                />
              </div>
              <div class={styles['page-right']}>
                <CubeTable />
              </div>
            </div>
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
        <CubeLayout title={pageTitle} v-slots={slots} />
        <InspectStandardModalTable
          ref={inspectStandardModalTableRef}
          onEnter={() => {
            isRelation.value = false
            tableApi.query()
          }}
        />
      </>

    )
  }
})
