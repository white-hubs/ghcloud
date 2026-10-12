import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { useApplicationInfo, usePageName, useTableDelete } from '@ghcloud/cube-utils'
import { Button, Form, FormItem, Input, Modal, Page, PopConfirm, PopOver, Textarea, message, type FormInstance } from '@ghcloud/cube-ui'
import { cubeDeviceCenter } from '@/api/service'
import styles from "./monitoring-group.module.less";
import type { Rule } from 'ant-design-vue/es/form'
import { useRoute } from 'vue-router'
import { DeviceModalTable } from '@ghcloud/generic-component'
import type { DeviceGroupPage } from '@ghcloud/cube-iot-center-service'
import { useRelateDevice } from '@/hook/use-relate-device'

/** 监控分组 */
export const MonitoringGroup = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const { getCurrentApplicationStore } = useApplicationInfo()

    const tagCode = 'builtin.app::' + getCurrentApplicationStore().code
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const { deviceList, deviceModalTableRef, openDeviceModal, handleRelateDevice } = useRelateDevice()
    const { getCurrentPage } = useTableDelete()

    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formSchema = ref([
      {
        component: 'Input',
        label: '名称',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '请输入分组名称'
        },
      },
    ]) 
    const panelRules = ref({
      name: [{ required: true, message: '请输入分组名称' }] as Rule[],
    })
    const panelRef = ref<FormInstance>()
    const visible = ref(false)
    const modalTitle = ref('新增分组')
    const formState = reactive({
      name: '',
      remark: ''
    })
    const currentId = ref('')
    const columns = [
      {
        title: '分组名称',
        dataIndex: 'name',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text}>{text || '--'}</PopOver>
        }
      },
      {
        title: '分组描述',
        dataIndex: 'remark',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        align: 'center',
        width: 220,
        customRender: ({ record }: { record: DeviceGroupPage; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                editRecord(record)
              }}>编辑</Button>
              <Button type='link' size='small' onClick={() => {
                goDetail(record)
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                associatedDevices(record)
              }}>关联设备</Button>
              <PopConfirm title='确认删除该项？' onConfirm={async () => deleteRecord(record)}>
                <Button type='link' danger size='small'>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]

    const addMonitoringGroup = (): void=>{
      Object.assign(formState, {
        name: '',
        remark: ''
      })
      modalTitle.value = '新增分组'
      visible.value = true
    }
    const deleteLoading = ref(false)
    const batchDelete = async (): Promise<void>=>{
      try {
        const selectedRowKeys = tableApi.getSelectedRowKeys()
        deleteLoading.value = true
        await cubeDeviceCenter.deleteDeviceGroupBatch(selectedRowKeys as string[])
        message.success('操作成功')
        tableApi.setSelectedRowKeys([])
        deleteLoading.value = false
        useRemoved(selectedRowKeys as string[])
      } catch {
      } finally {
        deleteLoading.value = false
      }
    }
    const editRecord = (record: DeviceGroupPage): void=>{
      modalTitle.value = '编辑分组'
      currentId.value = record.id
      formState.name = record.name
      formState.remark = record.remark
      visible.value = true
    }
    const goDetail = (record: DeviceGroupPage): void=>{
      history.pushState({ current: location.pathname + location.search }, '', `/portal/security-management/associated-devices?id=${record.id}&name=${record.name}`)
    }
    const useRemoved = (delList: unknown[]): void => {
      const dataSource = tableApi.getDataSource() ?? []
      pagination.value = getCurrentPage(pagination.value, delList, dataSource)
      tableApi.query()
    }
    const deleteRecord = async (record: DeviceGroupPage): Promise<void>=>{
      await cubeDeviceCenter.deleteDeviceGroup(record.id)
      useRemoved([record.id])
    }
    const curGroup = ref<DeviceGroupPage>()
    const associatedDevices = async (record: DeviceGroupPage): Promise<void>=>{
      curGroup.value = record
      openDeviceModal(record.id)
    }
    const handleOk = async (values: { deviceName: string; id: string; deviceId: string; }[]): Promise<void> => {
      try {
        await handleRelateDevice(values, curGroup.value?.id || '')
        message.success('操作成功')
        tableApi.query()
      } catch {

      }
    }
    const save = async (): Promise<void>=>{
      if (modalTitle.value === '新增分组') {
        const params = {
          code: 'builtin.app::' + getCurrentApplicationStore().code,
          name: getCurrentApplicationStore().name,
          deviceGroup: formState
        }
        await cubeDeviceCenter.addDeviceGroup(params)
      } else {
        await cubeDeviceCenter.updateDeviceGroup(currentId.value, formState)
      }
      tableApi.query()
      visible.value = false
    }
    const cancel = (): void=>{
      visible.value = false
    }
    const [CubeTable, tableApi] = useCubeTable({
      autoFetch: false,
      columns,
      tableCode,
      rowSelection: 'checkbox',
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
          keyword: formApi.formValues.keyword as string ?? '',
          tagCode
        }
        return cubeDeviceCenter.deviceGroupPage(params)
      },
      fetchLoaded: (data) => {
        pagination.value.total = data.total
      }
    })
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        pagination.value.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        tableApi.query()
      },
      schema: formSchema.value,
      showCollapseButton: true
    })
    onMounted(() => {
      tableApi.query()
    })
    const batchDisabled = computed(() => {
      return !tableApi.getSelectedRowKeys().length
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <>
          <div>
            <Button disabled={batchDisabled.value} type='primary' loading={deleteLoading.value} onClick={batchDelete}>批量删除</Button>
            <Button class={styles.ml10} type='primary' onClick={addMonitoringGroup}>新增</Button>
          </div>
        </>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <CubeForm />
            <CubeTable />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={pagination.value.pageNumber}
            pageSize={pagination.value.pageSize}
            total={pagination.value.total}
            onPageChange={(pageNumber: number, pageSize: number): void => {
              pagination.value.pageNumber = pageNumber
              pagination.value.pageSize = pageSize
              tableApi.query()
            }}
          />
        )
      },

    }
    return (): JSX.Element =>
      <>
        <CubeLayout title={pageTitle ?? "监控分组"} v-slots={layoutSlots} />
        <Modal title={modalTitle.value} v-model:visible={visible.value} width={600} onOk={save} onCancel={cancel}>
          <Form
            ref={panelRef} model={formState} rules={panelRules.value}
            layout='horizontal' labelCol={{ span: 4, offset: 0 }}>
            <FormItem label='分组名称' name='name' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Input style={{ width: '400px' }} placeholder='请输入分组名称' v-model:value={formState.name} />
            </FormItem>
            <FormItem label='描述' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
              <Textarea rows={4} style={{ width: '400px' }} v-model:value={formState.remark} />
            </FormItem>
          </Form>
        </Modal>
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple
          applicationCode={__ENV__.applicationCode}
          tagCodes={[tagCode]}
          onOk={handleOk}
        />
      </>
  }
})
