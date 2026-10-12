import { defineComponent, reactive, onMounted } from 'vue'
import { AliasTable, VerticalLine } from '@ghcloud/generic-component'
import { Button, PopConfirm, message, EditOutlined, DeleteOutlined, AntModal } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import { EditClassifyModal } from './components/edit-classify-modal'
import { cubeMaintainService } from '@/api/service'
import type { HiddenDangerType } from '@ghcloud/cube-maintain-service'
import { usePageName } from '@ghcloud/cube-utils'
import styles from './index.module.less'
import { EditTypeModal } from './components/edit-type-modal'
const businessType = 'HIDDENDANGER'
export interface ClassifyFormState {
  id?: string;
  name: string;
}
interface StateVo {
  loading: boolean;
  classifyState: {
    dataSource: ClassifyFormState[];
    rowState: ClassifyFormState;
    visible: boolean;
    modalState: string;
  };
  typeState: {
    dataSource: HiddenDangerType[];
    rowState: HiddenDangerType ;
    visible: boolean;
    modalState: string;
  };
  hiddenDangerCategoryId: string;
}
export const ProblemType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const state = reactive<StateVo>({
      loading: false,
      classifyState: {
        dataSource: [],
        rowState: {
          name: ''
        },
        visible: false,
        modalState: ''
      },
      typeState: {
        dataSource: [],
        rowState: {
          name: '',
          hiddenDangerCategoryId: null,
          hiddenDangerCategoryName: '',
          id: ''
        },
        visible: false,
        modalState: ''
      },
      hiddenDangerCategoryId: ''
    })
    const getClassifyList = async (): Promise<void> => {
      const result = await cubeMaintainService.getDangerClassifyList()
      state.classifyState.dataSource = result
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeMaintainService.getDangerTypeList({
          hiddenDangerCategoryId: state.hiddenDangerCategoryId
        })
        state.typeState.dataSource = result
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }
    }
    const handleTypeEdit = (row: HiddenDangerType): void => {
      state.typeState.modalState = 'edit'
      state.typeState.rowState = {
        ...row
      }
      state.typeState.visible = true
    }
    const handleTypeDelete = async (row: HiddenDangerType): Promise<void> => {
      if (row.id) {
        await cubeMaintainService.deleteDangerType({
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
        customRender: ({ record }: { record: HiddenDangerType; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => { handleTypeEdit(record) }} style={{ paddingLeft: 0, paddingRight: 0 }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => handleTypeDelete(record)}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>

            </>
          )
        }
      },
    ]

    const handleSaveType = async (row: HiddenDangerType): Promise<void> => {
      row.id
        ? await cubeMaintainService.updateDangerType({
          id: row.id,
          name: row.name,
          hiddenDangerCategoryId: row.hiddenDangerCategoryId || '',
          hiddenDangerCategoryName: row.hiddenDangerCategoryName || ''
        })
        : await cubeMaintainService.createDangerType({
          name: row.name,
          hiddenDangerCategoryId: row.hiddenDangerCategoryId || '',
          hiddenDangerCategoryName: row.hiddenDangerCategoryName || ''
        })
      message.success('操作成功')
      state.hiddenDangerCategoryId = ''
      getList()
      state.typeState.visible = false
    }
    const handleDeleteClassify = async (row: ClassifyFormState): Promise<void> => {
      AntModal.confirm({
        title: '删除',
        content: '确认删除该分类吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          if (row.id) {
            await cubeMaintainService.deleteDangerClassify({
              id: row.id
            })
            message.success('操作成功')
            getClassifyList()
          } else {
            message.info('数据标识异常')
          }
        }
      })
    }
    const handleSaveClassify = async (row: ClassifyFormState): Promise<void> => {
      row.id
        ? await cubeMaintainService.updateDangerClassify({
          id: row.id,
          name: row.name
        })
        : await cubeMaintainService.createDangerClassify({
          name: row.name
        })
      message.success('操作成功')
      getClassifyList()
      state.classifyState.visible = false
    }

    const handleEditClassify = (row: ClassifyFormState): void => {
      state.classifyState.modalState = 'edit'
      state.classifyState.rowState = {
        ...row
      }
      state.classifyState.visible = true
    }
    const handleClickClassify = (row: ClassifyFormState): void => {
      state.hiddenDangerCategoryId = row.id as unknown as string
      getList()
    }
    onMounted(() => {
      getList()
      getClassifyList()
    })
    const layoutSlots = {
      'layout-sider': (): JSX.Element => {
        return (
          <div class={styles.left}>
            <div class={styles.top}>
              <VerticalLine title='隐患分类' />
              <Button
                size='small' type='primary' onClick={() => {
                  state.classifyState.rowState = {
                    name: '',
                  }
                  state.classifyState.modalState = 'create'
                  state.classifyState.visible = true
                }}
              >新增
              </Button>
            </div>
            <div class={styles.list}>
              {state.classifyState.dataSource.map(item => {
                return (
                  <div class={styles.item} onClick={() => { handleClickClassify(item) }} key={item.id as unknown as string}>
                    <div class={styles.itemName}>
                      {item.name}
                    </div>
                    <div class={styles.itemOperate}>
                      <EditOutlined onClick={() => { handleEditClassify(item) }} />
                      <DeleteOutlined
                        onClick={() => {
                          handleDeleteClassify(item)
                        }} style={{ color: 'red' }}
                      />
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        )
      },
      'layout-right': (): JSX.Element => {
        return (
          <>
            <div class={styles.buttonContainer}>
              <Button
                type='primary'
                onClick={() => {
                  state.typeState.modalState = 'create'
                  state.typeState.visible = true
                  state.typeState.rowState = {
                    id: '',
                    hiddenDangerCategoryName: '',
                    name: '',
                    hiddenDangerCategoryId: null
                  }
                }}
              >新增
              </Button>
            </div>

            <AliasTable
              columns={columns}
              loading={state.loading}
              tableCode='PROBLEM_DEGREE'
              scrollX={400}
              applicationCode={businessType}
              dataSource={state.typeState.dataSource}
              pagination={false}
            />
          </>

        )
      }
    }
    return (): JSX.Element =>
      <Layout title={pageTitle} v-slots={layoutSlots} showSider showFooter={false}>
        <EditClassifyModal formData={state.classifyState.rowState} state={state.classifyState.modalState} v-model:visible={state.classifyState.visible} onSave={handleSaveClassify} />
        <EditTypeModal classifyOptions={state.classifyState.dataSource} formData={state.typeState.rowState} state={state.typeState.modalState} v-model:visible={state.typeState.visible} onSave={handleSaveType} />
      </Layout>
  }
})
