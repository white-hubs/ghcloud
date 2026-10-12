import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, message, Page, PopConfirm, Table } from '@ghcloud/cube-ui'
import { DeviceModalTable } from '@/components/device-modal-table'
import { cubeOperatingRoomService } from '@/api/service'
import { useRoute } from 'vue-router'
import type { ResourceMachinesRecord } from '@ghcloud/cube-operating-room-service'
interface SelectedVo {
  id: string;
  name: string;
}
export const RelateOperatingRoom = defineComponent({
  setup: () => {
    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const route = useRoute()
    const state = reactive<{
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;

      };
      batchImportVisible: boolean;
      selectedRow: SelectedVo[];
      machineState: ResourceMachinesRecord;
      dataSource: Record<string, string>[];
    }>({
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        keyword: ''
      },
      batchImportVisible: false,
      machineState: {
        id: '',
        code: '',
        arguments: '',
        fileIds: '',
        roomIds: '',
        createTime: 0,
        tenant: '',
        fileList: [],
        roomNumber: 0
      },
      selectedRow: [],
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
        title: '分类',
        dataIndex: 'productTypeName',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '所在区域',
        dataIndex: 'areaPathName',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '维护部门',
        dataIndex: 'deptName',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '操作',
        align: 'center',
        dataIndex: 'deptName',
        customRender: ({ record }: { record: { deviceId: string; }; }): JSX.Element => {
          return (
            <div class={styles.operation}>
              <PopConfirm title='是否确认移除?' onConfirm={() => {
                handleDelete(record.deviceId)
              }} okText='确定' cancelText='取消'>
                <Button type='link' danger style={{ padding: '4px' }}>移除</Button>
              </PopConfirm>
            </div>
          )
        }
      },
    ]
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button
            type='primary' onClick={(): void => {
              deviceModalTableRef.value?.openModal()
            }}
          >新增手术室
          </Button>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.container}>
            <div class={styles.contentHeader}>
              <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
                <FormItem label='手术室' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Input style={{ width: '180px' }} v-model:value={state.searchParams.keyword} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
                </FormItem>
              </Form>
            </div>
            <div class={styles.contentBody}>
              <Table pagination={false} columns={columns} dataSource={state.dataSource} size='small' />
            </div>
          </div>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <Button
            type='primary' onClick={() => {
              history.back()
            }}
          >返回
          </Button>
        )
      },
      'footer-page': (): JSX.Element => {
        return <Page total={state.searchParams.total} onPageChange={handlePageChange} />
      }
    }
    const handleDelete = async (id: string): Promise<void> => {
      try {
        await cubeOperatingRoomService.deleteResourceMachinesRoom({
          tenant: route.query.tenant as string,
          id: route.query.id as string,
          roomIds: id
        })
        getDetails()
        getList()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      }
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.keyword = ''
      handleSearch()
    }
    const getDetails = async (): Promise<void> => {
      const tenant = route.query.tenant as string
      const id = route.query.id as string
      const result = await cubeOperatingRoomService.getResourceMachinesDetail({
        tenant,
        id
      })
      state.machineState = result
      if (result.roomIds) {
        state.selectedRow = result.roomIds.split(',').map((item) => {
          return {
            id: item,
            name: ''
          }
        })
      }
    }
    const getList = async (): Promise<void> => {
      try {
        const tenant = route.query.tenant as string
        const id = route.query.id as string
        const result = await cubeOperatingRoomService.getResourceMachinesRoomList({
          tenant,
          id,
          ...state.searchParams
        })
        state.dataSource = result.records as Record<string, string>[]
        state.searchParams.total = result.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      }
    }
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getDetails()
      getList()
    })
    const handleSelectModalOk = async (): Promise<void> => {

      await cubeOperatingRoomService.createResourceMachinesRoom({
        tenant: route.query.tenant as string,
        id: route.query.id as string,
        roomIds: state.selectedRow.map((item) => {
          return item.id
        }).join(',')
      })
      getDetails()
      getList()
    }
    return (): JSX.Element => (
      <Layout title={`关联手术室机组编号:${state.machineState.code}`} v-slots={layoutSlots}><DeviceModalTable tenant={route.query.tenant} applicationCode='RESOURCE_MANAGE' ref={deviceModalTableRef} v-model:value={state.selectedRow} onOk={handleSelectModalOk} /></Layout>
    )
  }
})
