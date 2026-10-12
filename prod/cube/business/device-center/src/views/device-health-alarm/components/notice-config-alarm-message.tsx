import { cubeDeviceSuperviseService } from '@/api/service'
import type { ActionConfig } from '@/types/alarm-type'
import { Form, FormItem, type FormExpose, Button, Select, type RuleObject, Col, Row, InputNumber } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import { logger } from '@ghcloud/generic-component/src/logger'
import { defineComponent, onMounted, reactive, ref, type ComponentPublicInstance } from 'vue'
import { NoticeConfigAlarmNotice } from './notice-config-alarm-notice'

interface Props {
  actionConfig: ActionConfig[];
}

type RefItem = Element | ComponentPublicInstance | null
/** 设备通知配置-消息通知 */
export const NoticeConfigAlarmMessage = defineComponent({
  setup (props: Props, { expose, slots }) {
    const formRef = ref<FormExpose>()
    const dynamicValidateForm = reactive<{ actionConfig: ActionConfig[]; }>({
      actionConfig: props.actionConfig ?? []
    })
    const formRules: Record<string, RuleObject[]> = {
      channelTypes: [{ required: true, message: '请选择通知方式', trigger: 'change' }],
      notifyType: [{ required: true, message: '请选择通知时间点', trigger: 'change' }],
      duration: [{ required: true, message: '请输入延时时长', trigger: 'change' }],
    }
    const delRow = (index: number): void => {
      dynamicValidateForm.actionConfig.splice(index, 1)
    }
    const addRow = async (): Promise<void> => {
      dynamicValidateForm.actionConfig.push({
        channelTypes: undefined,
        notifyType: undefined,
        duration: undefined,
        targetModifyParams: []
      })

      if (dynamicValidateForm.actionConfig.length > 1) {
        const rowIndex = dynamicValidateForm.actionConfig.length - 1
        // @ts-ignore
        refMap[rowIndex].validateForm()
      }
    }
    const addNotice = async (index: number): Promise<void> => {
      // logger.debug(index, noticeConfigAlarmNoticeRef.value,'addNotice')
      // alarmNoticeRefs.value[index]?.addRow()
      for (const item in refMap) {
        if (item === index + '') {
          // @ts-ignore
          refMap[item].addRow()
        }
      }
    }
    const refMap: Record<number, RefItem> = {}
    const handleSetTempMap = (el: Element, index: number): unknown => {
      if (el) {
        refMap[index] = el
      }
      return refMap
    }

    const validateForm = async (): Promise<unknown> => {
      try {
        formRef.value?.validate()
        if (dynamicValidateForm.actionConfig && Array.isArray(dynamicValidateForm.actionConfig)) {
          // @ts-ignore
          dynamicValidateForm.actionConfig = dynamicValidateForm.actionConfig.map((d) => {
            if (d.targetModifyParams && Array.isArray(d.targetModifyParams)) {
              d.targetModifyParams.map(item => {
                if (item.messagetargetnotify === 'USER' && item?.user) {
                  item.targetConfig = item.user.map(u => {
                    return {
                      userId: u.id,
                      userName: u.name
                    }
                  })
                } else if (item.messagetargetnotify === 'ROLE' && item?.role) {
                  item.targetConfig = item.role.map(u => {
                    return {
                      roleId: u.id,
                      roleName: u.name
                    }
                  })
                } else if (item.messagetargetnotify === 'DEPARTMENT' && item?.departmentId && Array.isArray(item?.departmentId)) {
                  item.targetConfig = item.departmentId.map((u: unknown) => {
                    return {
                      departmentId: u,
                      departmentName: ''
                    }
                  })
                }
                return item
              })
              return d
            }
          })
        }

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
    const channelTypeOptions = ref()
    onMounted(() => {
      cubeDeviceSuperviseService.getMsgChannelConfigs({
        satMsgDefineCode: 'EMERGENCY_ALARM'
      }).then(res => {
        channelTypeOptions.value = res
      }).catch(err => {
        logger.error(err)
      })
    })

    expose({
      validateForm,
      resetForm,
      addRow
    })
    return (): JSX.Element=>
      <>
        <div style='margin-top:40px;display:flex;align-items:center'>
          <VerticalLine title='消息通知' style='margin-right:10px' />
          <Button size='small' type='primary' onClick={addRow}>添加</Button>
          {slots.switch?.()}
        </div>
        <Form
          ref={formRef} model={dynamicValidateForm} labelCol={{ style: { width: '120px' } }}
          style='margin-top: 20px;'
        >
          {
            dynamicValidateForm.actionConfig?.map((e: Record<string, unknown>, i: number) => {
              return (
                <div style='border: 1px dashed #d9d9d9; padding-top: 20px; margin-bottom:20px;' key={i}>
                  <Row gutter={16}>
                    <Col span={4}>
                      {/* @ts-ignore */}
                      <FormItem style='width:180px;margin-right:0' label='通知方式' name={['actionConfig', i, 'channelTypes']} rules={formRules.channelTypes}>
                        <Select
                          style={{ minWidth: '160px' }}
                          v-model:value={e.channelTypes}
                          mode='multiple'
                          options={channelTypeOptions.value}
                          fieldNames={{ label: 'channelTypeName', value: 'channelType' }}
                          allowClear
                          placeholder='请选择通知方式'
                          getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                        />
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      {/* @ts-ignore */}
                      <FormItem style='ssmargin-right:0' label='通知时间点' name={['actionConfig', i, 'notifyType']} rules={formRules.notifyType}>
                        <Select
                          style={{ minWidth: '160px' }}
                          v-model:value={e.notifyType}
                          options={[
                            { label: '及时通知', value: 'IMMEDIATELY_NOTIFY' },
                            { label: '延迟通知', value: 'DELAY_NOTIFY' },
                          ]}
                          allowClear
                          placeholder='请选择通知时间点'
                          getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                        />
                      </FormItem>
                    </Col>
                    {
                      e.notifyType === 'DELAY_NOTIFY' && (
                        <Col span={4}>
                          {/* @ts-ignore */}
                          <FormItem style='width:180px;margin-right:0;margin-left: 40px;' name={['actionConfig', i, 'duration']} rules={formRules.duration}>
                            <div style='display:flex;align-items:center'>
                              <InputNumber v-model:value={e.duration} placeholder='请输入延时时长' style='margin-right:5px' allowClear /> 秒
                            </div>
                          </FormItem>
                        </Col>
                      )
                    }
                    <Col span={4}>
                      <Button type='link' onClick={async () => addNotice(i)}>添加人员</Button>
                      <Button type='link' danger onClick={() => {
                        delRow(i)
                      }}>删除</Button>
                    </Col>
                  </Row>
                  <div style='margin-left: 40px; margin-top: -20px;'>
                    {/* <NoticeConfigAlarmNotice actionConfig={e.targetModifyParams} showTitle={false} ref={noticeConfigAlarmNoticeRef} /> */}
                    {/* @ts-ignore */}
                    <NoticeConfigAlarmNotice actionConfig={e.targetModifyParams} showTitle={false} ref={(el: Element) => handleSetTempMap(el, i)}
                    />
                  </div>
                </div>
              )
            })
          }
        </Form>
      </>
  }
})
