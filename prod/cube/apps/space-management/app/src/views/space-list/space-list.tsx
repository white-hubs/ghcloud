import { defineComponent, onMounted, ref } from 'vue'
import { Button, PopOver, PopConfirm, message, Table } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { SpaceModal } from './space-modal'
import { AreaRange } from '@/components/area-range/area-range'
import styles from './space-list.module.less'
import { AreaImportModal } from '@/components/area-import-modal/area-import-modal'
import { cubeMdataService } from '@/api/service'
import { FeatureSelect } from '@/components/feature-select/feature-select'
import { StatusSelect } from '@/components/status-select/status-select'
import { TagSelect } from '@/components/tag-select/tag-select'
import type { AreaListVO } from '@ghcloud/cube-mdata-service/src/type'
import { AreaTagModal } from '@/components/area-tag-modal/area-tag-modal'
import { filterEmptyChildren, moveNodeInTree } from '@/hook/use-table-sort'
import { useTableScroll } from '@/hook/use-table-scroll'

/** 空间管理 */
export const SpaceList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        getSpaceData()
      },
      handleReset: () => {
        getSpaceData()
      },
      schema: [],
      showCollapseButton: true
    })
    const searchFormSchema = [
      {
        component: StatusSelect,
        label: '状态',
        fieldName: 'statusId',
        defaultValue: null,
        componentProps: {
        }
      },
      {
        component: FeatureSelect,
        label: '特征',
        fieldName: 'featureId',
        defaultValue: null,
        componentProps: {
          isSingle: true
        }
      },
      {
        component: TagSelect,
        label: '标签',
        fieldName: 'tagId',
        defaultValue: null,
        componentProps: {
          isSingle: true
        }
      },
      {
        component: AreaRange,
        label: '面积',
        fieldName: 'area',
        defaultValue: null,
        componentProps: {
          onChange: (value: { areaSymbol: string; areaNumber: number; }): void => {
          }
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '空间名称'
        }
      }
    ]
    formApi.updateSchema(searchFormSchema)
    const columns = [
      {
        title: '空间编号',
        dataIndex: 'code',
        ellipsis: true,
        align: 'center',
        sorter: (a: AreaListVO, b: AreaListVO): number => {
          // 递归函数：对子级数据进行排序
          const sortChildren = (nodeA: AreaListVO, nodeB: AreaListVO): number => {
            const result = (nodeA.code ?? '').localeCompare(nodeB.code ?? '')
            if (result !== 0) return result

            // 如果当前节点相等，则比较子节点
            if (nodeA.children?.length && nodeB.children?.length) {
              for (let i = 0; i < Math.min(nodeA.children.length, nodeB.children.length); i++) {
                const childResult = sortChildren(nodeA.children[i], nodeB.children[i])
                if (childResult !== 0) return childResult
              }
              // 如果前面的子节点都相等，则比较子节点数量
              return nodeA.children.length - nodeB.children.length
            }
            // 有子节点的排在前面
            return (nodeB.children?.length ?? 0) - (nodeA.children?.length ?? 0)
          }
          return sortChildren(a, b)
        },
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '空间名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '空间状态',
        dataIndex: 'statusName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '空间特征',
        dataIndex: 'featureName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '面积(㎡)',
        dataIndex: 'builtUpArea',
        ellipsis: true,
        align: 'center',
        sorter: (a: AreaListVO, b: AreaListVO): number => {
          const sortChildren = (nodeA: AreaListVO, nodeB: AreaListVO): number => {
            const result = (nodeA?.builtUpArea ?? 0) - (nodeB?.builtUpArea ?? 0)
            if (result !== 0) return result

            if (nodeA.children?.length && nodeB.children?.length) {
              for (let i = 0; i < Math.min(nodeA.children.length, nodeB.children.length); i++) {
                const childResult = sortChildren(nodeA.children[i], nodeB.children[i])
                if (childResult !== 0) return childResult
              }
              return nodeA.children.length - nodeB.children.length
            }
            return (nodeB.children?.length ?? 0) - (nodeA.children?.length ?? 0)
          }
          return sortChildren(a, b)
        },
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
        width: 250,
        customRender: ({ record }: { record: AreaListVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleAddSub(record)
              }}>新增下级</Button>
              <Button type='link' size='small' onClick={() => {
                editTag(record)
              }}>关联标签</Button>
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
    const loading = ref(false)
    const dataSource = ref<AreaListVO[]>([])
    const getSpaceData = async (): Promise<void> => {
      const { statusId, tagId, area, featureId } = formApi.formValues
      const params = {
        keyword: formApi.formValues.keyword as string ?? '',
        statusId: statusId ? Array.isArray(statusId) ? statusId.join(',') : statusId as string : '',
        tagId: tagId ? Array.isArray(tagId) ? tagId.join(',') : tagId as string : '',
        featureId: featureId ? Array.isArray(featureId) ? featureId.join(',') : featureId as string : '',
        areaSymbol: (area as { areaSymbol: string; })?.areaSymbol,
        areaNumber: (area as { value: string; })?.value ?? '',
      }
      const data = await cubeMdataService.getSpaceList(params)
      dataSource.value = filterEmptyChildren(data)
    }
    onMounted(async () => {
      await getSpaceData()
    })
    const spaceModalRef = ref<{ openModal: (record?: unknown, addSub?: boolean) => void; }>()
    const areaImportModalRef = ref<{ openModal: (record?: unknown) => void; }>()
    const areaTagModalRef = ref<{ openModal: (record?: unknown) => void; }>()
    const exportLoading = ref(false)
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true
        const { statusId, tagId, area, featureId } = formApi.formValues
        const res = await cubeMdataService.exportSpace({
          keyword: formApi.formValues.keyword as string ?? '',
          statusId: statusId ? Array.isArray(statusId) ? statusId.join(',') : statusId as string : '',
          tagId: tagId ? Array.isArray(tagId) ? tagId.join(',') : tagId as string : '',
          featureId: featureId ? Array.isArray(featureId) ? featureId.join(',') : featureId as string : '',
          areaSymbol: (area as { areaSymbol: string; })?.areaSymbol,
          areaNumber: (area as { areaNumber: string; })?.areaNumber ?? '',
        })
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '空间列表.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        exportLoading.value = false
      }
    }
    const handleImport = (record: AreaListVO): void => {
      areaImportModalRef.value?.openModal(record)
    }
    const handleAdd = (): void => {
      spaceModalRef.value?.openModal()
    }
    const handleAddSub = (record: AreaListVO): void => {
      spaceModalRef.value?.openModal(record, true)
    }
    const editRow = (record: AreaListVO): void => {
      spaceModalRef.value?.openModal(record)
    }
    const editTag = (record: AreaListVO): void => {
      areaTagModalRef.value?.openModal(record)
    }
    const deleteRow = async (record: AreaListVO): Promise<void> => {
      try {
        if (record?.children && record?.children?.length > 0) {
          message.warn("当前区域有下属区域，无法删除");
          return;
        }
        await cubeMdataService.deleteArea(record?.id ?? '')
        message.success('操作成功')
        getSpaceData()
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    const { scrollY } = useTableScroll()
    // 实现拖拽
    const startRecord = ref<AreaListVO>({})
    const endRecord = ref<AreaListVO>({})
    const handleCustomRow = (record: AreaListVO): unknown => {
      const canDrag = (startRecord: AreaListVO, endRecord: AreaListVO): boolean => {
        // 确保两个记录的父 ID 相同，即它们在同一级别
        return startRecord.parentId === endRecord.parentId;
      };
      return {
        style: {
          cursor: 'move',
          background: record.id === startRecord.value.id ? '#e6f7ff' : '',
        },
        onMouseenter: (event: MouseEvent): void => {
          const target = event.target as HTMLElement;
          target.draggable = true;
        },
        onDragstart: (event: DragEvent): void => {
          event.stopPropagation();
          startRecord.value = record;
        },
        onDragover: (event: DragEvent): void => {
          event.preventDefault();
        },
        onDrop: (event: DragEvent): void => {
          event.preventDefault();
          record.drag = false;
          endRecord.value = record;
          if (!canDrag(startRecord.value, endRecord.value)) {
            return;
          }
          const startKey = startRecord.value.id;
          const endKey = endRecord.value.id;
          dataSource.value = moveNodeInTree(dataSource.value, startKey ?? 0, endKey ?? 0);
          // 判断拖拽方向
          // const startIndex = findNodeIndexById(dataSource.value, startKey);
          // const endIndex = findNodeIndexById(dataSource.value, endKey);
          // if (startIndex < endIndex) {
          //   dataSource.value = changeData(dataSource.value, endKey, startRecord.value);
          //   dataSource.value = changeData(dataSource.value, startKey, endRecord.value);
          // } else {
          //   dataSource.value = changeData(dataSource.value, startKey, endRecord.value);
          //   dataSource.value = changeData(dataSource.value, endKey, startRecord.value);
          // }
          cubeMdataService.editAreaSort(dataSource.value).then(() => {
            getSpaceData()
          })
        },
      };
    };
    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div class={styles.btns}>
            <Button type='primary' disabled={dataSource.value.length === 0} loading={exportLoading.value} onClick={handleExport}>导出</Button>
            <Button type='primary' onClick={handleImport}>批量导入</Button>
            <Button type='primary' onClick={handleAdd}>新增</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <Table class={styles.areaTable} rowKey='id' columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} customRow={handleCustomRow} />
          </div>
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots} >
        <SpaceModal ref={spaceModalRef} title={pageTitle} onEnter={() => {
          getSpaceData()
        }} />
        <AreaImportModal ref={areaImportModalRef} onEnter={() => {
          getSpaceData()
        }} />
        <AreaTagModal ref={areaTagModalRef} onEnter={() => {
          getSpaceData()
        }} />
      </CubeLayout>
    )
  }
})
