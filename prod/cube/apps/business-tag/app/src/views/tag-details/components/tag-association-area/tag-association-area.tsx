import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Button, message, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { cubeBusinessTagService } from '@/api/server'
import type { AreaModel } from '@ghcloud/cube-business-tag-service'
import { AssociatedObjectType, TagAssociatedObjectSelectModal } from '@/components/tag-associated-object-select/tag-associated-object-select-modal'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission/index'
import { useTableScroll } from '@/hook/use-table-scroll'

export const TagAssociationArea = defineComponent({
  props: {
    tagId: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  setup (props) {
    const permission = appFunctionCodes.businessTag ?? null
    const hasEditPermission = permission && hasPermission(permission.edit)

    const loading = ref(false)
    const dataSource = ref<AreaModel[]>([])
    const selectedRowKeys = ref<string[]>([])

    const searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '请输入名称'
        }
      }
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        getDataSource()
      },
      handleReset: () => {
        getDataSource()
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })

    const getDataSource = async (): Promise<void> => {
      loading.value = true
      try {
        const params = {
          tagIds: [props.tagId],
          name: formApi.formValues.keyword as string ?? '',
        }
        const data = await cubeBusinessTagService.getTagAreaTreeList(params)
        dataSource.value = data
      } catch {
        message.error('获取关联区域失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getDataSource()
    })

    const columns = [
      {
        title: '区域名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '区域编号',
        dataIndex: 'code',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
        width: 250,
        customRender: ({ record }: { record: AreaModel; }): JSX.Element => {
          return (
            <>
              {hasEditPermission && <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>}
            </>
          )
        }
      },
    ]

    const deleteRow = async (record: AreaModel): Promise<void> => {
      try {
        await cubeBusinessTagService.deleteTagAssociateIds({
          tagId: props.tagId,
          refIds: [record.id],
        })
        message.success('操作成功')
        getDataSource()
      } catch {
        message.error('操作失败')
      }
    }

    const handleBatchDelete = async (): Promise<void> => {
      if (selectedRowKeys.value.length === 0){
        message.warn('请选择关联对象')
        return
      }
      try {
        await cubeBusinessTagService.deleteTagAssociateIds({
          tagId: props.tagId,
          refIds: selectedRowKeys.value,
        })
        message.success('操作成功')
        selectedRowKeys.value = []
        getDataSource()
      } catch {
        message.error('操作失败')
      }
    }

    const objectModalRef = ref<{ openModal: (tagId?: string, defaultTab?: AssociatedObjectType) => void; }>()
    const addSelected = ref<{
      id: string;
      name: string;
      type: string;
    }[]>([])
    const handleAdd = (): void => {
      objectModalRef.value?.openModal(props.tagId, AssociatedObjectType.AREA)
    }

    const addAssociatedObject = async (): Promise<void> => {
      try {
        if (!props.tagId) return
        if (!addSelected.value || addSelected.value.length === 0){
          message.warn('请选择关联对象')
          return
        }
        const params = {
          tagId: props.tagId ?? '',
          refRequests: addSelected.value.map(item => ({
            tagRefType: item.type,
            refId: item.id,
          })),
        }
        await cubeBusinessTagService.addTagAssociate(params)
        addSelected.value = []
        message.success('操作成功')
        getDataSource()
      } catch {
        message.error('操作失败')
      }
    }

    watch(() => props.active, (isActive) => {
      if (isActive) {
        getDataSource()
      }
    })

    const { scrollY } = useTableScroll()
    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div id="cube-query-form-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <CubeForm />
            </div>
            {hasEditPermission && <Button type='primary' onClick={handleAdd}>新增</Button>}
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <Table
            columns={columns}
            dataSource={dataSource.value}
            rowKey='id'
            pagination={false}
            scrollY={scrollY.value}
            rowSelection={{
              type: 'checkbox',
              checkStrictly: false,
              selectedRowKeys: selectedRowKeys.value,
              onChange: (keys: string[], selectedRows: AreaModel[]) => {
                // 过滤掉父级节点
                const filteredKeys = selectedRows.filter(item => item.children === null || item.children.length === 0)
                selectedRowKeys.value = filteredKeys.map(item => item.id);
              }
            }}
          />
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
    }
    return (): JSX.Element => (
      <CubeLayout v-slots={slots} >
        <TagAssociatedObjectSelectModal
          ref={objectModalRef}
          title='业务标签关联'
          defaultTab={AssociatedObjectType.AREA}
          v-model:value={addSelected.value}
          multiple
          onEnter={async (value: { id: string; name: string; type: string; }[]) => {
            addSelected.value = value
            await addAssociatedObject()
          }}
        />
      </CubeLayout>
    )
  }
})
