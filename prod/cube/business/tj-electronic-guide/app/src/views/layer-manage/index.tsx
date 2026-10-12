import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Image, PopConfirm, Table, message } from '@ghcloud/cube-ui'
import { deleteLayerImage, getLayerImageList, updateLayerImageState } from '@/apis/layer-manage'
import dayjs from 'dayjs'
import type { FormData } from './edit'
enum STATETYPE {
  IN_USE = '已使用',
  NOT_USED = '未使用'
}

type EnumStateType = keyof typeof STATETYPE
export const LayerManage = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      visible: boolean;
      dataSource: unknown[];
      modalState: string;
      rowState: FormData;
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
        layerFile: '',
        southwest: '',
        northeast: '',
        center: '',
        layerName: ''
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
        const  data  = await getLayerImageList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '图层名称',
        dataIndex: 'layerName',
        key: 'layerName',
        align: 'center'
      },
      {
        title: '附件',
        dataIndex: 'layerFile',
        key: 'layerFile',
        align: 'center',
        customRender: ({ text }: { text: string; }) => {
          return (
            <Image
              width={100}
              src={text}
            />
          )
        }
      },
      {
        title: '上传时间',
        dataIndex: 'createTime',
        key: 'createTime',
        align: 'center',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '使用状态',
        dataIndex: 'state',
        key: 'state',
        align: 'center',
        customRender: ({ text }: { text: EnumStateType; }) => {
          return text ? STATETYPE[text] : ''
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        align: 'center',
        customRender: ({ record }: { record: FormData; }) => {
          return (
            <>
              <Button type='link' onClick={() => { handleEdit(record) }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              {record.state === 'NOT_USED' && <Button style={{ paddingRight: 0 }} type='link' onClick={() => { handleUse(record) }}>使用</Button>}
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
    const deleteLayer = async (row: FormData): Promise<void> => {
      await deleteLayerImage(row.id as unknown as string)
      message.success('操作成功')
      getList()
    }
    const handleUse = async (row: unknown): Promise<void> => {
      await updateLayerImageState(row)
      message.success('操作成功')
      getList()
    }
    const handleEdit = (row: FormData): void => {
      history.pushState({}, '', `/portal/tj-electronic-guide/layer-edit?id=${(row as { id: string; }).id}`)
    }

    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getList()
    })
    const layoutSlots = {
      'header-btn': () => {
        return (
          <Button
            type='primary' onClick={() => {
              history.pushState({}, '', '/portal/tj-electronic-guide/layer-edit')
            }}
          >新增
          </Button>
        )
      },
      'content-table': () => {
        return <Table columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' scrollY={500} />
      },
      'footer-page': () => {
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
    return () =>
      <>
        <GLayout title='图层管理' v-slots={layoutSlots} />
      </>
  }
})
