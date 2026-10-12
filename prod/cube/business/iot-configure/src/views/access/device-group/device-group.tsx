import { defineComponent, reactive, ref } from 'vue'
import { CLayout } from '@/components/clayout/clayout'
import { DeviceModel } from './components/device-model'
import { PopConfirm, Page, Input, Button, Table, message, Modal, PopOver, Form, FormItem, AntModal, Progress } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { GatewayTree } from '@/components/tree'
import { useRouter } from 'vue-router'
import './device-group.less'
import { aggregationListPage, aggregationGroupRelModify, aggregationDeleteByPrimaryKey, aggregationGroupModify } from '@/api/device'
import { Layout } from '@/components/layout/layout'
import type { TreeDataItemNode } from '@ghcloud/cube-ui/src/components/tree/tree'
import { exportExcel } from '@/utils/common'
import { useTableScroll } from '@/hook/use-table-scroll'
import { useBatchDelete } from '@/hook/use-batch-delete'
interface TableData {
  devNum: string;
  groupId: string;
  groupName: string;

  refCTLIDS: string;

  refCTLList: {
    id: string;
    name: string;
  }[];
  relGroupInfo: null | string;
  varCount: number;
}
export const DeviceGroup = defineComponent({

  setup: () => {
    const { scorllY } = useTableScroll()
    const router = useRouter()
    const gwId = ref<string>('')
    const gatewayCode = ref<number>(0)
    const modelVisible = ref<boolean>(false)
    const deviceName = ref<string>('')
    const modifyFlag = ref(false)
    const rowData = ref<TableData>({
      devNum: '',
      groupId: '',
      groupName: '',
      refCTLIDS: '',
      refCTLList: [],
      relGroupInfo: null,
      varCount: 0,
    })
    const selectedRowKeysData = ref<string[]>([])
    const selectedRowData = ref<TableData[]>([])
    const rowSelection = reactive({
      selectedRowKeys: selectedRowKeysData.value,
      onChange: (selectedRowKeys: string [], selectedRows: TableData[]) => {
        selectedRowKeysData.value.length = 0
        selectedRowKeysData.value.push(...selectedRowKeys)
        selectedRowData.value = selectedRows
      },
      getCheckboxProps: () => ({
        disabled: modifyFlag.value,
      })
    })
    const modelRef = ref()
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const deviceTable = reactive<{ columns: ColumnType[]; tableData: TableData[]; loading: boolean; }>({
      columns: [
        {
          title: '设备编码',
          dataIndex: 'devNum',
          align: 'center',
          width: '240px',
          fixed: 'left',
          ellipsis: true,
          customRender: ({ record, text }: { text: string; record: { devNum: string; groupId?: string; }; }): JSX.Element => {
            return modifyFlag.value
              ? <Input
                maxlength={200} showCount={false} v-model:value={record.devNum} onChange={(e: { target: { value: string; }; }) => {
                  const inputValue = e.target.value
                  record.devNum = inputValue.replace(/\s/g, '')
                }}
              />
              : <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '设备名称',
          dataIndex: 'groupName',
          align: 'center',
          width: '240px',
          ellipsis: true,
          customRender: ({ record, text }: { text: string; record: { groupName: string; }; }): JSX.Element => {
            return modifyFlag.value
              ? <Input maxlength={200} showCount={false} v-model:value={record.groupName} />
              : <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '关联控制器',
          dataIndex: 'refCtlList',
          width: 180,
          ellipsis: true,
          align: 'center',
          customRender: ({ record }: { record: { refCtlList: { name: string; id: string; }[]; }; }): JSX.Element => {
            return <>
              {
                record.refCtlList.map(e => {
                  return <>
                    <Button key={e.id} type='link' size='small' onClick={() => controllerDetail(e)}>{e.name}</Button>
                  </>
                })
              }
            </>
          }
        },
        {
          title: '设备变量数',
          dataIndex: 'varCount',
          width: 120,
          ellipsis: true,
          align: 'center',
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '关联组',
          dataIndex: 'relGroupName',
          width: 180,
          ellipsis: true,
          align: 'center',
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: '180px',
          customRender: ({ record }: { record: TableData; }): JSX.Element => {
            return (
              <>
                <Button type='link' size='small' onClick={() => {
                  editRow(record)
                }}>详情</Button>
                <Button type='link' size='small' onClick={() => {
                  association(record)
                }}>关联</Button>
                <PopConfirm title='确认删除该项？' onConfirm={() => {
                  delRow(record)
                }}>
                  <Button type='link' size='small' danger>删除</Button>
                </PopConfirm>
              </>
            )
          }
        },
      ],
      tableData: [],
      loading: false
    })
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      modifyFlag.value = false
      selectedRowKeysData.value.length = 0
      getDeviceList()
    }
    const editRow = (record: TableData): void => {
      router.push({ path: '/device-group-detail', query: { groupId: record.groupId, gwId: gwId.value, channelId: gatewayCode.value } })
    }
    const association = (record: TableData): void => {
      rowData.value = record
      modelVisible.value = true
    }
    const controllerDetail = (refCtl: { name: string; id: string; }): void => {
      const info = {
        gwId: gwId.value,
        channelId: gatewayCode.value,
        controllerId: refCtl.id
      }
      router.push({ path: '/gateway-detail', query: { from: 'deviceGroup', gwId: info.gwId, channelId: info.channelId, controllerId: info.controllerId } })
    }
    const handleOkFormModelTable = async (): Promise<void> => {
      const associationList: string[] = []
      rowData.value?.relGroupInfo?.split(',').forEach((item, index) => {
        if ((index + 1) % 2 !== 0) {
          associationList.push(item)
        }
      })
      const temp = associationList.concat(modelRef.value.showData().selectedRowKeys).filter(item => !modelRef.value.showData().selectedRowKeys.includes(item))
      const delRelList: {
        sourceGroupId: string;
        targetGroupId: string;
      }[] = temp.map((item: string) => {
        return {
          sourceGroupId: rowData.value.groupId,
          targetGroupId: item
        }
      })
      const addRelList: {
        sourceGroupId: string;
        targetGroupId: string;
      }[] = modelRef.value.showData().selectedRowKeys.map((item: string) => {
        return {
          sourceGroupId: rowData.value.groupId,
          targetGroupId: item
        }
      })
      const params = {
        addRelList,
        delRelList
      }
      await aggregationGroupRelModify(params)
      await getDeviceList()
      message.success('关联成功')
      modelVisible.value = false
    }
    const cancel = (): void => {
      modelVisible.value = false
    }
    const select = async (value: number, e: { node: { level: number; titleId: number; parent: TreeDataItemNode; }; }) => {
      gatewayCode.value = value
      pagination.value.pageNumber = 1
      getDeviceList()
      gwId.value = e.node?.parent?.node?.parentId || e.node?.parent?.node.titleId
      router.replace({
        query: {
          gwId: gwId.value,
          channelId: value
        }
      })
    }
    const delRow = async (record: TableData): Promise<void> => {
      await aggregationDeleteByPrimaryKey(record.groupId)
      getDeviceList()
      message.success('操作成功')
    }
    const { batchDelete, deleteLoading, progress, removeNum, deleteStatus } = useBatchDelete()
    const deleteResultVisible = ref(false)
    const handleBatchDeleteResult = (): void => {
      deleteResultVisible.value = false
      selectedRowKeysData.value.length = 0
      getDeviceList()
    }
    const handleBatchDelete = (): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除当前选中?',
        async onOk () {
          try {
            deleteResultVisible.value = true
            progress.value = 0
            batchDelete({
              deleteKeys: selectedRowKeysData.value,
              size: 1,
              deleteDataFunc: async (ids: string[]) => aggregationDeleteByPrimaryKey(Array.isArray(ids) ? ids[0] : ids)
            })
          } catch {
          } finally {
            AntModal.destroyAll()
          }
        },
        onCancel () {
          AntModal.destroyAll()
        }
      })
    }
    // 查询
    const queryDevice = (): void => {
      deviceName.value = ''
      getDeviceList()
    }
    //  获取设备列表
    const getDeviceList = async (): Promise<void> => {
      try {
        deviceTable.loading = true
        selectedRowData.value = []
        selectedRowKeysData.value.length = 0
        modifyFlag.value = false
        const params = {
          channelId: gatewayCode.value,
          keyword: deviceName.value,
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber
        }
        if (!params.channelId) return
        const res = await aggregationListPage(params)

        deviceTable.tableData = res.data.rows.map((item: { associateController: unknown; refCtlList: { name: string; }[]; relGroupInfo: string; relGroupName: unknown; }) => {

          item.associateController = item.refCtlList.map((data: { name: string; }) => {
            if (data) return data.name
          }).join(',')
          if (item.relGroupInfo) {

            item.relGroupName = item.relGroupInfo.split(',').map((item: string, index: number) => {
              if ((index + 1) % 2 === 0) {
                return item
              }
            })
          }
          return item
        })
        pagination.value.total = res.data.pageTotal
      } catch {
      } finally {
        deviceTable.loading = false
      }
    }
    const updateRight = async (value: number): Promise<void> => {
      if (value) {
        gatewayCode.value = value
        pagination.value.pageNumber = 1
        getDeviceList()
      }
    }
    // 修改设备
    const modifyEvent = async (): Promise<void> => {
      if (selectedRowData.value.length === 0) {
        message.warning('请选择要修改的设备')
        return
      }
      if (modifyFlag.value) {
        const arr: TableData[] = []
        const regex = /^[\x20-\x7E]+$/
        deviceTable.tableData.forEach(item => {
          selectedRowKeysData.value.forEach(data => {
            if (item.groupId === data) {
              arr.push(item)
            }
          })
        })

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].devNum === '' || arr[i].groupName === '') {
            message.warning('修改的值不能为空')
            return
          } else if (!regex.test(arr[i].devNum)) {
            message.warning('设备编码只能是由字母,数字,符号组成')
            return
          }
        }
        await aggregationGroupModify(arr)
        await getDeviceList()
        selectedRowKeysData.value.length = 0
        message.success('修改成功')
        modifyFlag.value = false
      } else {
        modifyFlag.value = true
      }
    }
    const exportLoading = ref(false)
    const deviceExport = (): void => {
      exportLoading.value = true
      exportExcel('/aggregation/exportExcel', { channelId: gatewayCode.value }, '设备导出列表').then(() => {
        exportLoading.value = false
      })
    }
    const layoutRightSlots = {
      'layout-search': (): JSX.Element => {
        return (
          <>
            <div class='flexBetween'>
              <Form layout='inline'>
                <FormItem label='名称'>
                  <Input style={{ width: '280px' }} v-model:value={deviceName.value} placeholder='请输入设备编码、设备名称' showCount={false} onSearch={async () => getDeviceList()} onChange={async () => getDeviceList()} />
                </FormItem>
                <FormItem>
                  <Button type='primary' onClick={async () => getDeviceList()}>查询</Button>
                  <Button onClick={queryDevice}>重置</Button>
                </FormItem>
              </Form>
              <div>
                {
                  deviceTable.tableData.length > 0 && <Button type='primary' disabled={selectedRowKeysData.value.length === 0} loading={deleteLoading.value} onClick={async () => {
                    handleBatchDelete()
                  }}>批量删除</Button>
                }
                {
                  deviceTable.tableData.length > 0 && <Button type='primary' loading={exportLoading.value} onClick={async () => {
                    deviceExport()
                  }}>导出</Button>
                }
                {
                  deviceTable.tableData.length > 0 && <Button type='primary' onClick={async () => {
                    modifyEvent()
                  }}>{modifyFlag.value ? '保存' : '修改'}</Button>
                }
                {
                  selectedRowData.value.length > 0 && modifyFlag.value && <Button onClick={async () => {
                    modifyFlag.value = false
                  }}>取消</Button>
                }
              </div>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <Table
              rowSelection={rowSelection}
              loading={deviceTable.loading}
              columns={deviceTable.columns}
              dataSource={modifyFlag.value ? selectedRowData.value : deviceTable.tableData}
              scrollY={scorllY.value - 160}
              size='small'
              rowKey='groupId'
              pagination={false}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Page
              class='pagePosition'
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />
          </>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            <Button onClick={() => {
              history.back()
            }}>返回</Button>
          </>
        )
      }
    }
    const layoutSlots = {
      'layout-left': (): JSX.Element => {
        return (
          <>
            <div class='deviceLeft'>
              <div><GatewayTree levelNeed={2} checkable={false} onSelect={select} onUpdateRight={updateRight} /> </div>
            </div>
          </>
        )
      },
      'layout-right': (): JSX.Element=> {
        return (
          <>
            <Layout title='设备列表' v-slots={layoutRightSlots} />
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Modal
          destroyOnClose
          width='1000px'
          visible={modelVisible.value}
          onOk={handleOkFormModelTable}
          onCancel={cancel}
          maskClosable={false}
        >
          <DeviceModel ref={modelRef} association={rowData.value} channelId={gatewayCode.value} deviceName={deviceName.value} />
        </Modal>
        <CLayout title='设备列表' v-slots={layoutSlots} showFooter={false} />
        <Modal
          visible={deleteResultVisible.value}
          title='批量删除进度'
          width='400px'
          onCancel={handleBatchDeleteResult}
          onOk={handleBatchDeleteResult}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Progress steps='5' percent={(progress.value ?? 0) * 100} style={{ display: 'inline-flex', width: '90px', position: 'relative', padding: '20px 0 10px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
              <span>已删除 {removeNum.value}/{selectedRowKeysData.value.length} 个设备，</span>
              {
                deleteStatus.value !== 'error' && (
                  !deleteLoading.value && removeNum.value > 0
                    ? <span>批量删除完成!</span>
                    : <span>正在删除，请勿重复操作!</span>
                )
              }
              {
                deleteStatus.value === 'error' && <span style={{ color: '#cf1322' }}>操作失败!</span>
              }
            </div>
          </div>
        </Modal>
      </>
  }
})
