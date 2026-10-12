import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import styles from './index.module.less'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Table, Tree, Input, message, PopConfirm, Page } from '@ghcloud/cube-ui'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { EditModal } from './edit-modal'
import { BatchImportModal } from '../components/batch-import-modal'
import { cubeOperatingRoomService } from '@/api/service'
import type { DeptDeviceTreeVo } from '@ghcloud/cube-operating-room-service'
export const StuffManage = defineComponent({
  setup: () => {
    const state = reactive<{
      searchParams: {
        pageNumber: number;
        pageSize: number;
        total: number;
        tenant: string;
        deviceCode: string;
        deviceName: string;
        deviceId: string;
      };
      batchImportVisible: boolean;
      editFormState: {
        id: string;
        name: string;
        size: string;
        number: string;
        manufacturer: string;
        model: string;
      };
      treeData: DeptDeviceTreeVo[];
      editVisible: boolean;
      loading: boolean;
      treeHeight: number;
      dataSource: Record<string, string>[];
    }>({
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        tenant: '',
        deviceId: '',
        deviceCode: '',
        deviceName: '',
      },
      treeData: [],
      treeHeight: 500,
      loading: false,
      editFormState: {
        id: '',
        name: '',
        size: '',
        number: '',
        manufacturer: '',
        model: ''
      },
      batchImportVisible: false,
      editVisible: false,
      dataSource: []
    })
    const columns = [
      {
        title: '手术室',
        dataIndex: 'deviceName',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '编号',
        dataIndex: 'deviceCode',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '物品名称',
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '尺寸',
        dataIndex: 'size',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '数量',
        dataIndex: 'number',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '厂家',
        dataIndex: 'manufacturer',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '型号',
        dataIndex: 'model',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '机组编号',
        dataIndex: 'machinesCode',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
        customRender: ({ record }: { record: typeof state.editFormState; }): JSX.Element => {
          return (
            <div class={styles.operation}>
              <Button type='link' style={{ padding: '4px' }} onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <PopConfirm title='是否确认删除当前物品' onConfirm={() => {
                handleDelete(record.id)
              }} okText='确定' cancelText='取消'>
                <Button style={{ padding: '4px' }} type='link' danger>删除</Button>
              </PopConfirm>
            </div>
          )
        }
      },
    ]
    const handleDelete = async (id: string): Promise<void> => {
      try {
        await cubeOperatingRoomService.deleteResourceItem({ id })
        getList()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      }
    }
    const handleAdd = (): void => {
      state.editFormState = {
        id: '',
        name: '',
        size: '',
        number: '',
        manufacturer: '',
        model: ''
      }
      state.editVisible = true
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeOperatingRoomService.getResourceItemList({
          tenant: state.searchParams.tenant,
          pageNumber: state.searchParams.pageNumber,
          pageSize: state.searchParams.pageSize,
          deviceId: state.searchParams.deviceId,
        })
        state.dataSource = result.records as Record<string, string>[]
        state.searchParams.total = result.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      } finally {
        state.loading = false
      }
    }
    const handleChangeTenant = (): void => {
      getResourceDeptDeviceTree()
    }
    const handleEdit = (record: typeof state.editFormState): void => {
      state.editFormState = record
      state.editVisible = true
    }
    const handleEditOk = async (formState: {
      name: string;
      id: string;
      size: string;
      number: string;
      manufacturer: string;
      model: string;
    }): Promise<void> => {
      try {
        if (formState.id) {
          await cubeOperatingRoomService.updateResourceItem({
            ...formState,
            tenant: state.searchParams.tenant,
            deviceId: state.searchParams.deviceId,
            deviceCode: state.searchParams.deviceCode,
            deviceName: state.searchParams.deviceName,
          })
        } else {
          await cubeOperatingRoomService.createResourceItem({
            ...formState,
            tenant: state.searchParams.tenant,
            deviceId: state.searchParams.deviceId,
            deviceCode: state.searchParams.deviceCode,
            deviceName: state.searchParams.deviceName,
          })
        }
        state.editVisible = false
        message.success('操作成功')
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      } finally {
        getList()
      }
    }
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const getResourceDeptDeviceTree = async (): Promise<void> => {
      try {
        const result = await cubeOperatingRoomService.getResourceDeptDeviceTree({ tenant: state.searchParams.tenant })
        handleTreeResult(result)
        state.treeData = result
        getList()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      }
    }
    const handleTreeResult = (tree: DeptDeviceTreeVo[]): void => {
      for (const treeItem of tree) {
        treeItem.selectable = !!treeItem.deviceBool
        if (treeItem.children) {
          handleTreeResult(treeItem.children)
        }
      }
    }
    onMounted(() => {
      getTreeScrollY()
    })
    const getTreeScrollY = (): void => {
      const tree = document.getElementById('tree')
      state.treeHeight = (tree?.clientHeight || 500) - 30
    }
    const handleSelectDevice = (key: string[], e: { selectedNodes: DeptDeviceTreeVo[]; }): void => {
      state.searchParams.deviceId = e.selectedNodes[0].id
      state.searchParams.deviceCode = e.selectedNodes[0].code
      state.searchParams.deviceName = e.selectedNodes[0].name
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const treeSlots = {
      title: ({ data }: { data: DeptDeviceTreeVo; }): JSX.Element => {
        if (data.deviceBool) {
          return (
            <div>
              <span style={{ color: '#000000', fontSize: '14px' }}>{data.name}{data.code}</span>
            </div>
          )
        }
        return (
          <div>
            <span style={{ color: '#000000', fontSize: '14px' }}>{data.name}</span>
          </div>
        )
      }
    }
    const expandedKeys = ref<string[]>([])
    watch(() => state.searchParams.deviceId, () => {
      expandedKeys.value = [state.searchParams.deviceId]
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button
            type='primary' onClick={() => {
              state.batchImportVisible = true
            }}
          >批量导入
          </Button>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.container}>
            <div class={styles.contentHeader}>
              <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
                <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <TenantSelect onChange={handleChangeTenant} style={{ width: '180px' }} v-model:value={state.searchParams.tenant} />
                </FormItem>
              </Form>
            </div>
            <div class={styles.contentBody}>
              <div class={styles.leftTree} id='tree'>
                {}
                <Tree
                  height={state.treeHeight}
                  v-slots={treeSlots}
                  fieldNames={{
                    children: 'children',
                    title: 'name',
                    key: 'id',
                  }} onSelect={handleSelectDevice} selectedKeys={expandedKeys.value} style={{ textAlign: 'left' }} treeData={state.treeData}
                />
              </div>
              <div class={styles.contentTable}>
                <div class={styles.searchBar}>
                  <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
                    <FormItem label='物品名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                      <Input />
                    </FormItem>
                    <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                      <Button type='primary' onClick={handleSearch}>查询</Button>
                      <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
                    </FormItem>
                  </Form>
                  <Button type='primary' onClick={handleAdd}>新增</Button>
                </div>

                <Table loading={state.loading} pagination={false} dataSource={state.dataSource} columns={columns} size='small' />
              </div>
            </div>

          </div>
        )
      },
      'footer-page': (): JSX.Element => <Page total={state.searchParams.total} onPageChange={handlePageChange} />
    }
    return (): JSX.Element => (
      <Layout title='物品管理' v-slots={layoutSlots}>
        <EditModal v-model:visible={state.editVisible} formState={state.editFormState} onOk={handleEditOk} />
        <BatchImportModal tenant={state.searchParams.tenant} type='items' v-model:visible={state.batchImportVisible} />
      </Layout>
    )
  }
})
