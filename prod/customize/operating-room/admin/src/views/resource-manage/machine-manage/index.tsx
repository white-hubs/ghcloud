import { computed, defineComponent, reactive } from 'vue'
import styles from './index.module.less'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Table, Page, Image, ImagePreviewGroup, PopConfirm, message } from '@ghcloud/cube-ui'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { BatchImportModal } from '../components/batch-import-modal'
import { EditMachineModal } from './edit-machine-modal'
import { cubeOperatingRoomService } from '@/api/service'
import { useCommonStore } from '@/hook/common-store.hook'
import type { OSSFile } from '@/components/business/file-upload/file-upload'
import type { ResourceMachinesRecord } from '@ghcloud/cube-operating-room-service'
export const MachineManage = defineComponent({
  setup: () => {
    const state = reactive<{
      searchParams: {
        tenant: string;
        pageNumber: number;
        pageSize: number;
        code: string;
        total: number;
      };
      loading: boolean;
      batchImportVisible: boolean;
      editVisible: boolean;
      info: boolean;
      editFormState: ResourceMachinesRecord;
      dataSource: ResourceMachinesRecord[];
    }>({
      searchParams: {
        tenant: '',
        code: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      loading: false,
      info: false,
      editFormState: {
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
      batchImportVisible: false,
      editVisible: false,
      dataSource: []
    })
    const commonStore = useCommonStore()
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'code',
        ellipsis: true,
        align: 'center',
        customRender: (): JSX.Element => {
          return (
            <>
              {tenantName.value}
            </>
          )
        }
      },
      {
        title: '机组编号',
        dataIndex: 'code',
        ellipsis: true,
        align: 'center',
      },
      {
        title: '机组铭牌参数',
        dataIndex: 'arguments',
        ellipsis: true,
        align: 'center',
      },
      {
        title: '机组铭牌附件',
        dataIndex: 'fileList',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { fileList: OSSFile[]; }; }): JSX.Element => {
          return (
            <div class={styles.imageGroup}>
              <ImagePreviewGroup>
                {record.fileList.map((item: OSSFile) => {
                  return (
                    <Image src={item.path} width={80} height={80} alt={item.name} />
                  )
                })}
              </ImagePreviewGroup>
            </div>

          )
        }
      },
      {
        title: '关联手术室数量',
        dataIndex: 'roomNumber',
        ellipsis: true,
        align: 'center',
      },
      {
        title: '操作',
        dataIndex: 'deptName',
        align: 'center',
        customRender: ({ record }: { record: ResourceMachinesRecord; }): JSX.Element => {
          return (
            <div class={styles.operation}>
              <Button type='link' style={{ padding: '4px' }} onClick={() => {
                handleRelateRoom(record.id)
              }}>关联手术室</Button>
              <Button type='link' style={{ padding: '4px' }} onClick={() => {
                handleInfoMachine(record)
              }}>详情</Button>
              <Button type='link' style={{ padding: '4px' }} onClick={() => {
                handleEditMachine(record)
              }}>编辑</Button>
              <PopConfirm title='是否确认删除当前机组' onConfirm={() => {
                handleDeleteMachine(record.id)
              }} okText='确定' cancelText='取消'>
                <Button type='link' danger style={{ padding: '4px' }}>删除</Button>
              </PopConfirm>
            </div>
          )
        }
      },
    ]
    const handleDeleteMachine = async (id: string): Promise<void> => {
      await cubeOperatingRoomService.deleteResourceMachines({ id })
      getList()
    }
    const handleInfoMachine = (record: ResourceMachinesRecord): void => {
      state.info = true
      state.editFormState = record
      state.editVisible = true
    }

    const tenantName = computed(() => {
      const tenantCode = state.searchParams.tenant
      const tenant = commonStore.tenantsOptions.find((item) => item.code === tenantCode)
      if (tenant) {
        return tenant.name
      }
      return '--'
    })
    const handleEditMachine = (record: ResourceMachinesRecord): void => {
      state.info = false
      state.editFormState = record
      state.editVisible = true
    }
    const resetFormState = (): void => {
      state.editFormState = {
        id: '',
        code: '',
        arguments: '',
        fileIds: '',
        roomIds: '',
        createTime: 0,
        tenant: '',
        fileList: [],
        roomNumber: 0
      }
    }
    const handleRelateRoom = (id: string): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/operating-room-admin/relate-operating-room?tenant=${state.searchParams.tenant}&id=${id}`)
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeOperatingRoomService.getResourceMachinesPage({
          ...state.searchParams
        })
        state.dataSource = result.records
        state.searchParams.total = result.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      } finally {
        state.loading = false
      }
    }
    const handleChangeTenant = (): void => {
      getList()
    }
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
                  <TenantSelect style={{ width: '180px' }} onChange={handleChangeTenant} v-model:value={state.searchParams.tenant} />
                </FormItem>
                <FormItem label='机组编号' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Input style={{ width: '180px' }} v-model:value={state.searchParams.code} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
                </FormItem>
              </Form>
              <div class={styles.addMachine}>
                <Button
                  type='primary' onClick={() => {
                    resetFormState()
                    state.info = false
                    state.editVisible = true
                  }}
                >新增机组
                </Button>
              </div>
            </div>
            <div class={styles.contentBody}>
              <Table loading={state.loading} pagination={false} columns={columns} dataSource={state.dataSource} size='small' />
            </div>
          </div>
        )
      },
      'footer-page': (): JSX.Element => <Page total={state.searchParams.total} onPageChange={handlePageChange} />
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.code = ''
      handleSearch()
    }
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleOkEditMachine = async (formState: {
      tenant: string;
      code: string;
      id?: string;
      arguments: string;
      files: OSSFile[];
    }): Promise<void> => {
      try {
        if (formState.id) {
          await cubeOperatingRoomService.updateResourceMachines({
            id: formState.id,
            tenant: formState.tenant,
            code: formState.code,
            arguments: formState.arguments,
            fileIds: formState.files.map(item => item.id).join(',')
          })
        } else {
          await cubeOperatingRoomService.createResourceMachines({
            tenant: formState.tenant,
            code: formState.code,
            arguments: formState.arguments,
            fileIds: formState.files.map(item => item.id).join(',')
          })
        }
        state.editVisible = false
        resetFormState()
        await getList()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      }
    }
    return (): JSX.Element => (
      <Layout title='机组管理' v-slots={layoutSlots}>
        <EditMachineModal info={state.info} formState={state.editFormState} v-model:visible={state.editVisible} onOk={handleOkEditMachine} />
        <BatchImportModal type='machines' tenant={state.searchParams.tenant} v-model:visible={state.batchImportVisible} />
      </Layout>
    )
  }
})
