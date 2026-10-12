import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Image, PopConfirm, message } from '@ghcloud/cube-ui'
import { deleteLayerImage, getLayerImageList, updateLayerImageState } from '@/apis/layer-manage'
import dayjs from 'dayjs'
import { useScrollHook } from '@/hooks/table-scroll-hook'
import type { FormData } from './edit'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'

enum StateType {
  IN_USE = '已使用',
  NOT_USED = '未使用'
}

type EnumStateType = keyof typeof StateType
export const LayerManage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const { scrollY } = useScrollHook()
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      modalState: string;
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
        const { data } = await getLayerImageList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
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
        title: '图层区域',
        dataIndex: 'area',
        key: 'area',
        align: 'center',
        customRender: ({ text }: { text: { name: string; }; }): string => {
          return text ? text.name : '--'
        }
      },
      {
        title: '附件',
        dataIndex: 'layerFile',
        key: 'layerFile',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
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
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '使用状态',
        dataIndex: 'state',
        key: 'state',
        align: 'center',
        customRender: ({ text }: { text: EnumStateType; }): string => {
          return text ? StateType[text] : ''
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        align: 'center',
        customRender: ({ record }: { record: FormData; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleEdit(record)
              }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              {record.state === 'NOT_USED' && <Button style={{ paddingRight: 0 }} type='link' onClick={() => {
                handleUse(record)
              }}>使用</Button>}
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
      history.pushState({}, '', `/portal/electronic-guide/layer-edit?id=${(row as { id: string; }).id}`)
    }

    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }

    // const scrollY = ref<number>(500)
    // const getScrollY = (): void => {
    //   const ele = document.querySelector('.layout-table')
    //   const height = ele?.clientHeight
    //   if (height) {
    //     scrollY.value = height - 40
    //   }
    // }
    onMounted(() => {
      getList()
      // getScrollY()
      // window.addEventListener('resize', getScrollY)
    })
    // onUnmounted(() => {
    //   window.removeEventListener('resize', getScrollY)
    // })
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button
            type='primary' onClick={() => {
              history.pushState({}, '', '/portal/electronic-guide/layer-edit')
            }}
          >新增
          </Button>
        )
      },
      'content-table': (): JSX.Element => {
        return <AliasTable applicationCode='ELECREONIC_GUIDE' tableCode='LAYER' columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} scrollY={scrollY.value} />
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
        <GLayout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
