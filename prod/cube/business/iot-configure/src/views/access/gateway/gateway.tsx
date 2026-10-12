import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Switch, PopConfirm, Empty, DeleteOutlined, EditOutlined, message, SyncOutlined } from '@ghcloud/cube-ui'
import { useRouter } from 'vue-router'
import '@/styles/gateway.less'
import { getGetwayList, updateSwitchState, createGateway, updateGateway, deleteGateway, gatewayDetail, syncSchemaByGw } from '@/api/gateway'
import { GatewayModal } from './components/add-gateway'
import { type GatewayState, type GatewayListState, StatusOptions, LinkStatusOptions, LinkStatusE, StatusE } from '@/typings/gateway'

export const Gateway = defineComponent({
  setup: () => {
    const router = useRouter()
    const loading = ref(false)
    const dataSource = ref<GatewayListState[]>([])
    // 网关列表
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await getGetwayList()
        if (res.data) {
          dataSource.value = res.data

          dataSource.value.map(item => {
            item.switchStatus = [LinkStatusE.STARTING, LinkStatusE.RUNNING].includes(Number(item.linkStatus))
          })
        }
      } catch {

      } finally {
        loading.value = false
      }
    }
    // 状态开关
    const changeStatus = async (record: Record<string, string | number | boolean>): Promise<void> => {
      try {
        // TODO:  启动中 | 运行中 => 变成离线   0停止 | 停止中 | 异常 => 变成在线
        const changeState = [LinkStatusE.STARTING, LinkStatusE.RUNNING].includes(Number(record.linkStatus)) ? StatusE.OFFLINE : StatusE.ONLINE
        await updateSwitchState({ state: changeState, gwId: record.gwId as string | number })
        message.success('操作成功')
        getTableData()
      } catch {
        record.switchStatus = !record.switchStatus
      }
    }
    const delRow = async (record: GatewayListState): Promise<void> => {
      await deleteGateway(record.gwId)
      message.success('操作成功')
      getTableData()
    }
    const syncLoading = ref(false)
    const syncId = ref()
    const syncRow = async (record: GatewayListState): Promise<void> => {
      syncLoading.value = true
      syncId.value = record.gwId
      await syncSchemaByGw(record.gwId)
      message.success('操作成功')
      getTableData()
      setTimeout(() => {
        syncLoading.value = false
      }, 1000)
    }
    const modalVisible = ref(false)
    const submitLoading = ref(false)
    const modalTitle = ref('')
    const modalAction = ref<'add' | 'edit'>('add')
    const modalFormData = ref<GatewayState>({
      name: '',
      deviceNum: '',
      pluginCode: '',
      secret: '',
      remark: '',
    })
    const add = (): void => {
      modalVisible.value = true
      modalTitle.value = '新增网关'
      modalAction.value = 'add'
      modalFormData.value = {
        name: '',
        deviceNum: '',
        pluginCode: '',
        secret: '',
        remark: '',
        gwConfig: '',
        gwConfigSchema: '',
      }
    }
    const editRow = async (record: GatewayListState): Promise<void> => {
      try {
        const res = await gatewayDetail({ gwId: record.gwId })
        if (res.data) {
          modalFormData.value = res.data
        } else {
          modalFormData.value = {
            name: '',
            deviceNum: '',
            pluginCode: '',
            secret: '',
            remark: '',
            gwConfig: '',
            gwConfigSchema: '',
          }
        }
        modalFormData.value.id = record.gwId
        modalTitle.value = '编辑网关'
        modalAction.value = 'edit'
        modalVisible.value = true
      } catch {
      }
    }
    const modalOnOk = async (): Promise<void> => {
      try {
        submitLoading.value = true
        if (modalAction.value === 'edit') {
          await updateGateway({
            id: modalFormData.value.id || '',
            ...modalFormData.value
          })
        } else {
          await createGateway({
            ...modalFormData.value,
          })
        }
        message.success('操作成功')
        modalVisible.value = false
        getTableData()
      } catch {

      } finally {
        submitLoading.value = false
      }
    }
    const goDetail = (event: MouseEvent & { target: { className: string;tagName: string; }; }, record: GatewayListState): void => {
      if (!['BUTTON', 'svg', 'path'].includes(event.target?.tagName) && !['right', 'iot-configure-switch-handle'].includes(event.target?.className)) {
        router.push({ path: '/gateway-detail', query: { gwId: record.gwId } })
      }
    }
    let timer: string | number | NodeJS.Timeout | null | undefined = null
    onMounted(() => {
      getTableData()
      timer = setInterval(() => {
        getTableData()
      }, 5000)
    })
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
    const confirmSlots = {
      title: (): JSX.Element => {
        return <div>
          <div class='title'>确认同步？</div>
          <div>同步设备描述和特殊变量值(含三方设备ID、设备提示类型)</div>
        </div>
      }
    }
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={() => {
          add()
        }}>添加</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div class={[dataSource.value.length > 0 ? 'flex-row' : '']}>
              {
                dataSource.value.length
                  ? <div class='gateway'>
                    {dataSource.value.map((record) => {
                      return (
                        <div class='card' key={record.gwId}>
                          <div class='wrap' onClick={(event) => {
                            goDetail(event as MouseEvent & { target: { className: string;tagName: string; }; }, record)
                          }}>
                            <div class='top'>
                              <span class='title'>{record.gwName}</span>
                              <div class='btns'>
                                <PopConfirm v-slots={confirmSlots} onConfirm={async () => syncRow(record)}>
                                  <Button type='link' size='small'><SyncOutlined title='同步' class={syncLoading.value && syncId.value === record.gwId ? 'rote' : ''} /></Button>
                                </PopConfirm>
                                <Button type='link' size='small' onClick={async () => editRow(record)}><EditOutlined title='编辑' /></Button>
                                <PopConfirm title='确认删除该项？' onConfirm={async () => delRow(record)}>
                                  <Button
                                    danger disabled={[LinkStatusE.STARTING, LinkStatusE.RUNNING].includes(Number(record.linkStatus))}
                                    type='link' size='small'
                                  ><DeleteOutlined title='删除' />
                                  </Button>
                                </PopConfirm>
                              </div>
                            </div>
                            {/* <div class="bottom" onClick={withModifiers(() => goDetail(record), ['self'])}> */}
                            <div class='bottom'>
                              <div class='left'>
                                <div class='info'>
                                  <span class='label'>链接状态：</span>
                                  <span class={[LinkStatusOptions.find(e => e.value === record.linkStatus as LinkStatusE)?.color, 'text']}>
                                    {() => {
                                      return (
                                        LinkStatusOptions.find(e => e.value === record.linkStatus as LinkStatusE)?.label ?? '--'
                                      )
                                    }}
                                  </span>
                                </div>
                                <div class='info'>
                                  <span class='label'>工作状态：</span>
                                  <span class={[StatusOptions.find(e => e.value === record.status as StatusE)?.color, 'text']}>
                                    {() => {
                                      return (
                                        StatusOptions.find(e => e.value === record.status as StatusE)?.label ?? '--'
                                      )
                                    }}
                                  </span>
                                </div>
                                <div class='info'>
                                  <span class='label'>插件：</span>
                                  <span class='text'>{record.pluginCode ?? '--'}</span>
                                </div>
                              </div>
                              <div class='right' style='padding:15px'>
                                <Switch v-model:value={record.switchStatus} onChange={async () => changeStatus(record)} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  : <Empty class='pt20' description='暂无数据' />
              }
            </div>
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title='网关接入' v-slots={layoutSlots} showFooter={false} showSearch={false} />
        <GatewayModal
          v-model:show={modalVisible.value}
          title={modalTitle.value}
          action={modalAction.value}
          v-model:formData={modalFormData.value}
          submitLoading={submitLoading.value}
          onOk={modalOnOk}
        />
      </>
  }
})
