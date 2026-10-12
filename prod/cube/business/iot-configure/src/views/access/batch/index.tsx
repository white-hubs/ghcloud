import { defineComponent, onUnmounted, reactive, ref, watch } from 'vue'
import { CLayout } from '@/components/clayout/clayout'
import { Layout } from '@/components/layout/layout'
import { GatewayTree } from '@/components/tree'
import { Button, Form, Input, Modal, PopOver, message } from '@ghcloud/cube-ui'
import { VirtualTable } from '@/components/virtual-table/virtual-table'
import { listAggregationRowByCtlId, saveOrUpdateAggregationRow } from '@/api/batch'
import FormItem from '@ghcloud/cube-ui/src/components/form-item/form-item'
import { storeBatch } from '@/pinia-store/batch'
import type { GroupDataItem } from '@/typings/gateway'
import { useValidateTable } from '@/hook/use-table-validate'
import { useTableScroll } from '@/hook/use-table-scroll'

export const Batch = defineComponent({
  setup: () => {
    const { scorllY } = useTableScroll()
    const { tableData, validateForm, isValidate, groupNameChange, groupNumberChange, virtualCodeChange } = useValidateTable()

    const loading = ref<boolean>(false)
    const dataSource = ref<GroupDataItem[]>([])
    const tableQueryData = ref<GroupDataItem[]>([])

    const selectedRowKeysData = ref<string[]>([])
    const batchInfo = reactive<{

      info: string;
      configDevice: boolean;
      groupNumber?: string;
    }>({
      configDevice: false,
      info: '',
      groupNumber: ''
    })
    const devicevisible = ref<boolean>(false)
    // 通道- 批量配置变量- 选中的控制器
    const controllerIds = ref<(string | number)[]>([])
    const batchStore = storeBatch()
    controllerIds.value = batchStore.selectController.ids
    onUnmounted(() => {
      controllerIds.value = []
      batchStore.selectController = {
        ids: [],
        list: []
      }
    })
    const check = async (value: number[]): Promise<void> => {
      try {
        loading.value = true
        if (value.length === 0) return
        const res = await listAggregationRowByCtlId(value.join(','))
        dataSource.value = ((res?.data ?? res) as GroupDataItem[]).map((res: GroupDataItem, index: number) => {
          // res.id = generateUUID()
          res.id = res.ctlId + '-' + index
          res.handle = false
          return res
        })
      } catch {
      } finally {
        loading.value = false
      }
    }

    const fromref = ref()
    const chengeInfo = (): void => {
      const ids = selectedRowKeysData.value
      for (let i = 0; i < ids.length; i++) {
        dataSource.value = dataSource.value.map(res => {
          if (batchInfo.configDevice && ids[i] === res.id) {
            if (batchInfo.info) res.groupName = batchInfo.info
            if (batchInfo.groupNumber) res.groupNumber = batchInfo.groupNumber
            res.handle = true
          }
          if (!batchInfo.configDevice && ids[i] === res.id && batchInfo.info) {
            res.virtualCode = batchInfo.info
            res.handle = true
          }

          return res
        })
      }
      devicevisible.value = false
    }
    const rowSelection = ref({

      onChange: (selectedRowKeys: string [], selectedRows: GroupDataItem[]) => {
        selectedRowKeysData.value = selectedRowKeys
      },

    })
    const keyword = ref<string>('')
    const keywordVar = ref<string>('')

    const queryList = (): void => {
      tableQueryData.value = tableData.value.filter((item) => {
        return (item.ctlCode && item.ctlCode.toLocaleLowerCase().includes(keyword.value.toLocaleLowerCase())) &&
        (item.varCode && item.varCode.toLocaleLowerCase().includes(keywordVar.value.toLocaleLowerCase()))
      })
    }
    const reset = (): void => {
      keyword.value = ''
      keywordVar.value = ''
      queryList()
    }

    const clumns = [
      {
        title: '控制器名称',
        dataIndex: 'ctlName',
        align: 'center',
        width: '240px',
        fixed: 'left',
        ellipsis: true,
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.ctlName?.localeCompare(b.ctlName),
        customRender: ({ record }: { record: GroupDataItem; }): JSX.Element => {
          const text = record.ctlName || record.groupName || '--'
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        },
      },
      {
        title: '控制器标识',
        dataIndex: 'ctlCode',
        width: '240px',
        align: 'center',
        ellipsis: true,
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.ctlCode?.localeCompare(b.ctlCode),
        customRender: ({ record }: { record: GroupDataItem; }): JSX.Element => {
          const text = record.ctlCode || record.virtualCode || '--'
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        },
      },
      {
        title: '变量名称',
        dataIndex: 'varName',
        width: 180,
        ellipsis: true,
        align: 'center',
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.varName?.localeCompare(b.varName),
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '变量标识',
        dataIndex: 'varCode',
        width: 180,
        ellipsis: true,
        align: 'center',
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.varCode?.localeCompare(b.varCode),
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: 'groupName',
        width: 260,
        ellipsis: true,
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.groupName?.localeCompare(b.groupName),
        customRender: ({ record }: { record: GroupDataItem; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              <Input maxlength={200} style={{ 'border-color': record.groupNameError ? 'red' : '' }} onChange={(e: { target: { value: string; }; }) => {
                groupNameChange(e, record)
              }} placeholder='请输入设备名称' showCount={false} v-model:value={record.groupName} />
              {
                record.groupNameError && <span class='error-msg'>{record.groupNameErrorMsg}</span>
              }
            </div>
          )
        }
      },
      {
        title: '设备编码',
        dataIndex: 'groupNumber',
        width: 260,
        ellipsis: true,
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.groupNumber?.localeCompare(b.groupNumber),
        customRender: ({ record }: { record: GroupDataItem; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              <Input maxlength={200} style={{ 'border-color': record.groupNumberError ? 'red' : '' }} onChange={(e: { target: { value: string; }; }) => {
                groupNumberChange(e, record)
              }} placeholder='请输入设备编码' showCount={false} v-model:value={record.groupNumber} />
              {
                record.groupNumberError && <span class='error-msg'>{record.groupNumberErrorMsg}</span>
              }
            </div>
          )
        }
      },
      {
        title: '属性标识',
        dataIndex: 'virtualCode',
        width: 280,
        ellipsis: true,
        sorter: (a: GroupDataItem, b: GroupDataItem): number => a.virtualCode?.localeCompare(b.virtualCode),
        customRender: ({ record }: { record: GroupDataItem; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              <Input maxlength={200} style={{ 'border-color': record.virtualCodeError ? 'red' : '' }} onChange={(e: { target: { value: string; }; }) => {
                virtualCodeChange(e, record)
              }} placeholder='请输入属性标识' showCount={false} v-model:value={record.virtualCode} />
              {
                record.virtualCodeError && <span class='error-msg'>{record.virtualCodeErrorMsg}</span>
              }
            </div>
          )
        }
      },

    ]

    const adddevice = (): void => {
      if (selectedRowKeysData.value.length === 0) {
        message.warning('请选择聚合变量')
        return
      }
      batchInfo.info = ''
      batchInfo.groupNumber = ''
      devicevisible.value = true
      batchInfo.configDevice = true
    }
    const addattr = (): void => {
      if (selectedRowKeysData.value.length === 0) {
        message.warning('请选择聚合变量')
        return
      }
      batchInfo.info = ''
      devicevisible.value = true
      batchInfo.configDevice = false
    }
    watch(() => dataSource.value, (newVal) => {
      tableData.value = newVal
    }, { deep: true })

    watch(() => tableData.value, (newVal) => {
      tableQueryData.value = newVal
      if (tableQueryData.value.length === newVal.length) {
        keyword.value = ''
        keywordVar.value = ''
      }
    }, { deep: true })

    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      validateForm()
      if (!isValidate.value) return
      try {
        saveLoading.value = true
        const handleList = tableData.value.filter(e => e.handle && (e.groupName && e.groupNumber && e.virtualCode))
        if (handleList.length > 0) {
          await saveOrUpdateAggregationRow(handleList)
          message.success('操作成功')
          saveLoading.value = false
        } else {
          message.warning('当前没有改变的数据!')
        }
      } catch {
      } finally {
        setTimeout(() => {
          saveLoading.value = false
        }, 800)
      }
    }
    const layoutRightSlots = {
      'layout-search': (): JSX.Element => {
        return (
          <>
            <div class='flexBetween'>
              <Form layout='inline'>
                <FormItem label='控制器标识'>
                  <Input style={{ width: '240px' }} v-model:value={keyword.value} placeholder='请输入控制器标识' showCount={false} onSearch={async () => {
                    queryList()
                  }} onChange={async () => {
                    queryList()
                  }} />
                </FormItem>
                <FormItem label='变量标识'>
                  <Input style={{ width: '180px' }} v-model:value={keywordVar.value} placeholder='请输入变量标识' showCount={false} onSearch={async () => {
                    queryList()
                  }} onChange={async () => {
                    queryList()
                  }} />
                </FormItem>
                <FormItem>
                  <Button type='primary' onClick={() => {
                    queryList()
                  }}>查询</Button>
                  <Button onClick={() => {
                    reset()
                  }}>重置</Button>
                </FormItem>
              </Form>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <VirtualTable
              scrollX={400}
              scrollY={scorllY.value - 160}
              rowKey='id'
              size='small'
              rowSelection={rowSelection.value}
              pagination={false}
              columns={clumns}
              dataSource={tableQueryData.value}
              loading={loading.value}
              className='ant-table-striped'
              rowClassName={(index: number) => (index % 2 === 1 ? 'table-striped' : null)}
              rowHeight={40}
              bufferSize={20}
            />
          </>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            <div>
              <Button onClick={() => {
                history.back()
              }}>返回</Button>
              <Button class='ml-10px' type='primary' disabled={tableData.value.length === 0} loading={saveLoading.value} onClick={save}>保存</Button>
            </div>
          </>
        )
      },
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' onClick={adddevice} style='margin-right:20px'>批量设置设备</Button>
              <Button type='primary' onClick={addattr}>批量配置属性标识</Button>
            </div>
          </>
        )
      }
    }
    const layoutSlots = {
      'layout-left': (): JSX.Element => {
        return (
          <div><GatewayTree levelNeed={3} checkable onCheck={check} checkedList={controllerIds.value} /> </div>
        )
      },
      'layout-right': (): JSX.Element => {
        return (
          <>
            <Layout title='批量聚合变量' v-slots={layoutRightSlots} />
          </>
        )
      },
    }
    const inputVirtualCode = (value: { target: { value: string; }; }): void => {
      const inputValue = value.target.value
      if (!batchInfo.configDevice) {
        batchInfo.info = inputValue.replace(/\s/g, '')
      }
    }
    return (): JSX.Element=>
      <>
        <CLayout title={batchInfo.configDevice ? '批量配置设备' : '批量配置属性标识'} v-slots={layoutSlots} showFooter={false} />
        <Modal
          title={batchInfo.configDevice ? '批量配置设备' : '批量配置属性标识'}
          visible={devicevisible.value}
          onOk={chengeInfo}
          onCancel={() => {
            devicevisible.value = false
          }}
          maskClosable={false}
        >
          <Form model={batchInfo} ref={fromref}>
            <FormItem label={batchInfo.configDevice ? '批量配置设备名称' : '批量配置属性标识'} name='info'>
              <Input maxlength={200} onInput={inputVirtualCode} showCount={false} v-model:value={batchInfo.info} />
            </FormItem>
            {
              batchInfo.configDevice &&
              <FormItem label='批量配置设备编码' name='groupNumber'>
                <Input
                  maxlength={200} onChange={(e: { target: { value: string; }; }) => {
                    const inputValue = e.target.value
                    batchInfo.groupNumber = inputValue.replace(/\s/g, '')
                  }} showCount={false} v-model:value={batchInfo.groupNumber}
                />
              </FormItem>
            }
          </Form>

        </Modal>
      </>
  }
})
