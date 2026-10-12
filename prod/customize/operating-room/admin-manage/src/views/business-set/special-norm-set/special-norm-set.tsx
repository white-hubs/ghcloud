import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { cubeDictionaryService } from '@/api/service'
import type { GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import type { SpecialNorm } from '@/types/special-norm-type'
import { ProductSelect } from '@/components/business/product-select/product-select'
import { AddSetModal } from './add-set-modal'
import { EditSetModal } from './edit-set-modal'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'

/** 特殊指标设置 */
export const SpecialNormSet = defineComponent({
  setup: () => {
    const formState = reactive({
      tenantDefault: '',
      tenant: undefined,
      tenantName: '',
      productId: undefined
    })
    const columns = [
      {
        title: '所属医院',
        dataIndex: 'tenantName',
        width: 180,
        ellipsis: true,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属产品',
        dataIndex: 'productName',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '特殊指标',
        dataIndex: 'normName',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '单位',
        dataIndex: 'unit',
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: { unit: string; unitName: string; }; }): JSX.Element => {
          const textVal = record.unit ?? record.unitName ?? ''
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '下限',
        dataIndex: 'lowerLimit',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '上限',
        dataIndex: 'upperLimit',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '处理时间',
        dataIndex: 'handleTime',
        width: 180,
        ellipsis: true,
        defaultSortOrder: 'descend',
        sorter: (a: { handleTime: string; }, b: { handleTime: string; }): number => (new Date(a.handleTime) as unknown as number) - (new Date(b.handleTime) as unknown as number),
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: GetDictionaryByItem; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleEdit(record)
              }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={() => {
                  handleDel(record)
                }}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>

            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeDictionaryService.getAdminDictionaryByItem({
          itemCode: OperateRoomDictionaryKey.OPERATING_ROOM_ADMIN_SPECIAL_NORM_SET,
          tenant: formState.tenant
        })
        if (res) {
          const list = res.map(item => {
            let row = null
            if (item.variable) {
              row = JSON.parse(item.variable) as SpecialNorm
            }
            return {
              ...item,
              ...row,
            }
          })
          dataSource.value = list
          if (formState.tenant) {
            dataSource.value = dataSource.value.filter(c => (c as SpecialNorm).tenant === formState.tenant)
          }
          if (formState.productId) {
            dataSource.value = dataSource.value.filter(c => (c as SpecialNorm).productId === formState.productId)
          }
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const queryForm = (): void => {
      getTableData()
    }
    const reset = (): void => {
      Object.assign(formState, {
        tenant: undefined,
        tenantName: '',
        productId: undefined
      })
      getTableData()
    }
    const { scrollY } = useTableScroll()

    const normModalRef = ref<{ openModal: () => void; }>()
    const editNormModalRef = ref<{ openModal: (row: GetDictionaryByItem & SpecialNorm) => void; }>()
    const add = (): void => {
      rowId.value = ''
      normModalRef.value?.openModal()
    }
    const rowId = ref('')
    const handleEdit = (row: GetDictionaryByItem & SpecialNorm): void => {
      rowId.value = row.id
      editNormModalRef.value?.openModal(row)
    }
    const handleDel = async (row: GetDictionaryByItem): Promise<void> => {
      try {
        const params = {
          id: row.id,
          tenant: (JSON.parse(row.variable) as SpecialNorm).tenant
        }
        await cubeDictionaryService.deleteDataDictionary(params).then(() => {
          getTableData()
        })
        message.success('操作成功')
      } catch {
      } finally {
      }
    }
    const tenantChange = (tenant: { label: string; value: string; }): void => {
      formState.tenantName = tenant.label
      formState.productId = undefined
    }
    onMounted(() => {
      queryForm()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={add}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect v-model:value={formState.tenant} width='180px' selectFirst={false} onChange={tenantChange} />
              </FormItem>
              <FormItem label='所属产品' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <ProductSelect tenant={formState.tenant} v-model:value={formState.productId} width='180px' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination size='small' scrollY={scrollY.value} />
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title='特殊指标设置' v-slots={layoutSlots} />
        <AddSetModal ref={normModalRef} tenant={formState.tenant ?? ''} onEnter={queryForm} />
        <EditSetModal ref={editNormModalRef} id={rowId.value} tenant={formState.tenant ?? ''} onEnter={queryForm} />
      </>
  }
})
