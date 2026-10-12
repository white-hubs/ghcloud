import { defineComponent, reactive, onMounted } from 'vue'
import { AliasTable, Layout as GLayout } from '@ghcloud/generic-component'
import { GPagination } from '@/components/common/pagination'
import { Button, PopConfirm, message } from '@ghcloud/cube-ui'
import { EditModal } from './components/edit-modal'
import { cubeSmallEngineeringService } from '@/api/server'
import { usePageName } from '@ghcloud/cube-utils'
export interface FormState {
  id?: string;
  name: string;
  code: '';
}
export const EngineeringType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
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
        code: ''
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
        const result = await cubeSmallEngineeringService.engineeringTypePageList(params)
        state.dataSource = result.records
        state.searchParams.total = result.total
      } finally {
        state.loading = false
      }
    }
    const deleteLayer = async (row: FormState): Promise<void> => {
      if (row.id) {
        await cubeSmallEngineeringService.engineeringTypeDelete({ id: row.id })
        message.success('操作成功')
        getList()
      } else {
        message.info('数据标识异常')
      }
    }
    const handleEdit = (row: FormState): void => {
      state.modalState = 'edit'
      state.rowState = {
        ...row
      }
      state.visible = true
    }
    const columns = [
      {
        title: '类型名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center'
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

    const handleSaveType = async (row: FormState): Promise<void> => {
      await cubeSmallEngineeringService.engineeringTypeEdit(row)
      message.success('操作成功')
      getList()
      state.visible = false
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
      'layout-header': (): JSX.Element => {
        return (
          <Button
            type='primary' onClick={() => {
              state.rowState = {
                name: '',
                code: '',
              }
              state.modalState = 'create'
              state.visible = true
            }}
          >新增
          </Button>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <AliasTable
            columns={columns}
            loading={state.loading}
            tableCode='TYPE'
            scrollX={400}
            applicationCode='SMALLENFINEERING'
            dataSource={state.dataSource}
            pagination={false}
          />
        )
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
