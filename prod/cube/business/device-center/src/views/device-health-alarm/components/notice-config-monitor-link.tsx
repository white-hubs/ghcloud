import type { ActionConfig } from '@/types/alarm-type'
import { Form, FormItem, Select, type FormExpose, Button, InputNumber, type RuleObject, Row, Col } from '@ghcloud/cube-ui'
import { DeviceModalTable, VerticalLine } from '@ghcloud/generic-component'
import { defineComponent, reactive, ref } from 'vue'

/** 设备通知配置-监控联动 */
export const NoticeConfigMonitorLink = defineComponent({
  props: {
    actionConfig: {
      type: Array<ActionConfig>,
      default: () => []
    },
  },
  setup (props, { expose, slots }) {
    const formRef = ref<FormExpose>()
    const dynamicValidateForm = reactive<{ actionConfig: ActionConfig[]; }>({
      actionConfig: props.actionConfig
    })
    const formRules: Record<string, RuleObject[]> = {
      linkageVideoStrategyType: [{ required: true, message: '请选择', trigger: 'change' }],
      id: [{ required: true, message: '请选择设备', trigger: 'change' }],
      time: [{ required: true, message: '请输入录像时间', trigger: 'change' }],
      intervalTime: [{ required: true, message: '请输入抓拍时间', trigger: 'change' }],
      durationTime: [{ required: true, message: '请输入抓拍张数', trigger: 'change' }],
    }
    const delRow = (index: number): void => {
      dynamicValidateForm.actionConfig.splice(index, 1)
    }
    const addRow = async (): Promise<void> => {
      dynamicValidateForm.actionConfig.push({
        linkageVideoStrategyType: 'REF_VIDEO',
        type: 'VIDEOTAPE',
        time: undefined,
        intervalTime: undefined,
        durationTime: undefined,
        deviceList: []
      })
    }
    const validateForm = async (): Promise<unknown> => {
      try {
        return dynamicValidateForm
      } catch {
      }
    }
    const resetForm = async (): Promise<void> => {
      try {
        formRef.value?.resetFields()
      } catch {
      }
    }
    expose({
      validateForm,
      resetForm,
      addRow
    })

    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const rowIndex = ref(0)
    const handleDevice = (index: number): void => {
      rowIndex.value = index
      deviceModalTableRef.value?.openModal()
    }

    return (): JSX.Element =>
      <>
        <div style='margin-top:20px;display:flex;align-items:center;'>
          <VerticalLine title='监控联动' style='margin-right:10px' />
          <Button size='small' type='primary' onClick={addRow}>添加</Button>
          {slots.switch?.()}
        </div>
        <Form
          ref={formRef} model={dynamicValidateForm} labelCol={{ style: { width: '80px' } }}
          style='margin-top: 20px;'
        >
          {
            dynamicValidateForm.actionConfig.map((e: Record<string, unknown>, i: number) => {
              return (
                <Row gutter={8} key={i}>
                  <Col>
                    {/* @ts-ignore */}
                    <FormItem style='width:180px;margin-right:0' name={['actionConfig', i, 'linkageVideoStrategyType']} rules={formRules.linkageVideoStrategyType}>
                      <Select
                        v-model:value={e.linkageVideoStrategyType}
                        options={[
                          { label: '关联监控', value: 'REF_VIDEO' },
                          { label: '指定设备', value: 'CUSTOM_VIDEO' },
                        ]}
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                      />
                    </FormItem>
                  </Col>
                  {
                    e.linkageVideoStrategyType === 'CUSTOM_VIDEO' &&
                  <Col span={6}>
                    {/* @ts-ignore */}
                    <FormItem style='margin-right:0; display:flex;' name={['actionConfig', i, 'id']} rules={formRules.id}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Select
                          style={{ minWidth: '160px' }}
                          open={false}
                          showArrow={false}
                          allowClear={false}
                          mode='multiple'
                          options={e.deviceList}
                          v-model:value={e.id}
                          placeholder='请选择设备'
                          getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                        />
                        <Button type='primary' onClick={() => {
                          handleDevice(i)
                        }}>选择设备</Button>
                      </div>
                    </FormItem>
                  </Col>
                  }
                  <Col>
                    {/* @ts-ignore */}
                    <FormItem style='width:180px;margin-right:0' name={['actionConfig', i, 'type']} rules={formRules.type}>
                      <Select
                        v-model:value={e.type}
                        options={[
                          { label: '监控录像', value: 'VIDEOTAPE' },
                          { label: '监控抓拍', value: 'PHOTOGRAPH' },
                        ]}
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                      />
                    </FormItem>
                  </Col>
                  {
                    e.type === 'VIDEOTAPE'
                      ? (
                        <Col>
                          {/* @ts-ignore */}
                          <FormItem style='width:180px;margin-right:0' name={['actionConfig', i, 'time']} rules={formRules.time}>
                            <div style='display:flex;align-items:center'>
                              <InputNumber v-model:value={e.time} placeholder='请输入录像时间' style='margin-right:5px' allowClear /> 秒
                            </div>
                          </FormItem>
                        </Col>
                      )
                      : (
                        <>
                          <Col>
                            {/* @ts-ignore */}
                            <FormItem style='width:180px;margin-right:0' name={['actionConfig', i, 'intervalTime']} rules={formRules.intervalTime}>
                              <div style='display:flex;align-items:center'>
                                每<InputNumber v-model:value={e.intervalTime} placeholder='请输入抓拍时间' style='margin:0 5px' min={0} allowClear />秒
                              </div>
                            </FormItem>
                          </Col>
                          <Col>
                            {/* @ts-ignore */}
                            <FormItem style='width:190px;margin-right:0' name={['actionConfig', i, 'durationTime']} rules={formRules.durationTime}>
                              <div style='display:flex;align-items:center;white-space:nowrap'>
                                抓拍<InputNumber v-model:value={e.durationTime} placeholder='请输入抓拍张数' style='margin:0 5px' min={1} allowClear />张
                              </div>
                            </FormItem>
                          </Col>
                        </>
                      )
                  }
                  <Col>
                    <Button type='link' danger onClick={() => {
                      delRow(i)
                    }}>删除</Button>
                  </Col>
                </Row>
              )
            })
          }
        </Form>
        {
          dynamicValidateForm.actionConfig.length > 0 &&
            <DeviceModalTable
              ref={deviceModalTableRef}
              multiple={false}
              v-model:value={dynamicValidateForm.actionConfig[rowIndex.value].deviceList}
              onOk={(values: { name: string; id: string; }[]) => {
                dynamicValidateForm.actionConfig[rowIndex.value].deviceList = values.map(e => {
                  return { label: e.name, value: e.id }
                })
                dynamicValidateForm.actionConfig[rowIndex.value].id = values[0].id
              }}
            />
        }
      </>
  }
})
