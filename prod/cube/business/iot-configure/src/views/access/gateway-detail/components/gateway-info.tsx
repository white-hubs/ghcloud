import { defineComponent, reactive, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { useTableScroll } from '@/hook/use-table-scroll'
import { channelPage, deleteChannel, emptyChannel, headDetailOfGateway } from '@/api/gateway'
import { AddChannelModal } from './add-form/add-channel'
import { StatusOptions, type ChannelState, type GatewayUrlParams } from '@/typings/gateway'
import { channelDetail, createChannel, updateChannel } from '@/api/add-form'
import { storeUser } from '@/pinia-store/user'
import { UpdateReportModal } from './add-form/update-report'
import { getTenant } from '@/tools'
import { useRoute, useRouter } from 'vue-router'

export const GatewayInfo = defineComponent({
  emits: ['changeInfo', 'selectTree'],
  props: {
    id: {
      type: String,
      default: ''
    },

  },
  setup: (props, { emit }) => {
    const { scorllY } = useTableScroll()
    const route = useRoute()
    const router = useRouter()

    /** 顶部详情表单实例 */
    const detailFormRef = ref<{ formRef: FormExpose; }>()
    const detailOptions: DynamicFormRenderOptionProps[] = [
      { title: '网关名称', key: 'gwName', width: 100, componentName: 'TextInput', readonly: true },
      { title: '设备编码', key: 'gwDeviceNum', width: 25, componentName: 'TextInput', readonly: true },
      { title: '网关协议', key: 'pluginCode', width: 25, componentName: 'TextInput', readonly: true },
      { title: '运行状态', key: 'gwStatus', width: 25, componentName: 'TextInput', readonly: true },
      { title: '更新时间', key: 'lastOnlineTime', width: 25, componentName: 'TextInput', readonly: true },
    ]
    // const chlArr = ref([])
    const channelList = ref([])
    watch(() => props.id, async (n: string) => {
      await nextTick()
      if (n === '') return
      const { data } = await headDetailOfGateway(n)
      searchState.gwId = n
      query(n)
      data.gwStatus = StatusOptions.find(e => e.value === data.gwStatus)?.label ?? '--'
      detailFormData.value = data
    })
    const timer = ref<NodeJS.Timeout | null>(null)
    onMounted(() => {
      timer.value = setTimeout(async () => {
        const n = route.query.gwId as string
        const { data } = await headDetailOfGateway(n)
        searchState.gwId = n
        query(n)
        data.gwStatus = StatusOptions.find(e => e.value === data.gwStatus)?.label ?? '--'
        detailFormData.value = data
      }, 500)
    })
    onUnmounted(() => {
      timer.value && clearTimeout(timer.value)
    })
    const detailFormData = ref<{
      gwName: string;
      lastOnlineTime: string;
      gwStatus: string;
      gwId: string;
      pluginCode: string;
    }>({
      gwName: '',
      lastOnlineTime: '',
      gwStatus: '',
      gwId: '',
      pluginCode: '',
    })

    /** 表格数据 */
    const searchState = reactive({
      chlProtocolId: '',
      keyword: '',
      gwId: props.id,
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const columns = [
      {
        title: '通道名称',
        dataIndex: 'chlName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      // {
      //   title: '通讯协议',
      //   dataIndex: 'chlProtocolCode',
      //   ellipsis: true,
      //   align: 'center',
      //   customRender: ({ text }: { text: string; }): JSX.Element => {
      //     return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      //   }
      // },
      {
        title: '通讯接口',
        dataIndex: 'interfaceCode',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '180px',
        align: 'center',
        customRender: ({ record }: { record: { chlId: string ; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailRow(record)
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
              }}>编辑</Button>
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
    const query = async (id: string): Promise<void> => {
      try {
        loading.value = true
        searchState.gwId = id || detailFormData.value.gwId
        const { data: channelpage } = await channelPage(searchState)
        channelList.value = channelpage.rows
        searchState.total = channelpage.pageTotal
      } catch {
      } finally {
        loading.value = false
      }
    }
    const reset = (): void => {
      searchState.chlProtocolId = ''
      searchState.keyword = ''
      query(props.id)
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      searchState.pageNumber = pageNumber || 1
      searchState.pageSize = pageSize
      query(props.id)
    }
    const delRow = async (record: { chlId: string; }): Promise<void> => {
      await deleteChannel(record.chlId)
      query(props.id)
      message.success('操作成功')
      emit('changeInfo', true)
    }
    const emptyRow = async (record: { chlId: string; }): Promise<void> => {
      await emptyChannel(record.chlId)
      query(props.id)
      message.success('操作成功')
      emit('changeInfo', true)
    }

    const modalVisible = ref(false)
    const updateReportModalRef = ref<{ open: () => void; }>()
    const submitLoading = ref(false)
    const modalTitle = ref('')
    const modalAction = ref<'add' | 'edit' | 'detail'>('add')
    const modalFormData = ref<ChannelState>({
      channelName: '',
      chlProtocolCode: '',
      chlProtocolId: '',
      gwId: '',
      id: '',
      interfaceCode: '',
      interfaceId: '',
      appConfig: '',
      linkConfig: '',
      remark: '',

    })
    const add = (): void => {
      modalVisible.value = true
      modalTitle.value = '新增通道'
      modalAction.value = 'add'
      modalFormData.value = {
        channelName: '',
        chlProtocolCode: '',
        chlProtocolId: '',
        id: '',
        interfaceCode: '',
        interfaceId: '',
        appConfig: '',
        linkConfig: '',
        remark: '',
      }
      modalFormData.value.gwId = detailFormData.value.gwId
      modalFormData.value.pluginCode = detailFormData.value.pluginCode
    }
    const editRow = async (record: { chlId: string | number; }): Promise<void> => {
      try {
        const res = await channelDetail({ channelId: record.chlId })
        if (res.data) {
          modalFormData.value = res.data
        } else {
          modalFormData.value = {
            channelName: '',
            chlProtocolCode: '',
            chlProtocolId: '',
            interfaceCode: '',
            interfaceId: '',
            appConfig: '',
            linkConfig: '',
            remark: '',
          }
        }
        modalFormData.value.gwId = detailFormData.value.gwId
        modalFormData.value.pluginCode = detailFormData.value.pluginCode
        modalFormData.value.id = record.chlId
        modalTitle.value = '编辑通道'
        modalAction.value = 'edit'
        modalVisible.value = true
      } catch {

      }
    }
    const detailRow = async (record: { chlId: string | number; }): Promise<void> => {
      const { gwId } = route.query as unknown as GatewayUrlParams
      router.push({ path: '/gateway-detail', query: { gwId, channelId: record.chlId } })
      emit('selectTree', `${record.chlId}`, 'channel')
    }
    const modalOnOk = async (): Promise<void> => {
      try {
        submitLoading.value = true
        const params = {
          ...modalFormData.value,
          gwId: detailFormData.value.gwId,
        }
        delete params.chlProtocolId
        delete params.interfaceId
        if (modalAction.value === 'edit') {
          await updateChannel({
            channelId: modalFormData.value.id || '',
            ...params
          })
        } else {
          await createChannel(params)
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
    const handleUpdateReport = async (): Promise<void> => {
      updateReportModalRef.value?.open()
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
      'layout-header': (): JSX.Element => {
        return (
          <div>
            {
              getTenant() === '-1' && (
                <Button class='mr-16px' type='primary' onClick={handleUpdateReport}>批量更新上报策略</Button>
              )
            }
            <Button type='primary' onClick={add}>添加</Button>
          </div>
        )
      },
      'layout-search': (): JSX.Element => {
        return (
          <>
            <Form layout='inline'>
              <FormItem label='通道名称'>
                <Input v-model:value={searchState.keyword} placeholder='请输入通道名称' showCount={false} onSearch={async () => query(props.id)} onChange={async () => query(props.id)} />
              </FormItem>
              {/* <FormItem label='通讯协议'>
                <Select
                  options={chlArr} field-names={{ label: 'name', value: 'id' }} placeholder='请选择通讯协议' allowClear v-model:value={searchState.chlProtocolId}
                  onChange={async () => query(props.id)}
                  style={{ width: '180px' }}
                />
              </FormItem> */}
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
            <Table columns={columns} loading={loading.value} dataSource={channelList.value} pagination={false} size='small' scrollY={scorllY.value} />
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
              history.back()
            }}>返回</Button>

          </>
        )
      }
    }
    return (): JSX.Element=>
      <>
        <Layout title='通道列表' v-slots={layoutSlots} />
        <AddChannelModal
          v-model:show={modalVisible.value}
          title={modalTitle.value}
          action={modalAction.value}
          v-model:formData={modalFormData.value}
          submitLoading={submitLoading.value}
          onOk={modalOnOk}
        />
        <UpdateReportModal
          ref={updateReportModalRef}
          title='批量更新上报策略'
          action={modalAction.value}
          gatewayId={searchState.gwId}
        />
      </>
  }
})
