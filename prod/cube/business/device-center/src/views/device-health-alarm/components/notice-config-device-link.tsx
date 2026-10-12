import { cubeDeviceCenterService } from '@/api/service'
import type { ActionConfig, DeviceDetailType } from '@/types/alarm-type'
import { Form, FormItem, Select, type FormExpose, Button, InputNumber, type RuleObject, Row, Col } from '@ghcloud/cube-ui'
import { DeviceModalTable, VerticalLine } from '@ghcloud/generic-component'
import { defineComponent, reactive, ref } from 'vue'

/** 设备通知配置-设备联动 */
export const NoticeConfigDeviceLink = defineComponent({
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
      executeMode: [{ required: true, message: '请选择', trigger: 'blur' }],
      propValue: [{ required: true, message: '请输入具体数值', trigger: 'blur' }],
      id: [{ required: true, message: '请选择设备', trigger: 'blur' }],
      propCode: [{ required: true, message: '请选择设备属性', trigger: 'blur' }],
    }
    const delRow = (index: number): void => {
      dynamicValidateForm.actionConfig.splice(index, 1)
    }
    const addRow = async (): Promise<void> => {
      dynamicValidateForm.actionConfig.push({
        executeMode: 'MANUAL',
        propValue: undefined,
        deviceAttr: undefined,
        propCode: undefined,
        id: undefined,
        name: undefined,
        propCodeOptions: [],
        deviceList: []
      })
    }
    const validateForm = async (): Promise<unknown> => {
      try {
        // const data = formRef.value?.validate()
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

    const getPropData = (id: string): void => {
      cubeDeviceCenterService.getNorthDeviceDetail({ deviceId: id, withPropertySpec: true }).then((res: unknown) => {
        const deviceDetail = res as DeviceDetailType
        dynamicValidateForm.actionConfig[rowIndex.value].propCodeOptions = deviceDetail.productPropVoList
      })
    }

    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const rowIndex = ref(0)
    const handleDevice = (index: number): void => {
      rowIndex.value = index
      deviceModalTableRef.value?.openModal()
    }

    return (): JSX.Element =>
      <>
        <div style='margin-top:40px;display:flex;align-items:center'>
          <VerticalLine title='设备联动' style='margin-right:10px' />
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
                <Row gutter={16} key={i}>
                  <Col>
                    {/* @ts-ignore */}
                    <FormItem style='width:180px;margin-right:0' name={['actionConfig', i, 'executeMode']} rules={formRules.executeMode}>
                      <Select
                        v-model:value={e.executeMode}
                        options={[
                          { label: '手动执行', value: 'MANUAL' },
                          { label: '自动触发', value: 'AUTOMATIC' },
                        ]}
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                      />
                    </FormItem>
                  </Col>
                  <Col>
                    {/* @ts-ignore */}
                    <FormItem style='margin-right:0; display: flex;' name={['actionConfig', i, 'id']} rules={formRules.id}>
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
                  <Col>
                    {/* @ts-ignore */}
                    <FormItem style='width:180px;margin-right:0' name={['actionConfig', i, 'propCode']} rules={formRules.propCode}>
                      <Select
                        placeholder='选择产品属性列表'
                        options={e.propCodeOptions}
                        v-model:value={e.propCode}
                        field-names={{ label: 'propName', value: 'propCode' }}
                        allowClear
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                      />
                    </FormItem>
                  </Col>
                  <Col>
                    {/* @ts-ignore */}
                    <FormItem style='margin-right:0' name={['actionConfig', i, 'propValue']} rules={formRules.propValue}>
                      <div style='display:flex;align-items:center'>
                        <InputNumber placeholder='请输入属性设定具体数值' v-model:value={e.propValue} style='margin-right:5px' allowClear /> 秒
                      </div>
                    </FormItem>
                  </Col>
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
                getPropData(values[0].id)
              }}
            />
        }
      </>
  }
})
