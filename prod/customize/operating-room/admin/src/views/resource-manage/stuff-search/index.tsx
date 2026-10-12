import { computed, defineComponent, onMounted, reactive } from 'vue'
import { Layout } from '@/components/layout/layout'
import styles from './index.module.less'
import { Button, Form, FormItem, Table, Page, message } from '@ghcloud/cube-ui'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { DeptSelect } from '@/components/business/dept-select/dept-select'
import { cubeOperatingRoomService } from '@/api/service'
import type { ItemDetailsVo, ItemList } from '@ghcloud/cube-operating-room-service'
import type { OSSFile } from '@/components/business/file-upload/file-upload'
import { PreviewImages } from '../components/preview-image-modal'
import { authStore } from '@/api/auth-store'
import { downloadExcelFile } from '@/utils'
import { useCommonStore } from '@/hook/common-store.hook'
// import {} '
const getRowspan = (dataSource: Record<string, string>[], filed: string): number[] => {
  const spanArr: number[] = []
  let position = 0
  dataSource.forEach((item: unknown, index: number) => {
    if (index === 0) {
      spanArr.push(1)
      position = 0
    } else {
      // 需要合并的地方判断
      if (dataSource[index][filed] === dataSource[index - 1][filed]) {
        spanArr[position] += 1
        spanArr.push(0)
      } else {
        spanArr.push(1)
        position = index
      }
    }
  })
  return spanArr
}
export const StuffSearch = defineComponent({
  setup: () => {
    const state = reactive<{
      searchParams: {
        pageNumber: number;
        pageSize: number;
        total: number;
        tenant: string;
        deptId: string;
      };
      dataSource: ItemList[];
      imageVisible: boolean;
      exportLoading: boolean;
      previewImages: OSSFile[];
      tenantsOptions: { name: string; code: string; }[];
      loading: boolean;
      terminal: string;
    }>({
      exportLoading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        tenant: '',
        deptId: '',
      },
      imageVisible: false,
      loading: false,
      tenantsOptions: [],
      previewImages: [],
      terminal: 'kh-admin',
      dataSource: []
    })
    const columns = [
      {
        title: '所属部门',
        dataIndex: 'deptName',
        align: 'center',
        customCell: (record: unknown, rowIndex: number): {rowSpan: number;} => {
          const mergeList = getRowspan(state.dataSource as unknown as Record<string, string>[], 'deptName')
          return {
            rowSpan: mergeList[rowIndex],
          }
        }
      },
      {
        title: '手术室',
        dataIndex: 'deviceName',
        align: 'center',
        customCell: (record: unknown, rowIndex: number): {rowSpan: number;} => {
          const mergeList = getRowspan(state.dataSource as unknown as Record<string, string>[], 'deviceName')
          return {
            rowSpan: mergeList[rowIndex],
          }
        }
      },
      {
        title: '物品名称',
        dataIndex: 'name',
        align: 'center',
      },
      {
        title: '尺寸',
        dataIndex: 'size',
        align: 'center',
      },
      {
        title: '数量',
        dataIndex: 'number',
        align: 'center',
      },
      {
        title: '厂家',
        dataIndex: 'manufacturer',
        align: 'center',
      },
      {
        title: '型号',
        dataIndex: 'model',
        align: 'center',
      },
      {
        title: '机组编号',
        dataIndex: 'machinesCode',
        align: 'center',
        customCell: (record: unknown, rowIndex: number): {rowSpan: number;} => {
          const mergeList = getRowspan(state.dataSource as unknown as Record<string, string>[], 'machinesCode')
          return {
            rowSpan: mergeList[rowIndex],
          }
        },
        customRender: ({ text }: { text: string; }): string => {
          return text || '--'
        }
      },
      {
        title: '机组铭牌参数',
        dataIndex: 'arguments',
        align: 'center',
        customCell: (record: unknown, rowIndex: number): {rowSpan: number;}=> {
          const mergeList = getRowspan(state.dataSource as unknown as Record<string, string>[], 'arguments')
          return {
            rowSpan: mergeList[rowIndex],
          }
        },
        customRender: ({ text }: { text: string; }): string => {
          return text || '--'
        }
      },
      {
        title: '机组铭牌附件',
        dataIndex: 'fileIds',
        align: 'center',
        customCell: (record: unknown, rowIndex: number): {rowSpan: number;} => {
          const mergeList = getRowspan(state.dataSource as unknown as Record<string, string>[], 'fileIds')
          return {
            rowSpan: mergeList[rowIndex],
          }
        },
        customRender: ({ record }: { record: { fileList: OSSFile[]; }; }): JSX.Element | string => {
          if (record.fileList.length) {
            return (
              <Button
                type='link' onClick={() => {
                  state.imageVisible = true
                  state.previewImages = record.fileList
                }}
              >查看图片
              </Button>
            )
          }
          return '--'
        }
      },
    ]
    const commonStore = useCommonStore()
    const tenantName = computed(() => {
      return commonStore.tenantsOptions.find((item) => item.code === state.searchParams.tenant)?.name || ''
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const res = await cubeOperatingRoomService.getResourceItemDetailList({
          ...state.searchParams
        })

        state.dataSource = handleRecords(res.records)
        state.searchParams.total = res.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      } finally {
        state.loading = false
      }
    }
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleRecords = (records: ItemDetailsVo[]): ItemList[] => {
      let newRecords: ItemList[] = []
      records.forEach((item: ItemDetailsVo) => {
        newRecords = [...newRecords, ...item.itemList]
      })
      return newRecords
    }
    const handleChangeTenant = (): void => {
      getList()
    }
    onMounted(() => {
      state.terminal = authStore.terminal
      if (authStore.terminal === 'bimops-manage-web') {
        state.searchParams.tenant = authStore.tenant
      }
    })
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.deptId = ''
      getList()
    }
    const handleExport = async (): Promise<void> => {
      try {
        state.exportLoading = true
        const blob = await cubeOperatingRoomService.exportResourceItem({
          ...state.searchParams,
          tenantName: tenantName.value
        })
        downloadExcelFile(blob, '物品列表')
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage)
      } finally {
        state.exportLoading = false
      }
    }
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            {state.terminal === 'kh-admin-web' && <Button type='primary' disabled={!state.searchParams.tenant} loading={state.exportLoading} onClick={handleExport}>批量导出</Button>}
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.container}>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              {state.terminal === 'kh-admin-web' &&
                <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <TenantSelect onChange={handleChangeTenant} style={{ width: '180px' }} v-model:value={state.searchParams.tenant} />
                </FormItem>}

              <FormItem label='所属部门' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DeptSelect tenant={state.searchParams.tenant} v-model:value={state.searchParams.deptId} width='180px' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
            <Table loading={state.loading} size='small' scrollX='100%' columns={columns} pagination={false} dataSource={state.dataSource} />
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return <Page total={state.searchParams.total} onPageChange={handlePageChange} />
      }
    }
    return (): JSX.Element => (
      <Layout title='物品查询' v-slots={layoutSlots}>
        <PreviewImages v-model:visible={state.imageVisible} previewImages={state.previewImages} />
      </Layout>
    )
  }
})
