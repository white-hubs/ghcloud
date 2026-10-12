import { defineComponent, reactive, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useRoute, useRouter } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { useTableScroll } from '@/hook/use-table-scroll'
import { ScanModal } from '@/components/scan-modal/index'
import { ctlPage, delController, emptyController, headDetailOfChannel } from '@/api/gateway'
import { AddControllerModal } from './add-form/add-controller'
import { TaskTypeEnum, type ControllerState, type GatewayUrlParams } from '@/typings/gateway'
import { controllerDetail, createController, updateController } from '@/api/add-form'
import { ExportModel } from './export-model'
import { ImportModel } from './import-model'
import { storeBatch } from '@/pinia-store/batch'
import { storeUser } from '@/pinia-store/user'

export const ChannelInfo = defineComponent({
  emits: ['deleterow', 'changeInfo', 'selectTree'],
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  setup: (props, { emit }) => {
    const route = useRoute()
    const router = useRouter()
    const { scorllY } = useTableScroll()
    /** 顶部详情表单实例 */
    const detailFormRef = ref<{ formRef: FormExpose; }>()
    const detailOptions: DynamicFormRenderOptionProps[] = [
      { title: '采集通道信息', key: 'chlName', width: 100, componentName: 'TextInput', readonly: true },
      { title: '通道ID', key: 'chlId', width: 25, componentName: 'TextInput', readonly: true },
      { title: '通道协议', key: 'commCode', width: 25, componentName: 'TextInput', readonly: true },
      { title: '通讯接口', key: 'interfaceCode', width: 25, componentName: 'TextInput', readonly: true },
      { title: '启用状态', key: 'enableText', width: 25, componentName: 'TextInput', readonly: true },
    ]
    watch(() => props.id, async (n) => {
      await nextTick()
      if (n === '') return
      const { data } = await headDetailOfChannel(n)
      detailFormData.value = data
      detailFormData.value.enableText = data.enable === 1 ? '启用' : data.enable === 0 ? '停用' : '未知'
      query(n)
    })
    const timer = ref<NodeJS.Timeout | null>(null)
    onMounted(() => {
      timer.value = setTimeout(async () => {
        const n = route.query.channelId as string || props.id
        const { data } = await headDetailOfChannel(n)
        detailFormData.value = data
        detailFormData.value.enableText = data.enable === 1 ? '启用' : data.enable === 0 ? '停用' : '未知'
        query(n)
      }, 500)
    })
    onUnmounted(() => {
      timer.value && clearTimeout(timer.value)
    })
    const detailFormData = ref<{
      ctlVarFindSupported?: number;
      chlName: string;
      commCode?: string;
      interfaceCode?: string;
      chlId?: string;
      enableText?: string;
    }>({
      chlName: '',
      ctlVarFindSupported: 0
    })
    const query = async (chlId: string): Promise<void> => {
      loading.value = true
      searchState.chlId = chlId || detailFormData.value.chlId || ''
      const { data } = await ctlPage(searchState)
      dataSource.value = data.rows
      searchState.total = data.pageTotal
      loading.value = false
    }
    /** 表格数据 */
    const searchState = reactive({
      chlId: '',
      keyword: '',
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const columns = [
      {
        title: '控制器名称',
        dataIndex: 'ctlName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '控制器标识',
        dataIndex: 'ctlCode',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '变量个数',
        dataIndex: 'varCount',
        ellipsis: true,
        width: '150px',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '180px',
        align: 'center',
        customRender: ({ record }: { record: { ctlId: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailRow(record)
              }}>详情</Button>
              <Button type='link' size='small' onClick={async () => editRow(record)}>编辑</Button>
              <PopConfirm title='是否删除当前选中？' onConfirm={async () => delRow(record)}>
                <Button type='link' danger size='small'>删除</Button>
              </PopConfirm>
              {
                storeUser().userInfo.admin &&
                <PopConfirm title='是否删除当前选中？' onConfirm={async () => emptyRow(record)}>
                  <Button type='link' danger size='small'>强力删除</Button>
                </PopConfirm>
              }
            </>
          )
        }
      }
    ]
    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const reset = (): void => {
      searchState.keyword = ''
      query(props.id)
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      searchState.pageNumber = pageNumber || 1
      searchState.pageSize = pageSize
      query(props.id)
    }
    const scanVisible = ref<boolean>(false)
    const scanDevice = (): void => {
      scanVisible.value = true
    }
    const delRow = async (record: { ctlId: string; }): Promise<void> => {
      await delController(record.ctlId)
      query(props.id)
      message.success('操作成功')
      emit('changeInfo', true)
    }
    const emptyRow = async (record: { ctlId: string; }): Promise<void> => {
      await emptyController(record.ctlId)
      query(props.id)
      message.success('操作成功')
      emit('changeInfo', true)
    }
    const modalVisible = ref(false)
    const submitLoading = ref(false)
    const modalTitle = ref('')
    const exportModelRef = ref<{ openTemplat: () => void; }>()
    const importModelRef = ref<{ importEvent: () => void; }>()
    const modalAction = ref<'add' | 'edit' | 'detail'>('add')
    const modalFormData = ref<ControllerState>({
      ctlName: '',
      appConfigSchema: '',
      linkConfigSchema: '',
      ctlCode: '',
      ctlId: '',
      ctlStatus: '',
      dynamicConfig: '',
      lastOnlineTime: '',
      chlId: '',
      appConfig: '',
      linkConfig: '',
      remark: '',
    })
    const add = (): void => {
      modalVisible.value = true
      modalTitle.value = '新增控制器'
      modalAction.value = 'add'
      modalFormData.value = {
        ctlName: '',
        appConfigSchema: '',
        linkConfigSchema: '',
        ctlCode: '',
        ctlId: '',
        ctlStatus: '',
        dynamicConfig: '',
        lastOnlineTime: '',
        appConfig: '',
        linkConfig: '',
        remark: '',
      }
      modalFormData.value.chlId = detailFormData.value.chlId || props.id
    }
    const editRow = async (record: { ctlId: string | number; }): Promise<void> => {
      try {
        const res = await controllerDetail({ controllerId: record.ctlId })
        if (res.data) {
          modalFormData.value = res.data
        } else {
          modalFormData.value = {
            ctlName: '',
            appConfigSchema: '',
            linkConfigSchema: '',
            ctlCode: '',
            ctlStatus: '',
            dynamicConfig: '',
            lastOnlineTime: '',
            appConfig: '',
            linkConfig: '',
            remark: '',
          }
        }
        modalFormData.value.chlId = detailFormData.value.chlId || props.id
        modalFormData.value.ctlId = record.ctlId
        modalTitle.value = '编辑控制器'
        modalAction.value = 'edit'
        modalVisible.value = true
      } catch {

      }
    }
    const detailRow = async (record: { ctlId: string | number; }): Promise<void> => {
      const { gwId, channelId } = route.query as unknown as GatewayUrlParams
      router.push({ path: '/gateway-detail', query: { gwId, channelId, controllerId: record.ctlId } })
      emit('selectTree', `${record.ctlId}`, 'controller')
    }
    const handleBack = (): void => {
      const { gwId } = route.query as unknown as GatewayUrlParams
      router.push({ path: '/gateway-detail', query: { gwId } })
      emit('selectTree', `${gwId}`, 'gateway')
    }
    const modalOnOk = async (): Promise<void> => {
      try {
        submitLoading.value = true
        const params = {
          ...modalFormData.value,
          chlId: detailFormData.value.chlId ?? '',
        }
        if (modalAction.value === 'edit') {
          await updateController({
            ctlId: modalFormData.value.ctlId ?? '',
            ...params
          })
        } else {
          await createController(params)
        }
        message.success('操作成功')
        modalVisible.value = false
        query(detailFormData.value.chlId || props.id)
        emit('changeInfo', true)
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    const downTemplat = (): void => {
      exportModelRef.value?.openTemplat()
    }
    const importEvent = (): void => {
      importModelRef.value?.importEvent()
    }
    // 批量配置变量
    const batchStore = storeBatch()
    const selectedRowData = ref<ControllerState[]>([])
    const rowSelection = ref({
      onChange: (selectedRowKeys: string [], selectedRows: ControllerState[]) => {
        selectedRowData.value = selectedRows
        batchStore.selectController = {
          ids: selectedRowKeys,
          list: selectedRows
        }
      },
    })
    const batchConfig = (): void => {
      if (selectedRowData.value.length === 0) {
        message.warning('请选择控制器')
      } else {
        router.push({ path: '/batch', query: route.query })
      }
    }
    const layoutSlots = {
      'layout-top': (): JSX.Element => {
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
      'layout-header': (): JSX.Element=> {
        return (
          <>
            <div>
              <Button class='mr-16px' type='primary' onClick={batchConfig}>批量配置变量标识</Button>
              <Button class='mr-16px' type='primary' onClick={downTemplat}>模板下载</Button>
              <Button class='mr-16px' type='primary' onClick={importEvent}>批量导入</Button>
              {detailFormData.value.ctlVarFindSupported
                ? <Button class='mr-16px' type='primary' onClick={scanDevice}>扫描控制器变量</Button>
                : <span />}

              <Button type='primary' onClick={add}>添加</Button>
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
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <Table scrollX={400} rowKey='ctlId' size='small' rowSelection={rowSelection.value} columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} scrollY={scorllY.value} />
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
      'footer-btn': (): JSX.Element => {
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
        <Layout title='控制器列表' v-slots={layoutSlots} />
        <ScanModal
          v-model:show={scanVisible.value}
          labelWidth='100'
          taskType={TaskTypeEnum.SCAN_CONTROLLER_VAR}
          onGetList={query}
          channelId={props.id}
          onRefresh={() => {
            emit('changeInfo', true)
          }}
        />
        <AddControllerModal
          v-model:show={modalVisible.value}
          title={modalTitle.value}
          action={modalAction.value}
          v-model:formData={modalFormData.value}
          submitLoading={submitLoading.value}
          onOk={modalOnOk}
        />
        <ExportModel ref={exportModelRef} id={props.id} />
        <ImportModel
          id={props.id} ref={importModelRef} onImportEnd={() => {
            query(props.id)
            emit('changeInfo', true)
          }}
        />
      </>
  }
})
