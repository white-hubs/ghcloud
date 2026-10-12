import { defineComponent, reactive, onMounted } from 'vue'
import { AliasTable, Layout as GLayout } from '@ghcloud/generic-component'
import { Button, PopConfirm, message } from '@ghcloud/cube-ui'
import { EditModal } from './components/edit-modal'
import { cubeMaintainService } from '@/api/service'
import { usePageName } from '@ghcloud/cube-utils'
const businessType = 'HIDDENDANGER'
export interface FormState {
  id?: string;
  name: string;
}
export const ProblemDegree = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const state = reactive<{
      loading: boolean;
      visible: boolean;
      dataSource: FormState[];
      modalState: string;
      rowState: FormState;
      searchParams: {
        keyword: string;
      };
    }>({
      loading: false,
      modalState: 'create',
      visible: false,
      rowState: {
        name: '',
      },
      dataSource: [],
      searchParams: {
        keyword: '',
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeMaintainService.getProblemLevelList()
        state.dataSource = result
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }
    }
    const handleEdit = (row: FormState): void => {
      state.modalState = 'edit'
      state.rowState = {
        ...row
      }
      state.visible = true
    }
    const handleDelete = async (row: FormState): Promise<void> => {
      if (row.id) {
        await cubeMaintainService.deleteProblemLevel({
          id: row.id
        })
        message.success('操作成功')
        getList()
      } else {
        message.info('数据标识异常')
      }
    }
    const columns = [
      {
        title: '隐患程度',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        customRender: ({ record }: { record: FormState; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => { handleEdit(record) }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => handleDelete(record)}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>

            </>
          )
        }
      },
    ]

    const handleSaveModel = async (row: FormState): Promise<void> => {
      row.id
        ? await cubeMaintainService.updateProblemLevel({
          id: row.id,
          name: row.name
        })
        : await cubeMaintainService.createProblemLevel({
          name: row.name
        })
      message.success('操作成功')
      getList()
      state.visible = false
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
          <>
            <AliasTable
              columns={columns}
              loading={state.loading}
              tableCode='PROBLEM_DEGREE'
              scrollX={400}
              applicationCode={businessType}
              dataSource={state.dataSource}
              pagination={false}
            />
          </>

        )
      },
    }
    return (): JSX.Element =>
      <>
        <GLayout title={pageTitle} v-slots={layoutSlots}>
          <EditModal formData={state.rowState} state={state.modalState} v-model:visible={state.visible} onSave={handleSaveModel} />
        </GLayout>
      </>
  }
})
