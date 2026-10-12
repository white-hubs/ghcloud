import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
import { PopConfirm, Button, Col, Form, FormItem, Input, message, Row, Table, Textarea, type FormInstance, PopOver } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import styles from '../broadcast-template/broadcast.module.less'
import { checkedDeviceColumns } from './config'
import { VerticalLine } from '../../components/vertical-line/vertical-line'
import { BroadcastModal } from './components/broadcast-modal'
import type { BroadcastTemplatePage, Device } from '@ghcloud/cube-broadcast-center-service'
import { BroadcastDeviceModal } from './components/broadcast-device-modal'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'
import { cubeBroadcastService } from '@/api/service'

/** 广播规则列表 */
export const BroadcastCenterRuleDetails = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const formRef = ref<FormInstance>()
    const type = route.query.type || 'add'
    const id = route.query.id || ''
    const rules = {
      name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    }
    const state = reactive({
      selectedTemplateModal: {
        visible: false,
        selectedIds: [] as string[],
      },
      formState: {
        name: '',
        remark: '',
      },
      selectedDeviceModal: {
        visible: false,
        selectedIds: [] as string[],
        search: [
          {
            label: '',
            value: 'keyword',
            placeholder: '请输入设备名称',
          },
        ],
      },
      selectedDeviceIds: [] as string[],
      deviceDataSource: [] as Device[],
      loading: false,
      templateDataSource: [] as {
        id: string;
        name: string;
        content: string;
      }[],
    })
    const deviceRowSelection = computed(() => ({
      selectedRowKeys: state.selectedDeviceIds,
      onChange: (selectedRowKeys: string[]): void => {
        state.selectedDeviceIds = selectedRowKeys
      },
    }))
    const operationDelete = (index: number): void => {
      state.templateDataSource.splice(index, 1)
      state.selectedTemplateModal.selectedIds.splice(index, 1)
    }
    const handleBack = (): void => {
      history.back()
    }
    const handleSave = async (): Promise<void> => {
      try {
        state.loading = true
        formRef.value && formRef.value?.validate()
        if (!state.templateDataSource.length) return message.warning('请选择模板')
        if (!state.deviceDataSource.length) return message.warning('请选择设备')

        const templates = state.templateDataSource.map((item) => ({
          templateId: item.id,
          templateName: item.name,
          templateContent: item.content,
        }))

        const devices = state.deviceDataSource.map((item) => ({
          ...item,
          deviceAreaId: item.areaId,
          deviceAreaName: item.areaName,
        }))
        const params = {
          ...state.formState,
          enabled: true,
          templates,
          devices,
        }
        if (type === 'add') {
          await cubeBroadcastService.addBroadcastRule(params)
        } else if (type === 'edit') {
          await cubeBroadcastService.updateBroadcastRule(id as string, params)
        }

        message.success('操作成功')
        handleBack()
      } catch {
      } finally {
        state.loading = false
      }
    }
    const getRuleInfo = async (): Promise<void> => {
      const data = await cubeBroadcastService.getBroadcastRuleInfo(id as string)
      state.formState.name = data.name
      state.formState.remark = data.remark || ''
      state.deviceDataSource = data.devices.map((item) => ({
        ...item,
        areaId: item.deviceAreaId || '',
        areaName: item.deviceAreaName || '',
      }))
      state.selectedDeviceModal.selectedIds = data.devices.map((item) => item.deviceId)
      state.templateDataSource = data.templates.map((item) => ({
        id: item.templateId,
        name: item.templateName,
        content: item.templateContent,
      }))
      state.selectedTemplateModal.selectedIds = data.templates.map((item) => item.templateId)
    }
    const operationDeleteDevice = (index: number): void => {
      state.deviceDataSource.splice(index, 1)
      state.selectedDeviceModal.selectedIds.splice(index, 1)
    }
    const batchDeleteDevice = (): void => {
      state.deviceDataSource = state.deviceDataSource.filter(
        (item) => !state.selectedDeviceIds.includes(item.deviceId)
      )
      state.selectedDeviceModal.selectedIds = state.selectedDeviceModal.selectedIds.filter(
        (item) => !state.selectedDeviceIds.includes(item)
      )
      state.selectedDeviceIds = []
    }
    const deviceCancel = (): void => {
      state.selectedDeviceModal.visible = false
    }
    const saveDevice = (selectedIds: string[], selectedRows: SecurityDeviceRecord[]): void => {
      state.selectedDeviceModal.selectedIds = selectedIds
      state.deviceDataSource = selectedRows
      state.selectedDeviceModal.visible = false
    }
    const cancel = (): void => {
      state.selectedTemplateModal.visible = false
    }
    const saveTemplate = (selectedIds: string[], selectedRows: BroadcastTemplatePage[]): void => {
      state.selectedTemplateModal.selectedIds = selectedIds
      state.templateDataSource = selectedRows
      state.selectedTemplateModal.visible = false
    }
    onMounted(() => {
      type !== 'add' && getRuleInfo()
    })
    const checkedTemColumns = [
      {
        title: '模板名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'content',
        key: 'content',
        title: '广播内容',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={
                text
                  ? text
                    .replaceAll('${name}', '{ 姓名 }')
                    .replaceAll('${address}', '{ 地址 }')
                    .replaceAll('${plateNo}', '{车牌号 }')
                    .replaceAll('${curTime}', '{当前时间}')
                    .replaceAll('${curDate}', '{当前日期}')
                    .replaceAll('${phone}', '{ 电话 }')
                    .replaceAll('${genericText}', '{ 通用文本 }')
                  : ''
              }
            >
              {text
                ? text
                  .replaceAll('${name}', '{ 姓名 }')
                  .replaceAll('${address}', '{ 地址 }')
                  .replaceAll('${plateNo}', '{车牌号 }')
                  .replaceAll('${curTime}', '{当前时间}')
                  .replaceAll('${curDate}', '{当前日期}')
                  .replaceAll('${phone}', '{ 电话 }')
                  .replaceAll('${genericText}', '{ 通用文本 }')
                : '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
        slots: {
          customRender: 'action',
        },
      },
    ]
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div class={styles.from}>
              <Form ref={formRef} model={state.formState} rules={rules}>
                <Row>
                  <Col span={12}>
                    <FormItem label='规则名称' name='name'>
                      <Input
                        maxlength={20}
                        disabled={type === 'info'}
                        showCount
                        allowClear
                        v-model={[state.formState.name, 'value']}
                        placeholder='请输入规则名称'
                      />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='说明' name='remark'>
                      <Textarea
                        maxlength={200}
                        disabled={type === 'info'}
                        allowClear
                        rows={2}
                        v-model={[state.formState.remark, 'value']}
                        showCount
                        placeholder='输入备注信息'
                      />
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
            <div class={styles['rule-config']}>
              <VerticalLine title='规则配置' />

              <div class={styles['broadcast-template']}>
                <div class={styles['top-operate']}>
                  <div class={styles.title}>广播模板</div>
                  <Button
                    type='primary'
                    disabled={type === 'info'}
                    onClick={() => (state.selectedTemplateModal.visible = true)}
                  >
                    添加
                  </Button>
                </div>
                <div class={styles['template-table']}>
                  <Table
                    columns={checkedTemColumns}
                    pagination={false}
                    dataSource={state.templateDataSource}
                    size='small'
                    v-slots={{
                      action: ({ index }: { index: number; }) => (
                        <PopConfirm
                          disabled={type === 'info'}
                          title='删除当前选中？'
                          onConfirm={() => {
                            operationDelete(index)
                          }}
                        >
                          <Button type='link' disabled={type === 'info'} danger>
                            删除
                          </Button>
                        </PopConfirm>
                      ),
                    }}
                  />
                </div>
              </div>
              <div class={styles['broadcast-template']}>
                <div class={styles['top-operate']}>
                  <div class={styles.title}>广播设备</div>
                  <Button
                    type='primary'
                    disabled={type === 'info'}
                    onClick={() => (state.selectedDeviceModal.visible = true)}
                  >
                    添加
                  </Button>
                  <Button danger disabled={type === 'info'} onClick={batchDeleteDevice}>
                    批量删除
                  </Button>
                </div>
                <div class={styles['template-table']}>
                  <Table
                    columns={checkedDeviceColumns}
                    rowKey='deviceId'
                    rowSelection={deviceRowSelection.value}
                    dataSource={state.deviceDataSource}
                    size='small'
                    v-slots={{
                      action: ({ index }: { index: number; }) => (
                        <PopConfirm
                          disabled={type === 'info'}
                          title='删除当前选中？'
                          onConfirm={() => {
                            operationDeleteDevice(index)
                          }}
                        >
                          <Button type='link' disabled={type === 'info'} danger>
                            删除
                          </Button>
                        </PopConfirm>
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={handleBack}>返回</Button>
            {type !== 'info' && (
              <Button style={{ marginLeft: '10px' }} type='primary' loading={state.loading} onClick={handleSave}>
                保存
              </Button>
            )}
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '基础信息'} v-slots={layoutSlots} />
        {
          state.selectedTemplateModal.visible &&
            <BroadcastModal
              visible={state.selectedTemplateModal.visible}
              selectedKeys={state.selectedTemplateModal.selectedIds}
              onCancel={cancel}
              onSave={saveTemplate}
            />
        }
        {
          state.selectedDeviceModal.visible &&
            <BroadcastDeviceModal
              visible={state.selectedDeviceModal.visible}
              selectedKeys={state.selectedDeviceModal.selectedIds}
              onCancel={deviceCancel}
              onSave={saveDevice}
            />
        }
      </>
  }
})
