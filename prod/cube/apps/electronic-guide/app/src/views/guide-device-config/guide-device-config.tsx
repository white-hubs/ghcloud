import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, PopConfirm, message, Image } from '@ghcloud/cube-ui'
import { getGuideDeviceList, updateGuideDevice, createGuideDevice, deleteGuideDevice } from '@/apis/guide-device'
import { EditModal } from './components/edit-modal'
import { useScrollHook } from '@/hooks/table-scroll-hook'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'
export interface FormState {
  id?: string;
  name: string;
  logo: string;
  zoom: string;
  title: '';
  coordinate: '';
}
export const GuideDeviceConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const { scrollY } = useScrollHook()
    const state = reactive<{
      loading: boolean;
      visible: boolean;
      dataSource: unknown[];
      modalState: string;
      rowState: FormState;
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;
        period: string;
      };
    }>({
      loading: false,
      modalState: 'create',
      visible: false,
      rowState: {
        name: '',
        logo: '',
        title: '',
        zoom: '',
        coordinate: ''
      },
      dataSource: [],
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        keyword: '',
        period: ''
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
        }
        const { data } = await getGuideDeviceList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center'
      },
      {
        title: '设备标题',
        dataIndex: 'title',
        key: 'title',
        align: 'center'
      },
      {
        title: '点位坐标',
        dataIndex: 'coordinate',
        key: 'coordinate',
        align: 'center'
      },
      {
        title: '设备logo',
        dataIndex: 'logo',
        key: 'logo',
        align: 'center',
        customRender: ({ record }: { record: FormState; }): JSX.Element | string => {
          return record.logo
            ? <Image src={record.logo} width={80} height={80} />

            : '--'
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        align: 'center',
        customRender: ({ record }: { record: FormState; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleEdit(record)
              }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => deleteLayer(record)}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>

            </>
          )
        }
      },
    ]
    const deleteLayer = async (row: FormState): Promise<void> => {
      await deleteGuideDevice(row.id as unknown as string)
      message.success('操作成功')
      getList()
    }
    const handleSaveType = async (row: FormState): Promise<void> => {
      if (state.modalState === 'create') {
        await createGuideDevice(row)
      } else {
        await updateGuideDevice(row.id as unknown as string, row)
      }
      message.success('操作成功')
      getList()
      state.visible = false
    }
    const handleEdit = (row: FormState): void => {
      state.modalState = 'edit'
      state.rowState = {
        ...row
      }
      state.visible = true
    }

    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getList()
    })
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.keyword = ''
      getList()
    }
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button
            type='primary' onClick={() => {
              state.rowState = {
                name: '',
                zoom: '',
                logo: '',
                title: '',
                coordinate: ''
              }
              state.modalState = 'create'
              state.visible = true
            }}
          >新增
          </Button>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem>
              <Input placeholder='设备名称' v-model:value={state.searchParams.keyword} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': (): JSX.Element => {
        return <AliasTable applicationCode='ELECREONIC_GUIDE' tableCode='GUIDE_DEVICE' columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} scrollY={scrollY.value} />
      },
      'footer-page': (): JSX.Element => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title={pageTitle} v-slots={layoutSlots}>
          <EditModal formData={state.rowState} state={state.modalState} v-model:visible={state.visible} onSave={handleSaveType} />
        </GLayout>
      </>
  }
})
