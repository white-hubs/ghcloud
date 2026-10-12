import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { Button, message, Page, PopConfirm, PopOver } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { cubeBusinessTagService } from '@/api/server'
import { AssociatedObjectType, TagAssociatedObjectSelectModal } from '@/components/tag-associated-object-select/tag-associated-object-select-modal'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission/index'
import styles from './tag-association-common-list.module.less'
import { useTableScroll } from '@/hook/use-table-scroll'
import type { PageResult } from '@ghcloud/cube-business-tag-service'

type Identifiable = { id: string; }

type FetchParams = {
  tagIds: string[];
  pageNumber: number;
  pageSize: number;
  name: string;
}

type ColumnConfig = {
  title?: string;
  dataIndex?: string;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  width?: number;
  slots?: Record<string, string>;
  customRender?: (args: unknown) => JSX.Element;
}

const tableCodeMap: Record<AssociatedObjectType, string> = {
  [AssociatedObjectType.DEVICE]: 'tag-association-device',
  [AssociatedObjectType.PROPERTY]: 'tag-association-property',
  [AssociatedObjectType.STALL]: 'tag-association-stall',
  [AssociatedObjectType.SITE_POINT]: 'tag-association-site-point',
  [AssociatedObjectType.SMALL_ENGINEERING]: 'tag-association-small-engineering',
  [AssociatedObjectType.PATROL_POINT]: 'tag-association-patrol-point',
  [AssociatedObjectType.RISK_SOURCE]: 'tag-association-risk-source',
}

const fetchApiMap: Record<AssociatedObjectType, (p: FetchParams) => Promise<PageResult<unknown>>> = {
  [AssociatedObjectType.DEVICE]: async (p) => cubeBusinessTagService.getTagDevicePageList(p),
  [AssociatedObjectType.PROPERTY]: async (p) => cubeBusinessTagService.getTagPropertyPageList(p),
  [AssociatedObjectType.STALL]: async (p) => cubeBusinessTagService.getTagStallPageList(p),
  [AssociatedObjectType.SITE_POINT]: async (p) => cubeBusinessTagService.getTagSitePointPageList(p),
  [AssociatedObjectType.SMALL_ENGINEERING]: async (p) => cubeBusinessTagService.getTagSmallEngineeringPageList(p),
  [AssociatedObjectType.PATROL_POINT]: async (p) => cubeBusinessTagService.getTagPatrolPointPageList(p),
  [AssociatedObjectType.RISK_SOURCE]: async (p) => cubeBusinessTagService.getTagRiskSourcePageList(p),
}

function buildDataColumns (type: AssociatedObjectType): ColumnConfig[] {
  const textCell = (text: string): JSX.Element => <PopOver content={text || '--'}>{text || '--'}</PopOver>

  switch (type) {
    case AssociatedObjectType.DEVICE:
      return [
        { title: '设备编号', dataIndex: 'code', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '设备名称', dataIndex: 'name', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        {
          title: '所属产品', dataIndex: 'productInfo', align: 'center', ellipsis: true,
          customRender: (args: unknown): JSX.Element => {
            const { record } = args as { record: { productInfo?: { name?: string; }; }; }
            const res = record.productInfo?.name ?? '--'
            return <PopOver content={res}>{res}</PopOver>
          }
        },
        {
          title: '产品品类', dataIndex: 'productInfo', align: 'center', ellipsis: true,
          customRender: (args: unknown): JSX.Element => {
            const { record } = args as { record: { productInfo?: { productCategory?: { name?: string; }; }; }; }
            const res = record.productInfo?.productCategory?.name ?? '--'
            return <PopOver content={res}>{res}</PopOver>
          }
        },
        {
          title: '维护部门', dataIndex: 'department', align: 'center', ellipsis: true,
          customRender: (args: unknown): JSX.Element => {
            const { record } = args as { record: { department?: { name?: string; }; }; }
            const res = record.department?.name ?? '--'
            return <PopOver content={res}>{res}</PopOver>
          }
        },
        {
          title: '所在区域', dataIndex: 'area', align: 'center', ellipsis: true,
          customRender: (args: unknown): JSX.Element => {
            const { record } = args as { record: { area?: { pathName?: string; }; }; }
            const res = record.area?.pathName ?? '--'
            return <PopOver content={res}>{res}</PopOver>
          }
        },
      ]
    case AssociatedObjectType.PROPERTY:
      return [
        { title: '名称', dataIndex: 'name', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '类别', dataIndex: 'typeName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '部门', dataIndex: 'receiveDepName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '区域', dataIndex: 'areaName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
      ]
    case AssociatedObjectType.STALL:
      return [
        { title: '名称', dataIndex: 'name', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '类别', dataIndex: 'typeName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '部门', dataIndex: 'depName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
      ]
    case AssociatedObjectType.SITE_POINT:
      return [
        { title: '名称', dataIndex: 'name', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '类别', dataIndex: 'typeName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '部门', dataIndex: 'depName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '区域', dataIndex: 'areaName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
      ]
    case AssociatedObjectType.SMALL_ENGINEERING:
      return [
        { title: '名称', dataIndex: 'projectName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '类别', dataIndex: 'projectTypeName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '部门', dataIndex: 'depName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
      ]
    case AssociatedObjectType.PATROL_POINT:
      return [
        { title: '名称', dataIndex: 'patrolLocationName', align: 'center', ellipsis: true,
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        {
          title: '区域', dataIndex: 'area', align: 'center', ellipsis: true,
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: { name: string; }[] }
            const name = Array.isArray(text) ? text.map(e => e.name).join('/') : '--'
            return <PopOver content={name || '--'}>{name || '--'}</PopOver>
          }
        },
      ]
    case AssociatedObjectType.RISK_SOURCE:
      return [
        { title: '名称', dataIndex: 'name', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '类别', dataIndex: 'typeName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '部门', dataIndex: 'receiveDepName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
        { title: '区域', dataIndex: 'areaName', align: 'center', ellipsis: true, 
          customRender: (args: unknown): JSX.Element => {
            const { text } = args as { text: string }
            return textCell(text)
          }
        },
      ]
    default:
      return []
  }
}

export const TagAssociationCommonList = defineComponent({
  props: {
    tagId: { type: String, default: '' },
    active: { type: Boolean, default: false },
    type: { type: String as PropType<AssociatedObjectType>, required: true },
  },
  setup (props) {
    const permission = appFunctionCodes.businessTag ?? null
    const hasEditPermission = permission && hasPermission(permission.edit)

    const page = reactive({ pageNumber: 1, pageSize: 10, total: 0 })
    const selectedRowKeys = ref<string[]>([])

    const searchFormSchema = [
      { component: 'Input', label: '', fieldName: 'keyword', componentProps: { placeholder: '请输入名称' } }
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (): void => {
        page.pageNumber = 1; tableApi.query()
      },
      handleReset: (): void => {
        page.pageNumber = 1; tableApi.query()
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })

    const dataColumns = buildDataColumns(props.type)
    const actionColumn: ColumnConfig = {
      dataIndex: 'action',
      title: '操作',
      slots: { customRender: 'action' },
      width: 250,
      customRender: (args: unknown): JSX.Element => {
        const { record } = args as { record: Identifiable }
        return (
          <>
            {hasEditPermission && <PopConfirm title='确认删除该项？' onConfirm={() => {
              void deleteRow(record)
            }}>
              <Button type='link' size='small' danger>删除</Button>
            </PopConfirm>}
          </>
        )
      }
    }

    const [CubeTable, tableApi] = useCubeTable({
      columns: [...dataColumns, actionColumn],
      tableCode: tableCodeMap[props.type],
      rowKey: 'id',
      rowSelection: 'checkbox',
      fetchApi: async () => {
        const params: FetchParams = {
          tagIds: [props.tagId],
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          name: (formApi.formValues.keyword as string) ?? ''
        }
        return fetchApiMap[props.type](params)
      },
      rowSelectionChange: (keys): void => {
        selectedRowKeys.value = (keys as string[])
      },
      fetchLoaded: (data: { total: number; }): void => {
        page.total = data.total
      }
    })
    tableApi.setSelectedRowKeys(selectedRowKeys.value)

    const deleteRow = async (record: Identifiable): Promise<void> => {
      try {
        await cubeBusinessTagService.deleteTagAssociateIds({ tagId: props.tagId, refIds: [record.id] })
        message.success('操作成功')
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    const handleBatchDelete = async (): Promise<void> => {
      if (selectedRowKeys.value.length === 0) {
        message.warn('请选择关联对象')
        return
      }
      try {
        await cubeBusinessTagService.deleteTagAssociateIds({ tagId: props.tagId, refIds: selectedRowKeys.value })
        message.success('操作成功')
        selectedRowKeys.value = []
        tableApi.setSelectedRowKeys(selectedRowKeys.value)
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    const objectModalRef = ref<{ openModal: (tagId?: string, defaultTab?: AssociatedObjectType) => void; }>()
    const addSelected = ref<{ id: string; name: string; type: string; }[]>([])

    const handleAdd = (): void => {
      objectModalRef.value?.openModal(props.tagId, props.type)
    }

    const addAssociatedObject = async (): Promise<void> => {
      try {
        if (!props.tagId) return
        if (!addSelected.value || addSelected.value.length === 0) {
          message.warn('请选择关联对象')
          return
        }
        const params = {
          tagId: props.tagId ?? '',
          refRequests: addSelected.value.map(item => ({ tagRefType: item.type, refId: item.id }))
        }
        await cubeBusinessTagService.addTagAssociate(params)
        message.success('操作成功')
        addSelected.value = []
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    watch(() => props.active, (isActive) => {
      if (isActive) {
        tableApi.query()
      }
    })

    const { scrollY } = useTableScroll()

    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div id="cube-query-form-container" class={styles.header}>
            <div class={styles.headerForm}>
              <CubeForm />
            </div>
            {hasEditPermission && <Button type='primary' onClick={handleAdd}>新增</Button>}
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.content} style={{ maxHeight: `${scrollY.value}px` }} >
            <CubeTable />
          </div>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            {hasEditPermission && <span style={{ marginRight: '10px' }}>已选{selectedRowKeys.value.length}项</span>}
            {hasEditPermission && <Button type='primary' danger onClick={handleBatchDelete}>批量删除</Button>}
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={page.pageNumber}
            pageSize={page.pageSize}
            total={page.total}
            onPageChange={(pageNumber: number, pageSize: number): void => {
              page.pageNumber = pageNumber
              page.pageSize = pageSize
              tableApi.query()
            }}
          />
        )
      },
    }

    return (): JSX.Element => (
      <CubeLayout v-slots={slots}>
        <TagAssociatedObjectSelectModal
          ref={objectModalRef}
          title='业务标签关联'
          defaultTab={props.type}
          v-model:value={addSelected.value}
          multiple
          onEnter={async (value: { id: string; name: string; type: string; }[]): Promise<void> => {
            addSelected.value = value
            await addAssociatedObject()
          }}
        />
      </CubeLayout>
    )
  }
})
