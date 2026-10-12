import { defineComponent, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Modal, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { useTableScroll } from '@/hook/use-table-scroll'
import { deleteVar, headDetailOfController, varPage } from '@/api/gateway'
import { AddVarModal } from './add-form/add-var'
import { TaskTypeEnum, type GatewayUrlParams, type VarState } from '@/typings/gateway'
import { varDetail, createVar, updateVar } from '@/api/add-form'
import { ScanModal } from '@/components/scan-modal'
import { exportExcel } from '@/utils/common'
import { FileUpload } from './file-upload/file-upload'
import type { ImportType } from '@/api/model/geteway'
import { useRoute, useRouter } from 'vue-router'

export const ControllerInfo = defineComponent({
  emits: ['changeInfo', 'selectTree'],
  props: {
    id: {
      type: String,
      default: ''
    }

  },
  setup: (props, { emit }) => {
    const route = useRoute()
    const router = useRouter()
    const importSuccessful = ref<boolean>(true)
    const { scorllY } = useTableScroll()
    const importFlag = ref<string>('3')
    const fileTypes = ref<string[]>(['.xls', '.xlsx'])
    const uploadRef = ref()
    const importVisible = ref<boolean>(false)
    watch(() => props.id, async (n: string) => {
      await nextTick()
      if (n === '') return
      const { data } = await headDetailOfController(n)
      detailFormData.value = data
      query(n)
    })

    const timer = ref<NodeJS.Timeout | null>(null)
    const timer2 = ref<NodeJS.Timeout | null>(null)
    onMounted(() => {
      timer.value = setTimeout(async () => {
        const n = route.query.controllerId as string || props.id
        const { data } = await headDetailOfController(n)
        detailFormData.value = data
        query(n)
        timer2.value = setInterval(() => {
          query(props.id)
        }, 5000)
      }, 500)
    })
    onUnmounted(() => {
      timer.value && clearTimeout(timer.value)
      timer2.value && clearInterval(timer2.value)
    })
    const importData = reactive({
      successCount: '',
      failedCount: ''
    })
    const tableInfo = reactive<{ variablesColumns: ColumnType[];variablesTableData: { details: string; }[]; }>({
      variablesColumns: [
        {
          title: '导入详情',
          dataIndex: 'details',
          align: 'center',
          width: 200,
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          align: 'center',
          width: 50,
          ellipsis: true,
          customRender: (): JSX.Element=> {
            return <PopOver content='失败'>失败</PopOver>
          }
        },
      ],
      variablesTableData: [],
    })
    const feilSuccess = (res: ImportType): void => {
      Object.assign(importData, res)
      tableInfo.variablesTableData = res.failedMsgList.map((item: string) => {
        return {
          details: item,
        }
      })
      importSuccessful.value = false
    }
    const query = async (id: string): Promise<void> => {
      loading.value = true
      searchState.ctlId = id || detailFormData.value.ctlId || ''
      const { data } = await varPage(searchState)
      dataSource.value = data.rows
      searchState.total = data.pageTotal
      loading.value = false
    }
    const reset = (): void => {
      searchState.keyword = ''
      query(props.id)
    }
    const importedVariables = (): void => {
      importVisible.value = true
      uploadRef.value.clearAll()
    }
    /** 顶部详情表单实例 */
    const detailFormRef = ref<{ formRef: FormExpose; }>()
    const detailOptions: DynamicFormRenderOptionProps[] = [
      { title: '控制器信息', key: 'ctlName', width: 100, componentName: 'TextInput', readonly: true },
      { title: '标识', key: 'ctlCode', width: 25, componentName: 'TextInput', readonly: true },
      { title: '更新时间', key: 'lastOnlineTime', width: 25, componentName: 'TextInput', readonly: true },
    ]
    const detailFormData = ref<{
      ctlName: string;
      ctlId?: string;
      ctlCode: string;
      gwId: string;
      varFindSupported: number;
    }>({
      ctlCode: '',
      ctlName: '',
      gwId: '',
      varFindSupported: 0
    })

    /** 表格数据 */
    const searchState = reactive({
      ctlId: '',
      keyword: '',
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const columns = [
      {
        title: '变量名称',
        dataIndex: 'varName',
        ellipsis: true,
        align: 'center',
        width: '240px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '变量标识',
        align: 'center',
        dataIndex: 'varCode',
        ellipsis: true,
        width: '240px',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const list = ['raw_device_id', 'device_type_tips', 'online_status']
          return (
            <PopOver content={text}>{
              text
                ? list.includes(text) ? <span style={{ color: '#1890ff' }}>{text}</span> : text
                : '--'
            }
            </PopOver>
          )
        }
      },
      {
        title: '变量值',
        dataIndex: 'val',
        ellipsis: true,
        align: 'center',
        width: '180px',
        customRender: ({ record }: { record: { val: string; rawVal: string; zoomExpr: string; }; }): JSX.Element => {
          return (
            <PopOver
              v-slots={{
                content: () => <div>
                  <p>变量值：{record.val ?? '--'}</p>
                  <p>原始值：{record.rawVal ?? '--'}</p>
                  <p>缩放表达式：{record.zoomExpr ?? '--'}</p>
                </div>
              }} placement='right'
            >{record.val ?? '--'}
            </PopOver>
          )
        }
      },
      {
        title: '更新时间',
        dataIndex: 'lastUpdateTime',
        ellipsis: true,
        align: 'center',
        width: '180px',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备组名称',
        align: 'center',
        dataIndex: 'groupName',
        ellipsis: true,
        width: '240px',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备组编码',
        dataIndex: 'groupNumber',
        ellipsis: true,
        align: 'center',
        width: '240px',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '属性标识',
        align: 'center',
        dataIndex: 'virtualCode',
        ellipsis: true,
        width: '240px',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '180px',
        align: 'center',
        customRender: ({ record }: { record: { varId: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailRow(record)
              }}>详情</Button>
              <Button type='link' size='small' onClick={async () => editRow(record)}>编辑</Button>
              <PopConfirm title='是否删除当前选中？' onConfirm={async () => delRow(record)}>
                <Button type='link' danger size='small'>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    const importModelTable = (): void => {
      importVisible.value = false
      importSuccessful.value = true
    }
    const imporCancel = (): void => {
      importVisible.value = false
      importSuccessful.value = true
    }
    const loading = ref(false)
    const scanVisible = ref<boolean>(false)
    const dataSource = ref<unknown[]>([])

    const pageChange = (pageNumber: number, pageSize: number): void => {
      searchState.pageNumber = pageNumber || 1
      searchState.pageSize = pageSize
      query(props.id)
    }

    const delRow = async (record: { varId: string; }): Promise<void> => {
      await deleteVar(record.varId)
      query(props.id)
      message.success('操作成功')
      emit('changeInfo', true)
    }

    const modalVisible = ref(false)
    const submitLoading = ref(false)
    const modalTitle = ref('')
    const modalAction = ref<'add' | 'edit' | 'detail'>('add')
    const modalFormData = ref<VarState>({
      varName: '',
      varCode: '',
      readType: '',
      gwId: '',
      enable: '',
      dataType: undefined,
      ctlId: '',
      appConfig: '',
      linkConfig: '',
      remark: '',
      precision: '',
      zoomExpression: '',
      reportStrategy: undefined,
      intervalReportMill: '',
      changeUpVal: '',
    })
    const add = (): void => {
      modalVisible.value = true
      modalTitle.value = '新增变量'
      modalAction.value = 'add'
      modalFormData.value = {
        varName: '',
        varCode: '',
        readType: '',
        gwId: '',
        enable: '',
        dataType: undefined,
        appConfig: '',
        linkConfig: '',
        remark: '',
        precision: '',
        zoomExpression: '',
        reportStrategy: undefined,
        intervalReportMill: '',
        changeUpVal: '',
      }
      modalFormData.value.ctlId = detailFormData.value.ctlId || props.id
    }
    const editRow = async (record: { varId: string | number; }): Promise<void> => {
      try {
        const res = await varDetail({ varId: record.varId })
        if (res.data) {
          const convertStyleConfig = typeof res.data?.convertStyleConfig === 'string' ? JSON.parse(res.data?.convertStyleConfig) : res.data?.convertStyleConfig
          const reportStrategyConfig = typeof res.data?.reportStrategyConfig === 'string' ? JSON.parse(res.data?.reportStrategyConfig) : res.data?.reportStrategyConfig
          modalFormData.value = {
            ...res.data,
            ...convertStyleConfig,
            ...reportStrategyConfig,
          }
        } else {
          modalFormData.value = {
            varName: '',
            varCode: '',
            readType: '',
            enable: '',
            dataType: '',
            appConfig: '',
            linkConfig: '',
            remark: '',
            precision: '',
            zoomExpression: '',
            reportStrategy: '',
            intervalReportMill: '',
            changeUpVal: '',
          }
        }
        modalFormData.value.ctlId = detailFormData.value.ctlId || props.id
        // modalFormData.value.gwId = detailFormData.value.ctlId as string || props.id
        modalFormData.value.varId = record.varId
        modalTitle.value = '编辑变量'
        modalAction.value = 'edit'
        modalVisible.value = true
      } catch {

      }
    }
    const detailRow = async (record: { varId: string | number; }): Promise<void> => {
      try {
        const res = await varDetail({ varId: record.varId })
        if (res.data) {
          const convertStyleConfig = typeof res.data?.convertStyleConfig === 'string' ? JSON.parse(res.data?.convertStyleConfig) : res.data?.convertStyleConfig
          const reportStrategyConfig = typeof res.data?.reportStrategyConfig === 'string' ? JSON.parse(res.data?.reportStrategyConfig) : res.data?.reportStrategyConfig
          modalFormData.value = {
            ...res.data,
            ...convertStyleConfig,
            ...reportStrategyConfig,
          }
        } else {
          modalFormData.value = record
        }
        modalFormData.value.ctlId = detailFormData.value.ctlId || props.id
        // modalFormData.value.gwId = detailFormData.value.ctlId as string || props.id
        modalFormData.value.varId = record.varId
        modalTitle.value = '变量详情'
        modalAction.value = 'detail'
        modalVisible.value = true
      } catch {
      }
    }
    const modalOnOk = async (): Promise<void> => {
      try {
        submitLoading.value = true
        // ctlId = detailFormData.value.ctlId || props.id
        const params = {
          ...modalFormData.value,
          convertStyleConfig: {
            precision: modalFormData.value?.precision ?? '',
            zoomExpression: modalFormData.value?.zoomExpression ?? '',
          },
          reportStrategyConfig: {
            reportStrategy: modalFormData.value?.reportStrategy ?? '',
            intervalReportMill: modalFormData.value?.intervalReportMill ?? '',
            changeUpVal: modalFormData.value?.changeUpVal ?? '',
          },
          ctlId: detailFormData.value.ctlId ?? props.id
        }
        if (modalAction.value === 'edit') {
          await updateVar({
            varId: modalFormData.value.varId || '',
            ...params
          })
        } else {
          await createVar(params)
        }
        message.success('操作成功')
        modalVisible.value = false
        query(props.id)
        emit('changeInfo', true)
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    const exportLoading = ref(false)
    const templateDownload = (): void => {
      exportLoading.value = true
      exportExcel('/excel/exportVarTemplate', { channelId: props.id }, '变量模板').then(() => {
        exportLoading.value = false
      })
    }
    const scanDevice = (): void => {
      scanVisible.value = true
    }
    const handleBack = (): void => {
      const { gwId, channelId, from } = route.query as unknown as GatewayUrlParams & { from: string; }
      if (from) {
        history.back()
      } else {
        router.push({ path: '/gateway-detail', query: { gwId, channelId } })
        emit('selectTree', `${channelId}`, 'channel')
      }
    }

    const layoutSlots = {
      'layout-top': (): JSX.Element=> {
        return (
          <>
            <DynamicFormRender
              class='detail-form'
              formOptions={detailOptions}
              labelWidth='90'
              v-model:formData={detailFormData.value}
              ref={detailFormRef}
            />
          </>
        )
      },
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button class='mr-16px' type='primary' loading={exportLoading.value} onClick={templateDownload}>导入模板下载</Button>
              <Button class='mr-16px' type='primary' onClick={importedVariables}>导入变量</Button>

              {detailFormData.value.varFindSupported
                ? <Button class='mr-16px' type='primary' onClick={scanDevice}>扫描变量</Button>
                : <span />}
              <Button type='primary' onClick={add}>新增变量</Button>
            </div>
          </>
        )
      },
      'layout-search': (): JSX.Element => {
        return (
          <>
            <Form layout='inline'>
              <FormItem label='名称'>
                <Input v-model:value={searchState.keyword} placeholder='请输入名称' showCount={false} onSearch={async () => query(props.id)} onChange={async () => query(props.id)} />
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={async () => query(props.id)}>查询</Button>
                <Button onClick={reset}>重置</Button>
              </FormItem>
            </Form>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollX={1000} scrollY={scorllY.value} />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Page
              v-model:current={searchState.pageNumber}
              v-model:pageSize={searchState.pageSize}
              v-model:total={searchState.total}
              onPageChange={pageChange}
            />
          </>
        )
      },
      'footer-btn': (): JSX.Element=> {
        return (
          <>
            <Button onClick={() => {
              handleBack()
            }}>返回</Button>
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title='变量列表' v-slots={layoutSlots} />
        <ScanModal
          onCancle={() => {
            scanVisible.value = false
          }}
          v-model:show={scanVisible.value}
          labelWidth='100'
          taskType={TaskTypeEnum.SCAN_VAR}
          onGetList={async () => query(props.id)}
          gwId={detailFormData.value.gwId}
          channelId={props.id}
          onRefresh={() => {
            emit('changeInfo', true)
          }}
        />
        <AddVarModal
          v-model:show={modalVisible.value}
          title={modalTitle.value}
          action={modalAction.value}
          v-model:formData={modalFormData.value}
          submitLoading={submitLoading.value}
          onOk={modalOnOk}
        />
        <Modal
          visible={importVisible.value}
          title='导入反馈'
          onOk={importModelTable}
          onCancel={imporCancel}
          maskClosable={false}
        >
          {
            importSuccessful.value
              ? <>
                <FileUpload ref={uploadRef} fileTypes={fileTypes.value} fileFlag={importFlag.value} channelId={props.id} multiple onSuccess={feilSuccess} />
              </>
              : <>
                <div class='importFeedback'>
                  <div class='importFeedback_title'>
                    <span>导入结果如下：</span>
                    <span>导入成功共计{importData.successCount}条，失败{importData.failedCount}条</span>
                  </div>
                  <Table
                    columns={tableInfo.variablesColumns} dataSource={tableInfo.variablesTableData} pagination={false} size='small' scrollY={500}
                  />
                </div>
              </>
          }
        </Modal>
      </>
  }
})
