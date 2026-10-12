import type { ActionConfig } from '@/types/alarm-type'
import { Form, FormItem, type FormExpose, Button, Select, type RuleObject, Col, Row } from '@ghcloud/cube-ui'
import { DeptTreeSelect, RolePickerInput, UserPickerInput, VerticalLine } from '@ghcloud/generic-component'
import { logger } from '@ghcloud/generic-component/src/logger'
import { defineComponent, reactive, ref } from 'vue'

/** 设备通知配置-报警通知 */
export const NoticeConfigAlarmNotice = defineComponent({
  props: {
    showTitle: {
      type: Boolean,
      default: () => true
    },
    actionConfig: {
      type: Array<ActionConfig>,
      default: () => []
    },
  },
  emits: ['change'],
  setup (props, { expose, emit, slots }) {
    const formRef = ref<FormExpose>()
    const dynamicValidateForm = reactive<{ actionConfig: ActionConfig[]; }>({
      actionConfig: props.actionConfig ?? []
    })
    const formRules: Record<string, RuleObject[]> = {
      messagetargetnotify: [{ required: true, message: '请选择通知人员', trigger: 'change' }],
      departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
      role: [{ required: true, message: '请选择角色', trigger: 'change' }],
      user: [{ required: true, message: '请输入用户', trigger: 'change' }],
    }
    const delRow = (index: number): void => {
      dynamicValidateForm.actionConfig.splice(index, 1)
    }
    const addRow = async (): Promise<void> => {
      dynamicValidateForm.actionConfig.push({
        messagetargetnotify: undefined,
        departmentId: undefined,
        role: undefined,
        user: undefined
      })
    }
    const validateForm = async (): Promise<unknown> => {
      try {
        const data = formRef.value?.validate()
        logger.info('validateForm', data)
        const targetConfigList: { messageTargetNotify: string | undefined; targetConfig: unknown[] | undefined; }[] = []
        if (dynamicValidateForm.actionConfig && Array.isArray(dynamicValidateForm.actionConfig)) {
          dynamicValidateForm.actionConfig.forEach((item) => {
            let targetConfig: { userId: string; userName: string; }[] | { roleId: string; roleName: string; }[] | { departmentId: unknown; departmentName: string; }[] = []
            if (item.messagetargetnotify === 'USER' && item?.user) {
              targetConfig = item.user.map(u => {
                return {
                  userId: u.id,
                  userName: u.name
                }
              })
            } else if (item.messagetargetnotify === 'ROLE' && item?.role) {
              targetConfig = item.role.map(u => {
                return {
                  roleId: u.id,
                  roleName: u.name
                }
              })
            } else if (item.messagetargetnotify === 'DEPARTMENT' && item?.departmentId && Array.isArray(item?.departmentId)) {
              targetConfig = item.departmentId.map((u: unknown) => {
                return {
                  departmentId: u,
                  departmentName: ''
                }
              })
            }
            targetConfigList.push({
              messageTargetNotify: item.messagetargetnotify,
              targetConfig
            })
          })
        }
        const result = {
          actionConfig: {
            dutyUser: false,
            targetModifyParams: targetConfigList,
            data: dynamicValidateForm.actionConfig
          }
        }

        emit('change', result)
        return result
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
    return (): JSX.Element=>
      <>
        {
          props.showTitle &&
          <div style='margin-top:40px;display:flex;align-items:center'>
            <VerticalLine title='报警通知' style='margin-right:10px' />
            <Button size='small' type='primary' onClick={addRow}>添加</Button>
            {slots.switch?.()}
          </div>
        }
        <Form
          ref={formRef} model={dynamicValidateForm} labelCol={{ style: { width: '80px' } }}
          style='margin-top: 20px;'
        >
          {
            dynamicValidateForm.actionConfig?.map((e: Record<string, unknown>, i: number) => {
              return (
                <Row gutter={16} key={i}>
                  <Col span={5}>
                    {/* @ts-ignore */}
                    <FormItem style='margin-right:0' label='通知人员' name={['actionConfig', i, 'messagetargetnotify']} rules={formRules.messagetargetnotify}>
                      <Select
                        v-model:value={e.messagetargetnotify}
                        options={[
                          { label: '选择部门', value: 'DEPARTMENT' },
                          { label: '选择角色', value: 'ROLE' },
                          { label: '选择用户', value: 'USER' },
                        ]}
                        allowClear
                        placeholder='请选择通知人员'
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                      />
                    </FormItem>
                  </Col>
                  {
                    e.messagetargetnotify === 'DEPARTMENT' && (
                      <Col>
                        {/* @ts-ignore */}
                        <FormItem style='width:400px;margin-right:0' name={['actionConfig', i, 'departmentId']} rules={formRules.departmentId}>
                          <DeptTreeSelect v-model:value={e.departmentId} placeholder='请选择部门' multiple />
                        </FormItem>
                      </Col>
                    )
                  }
                  {
                    e.messagetargetnotify === 'ROLE' && (
                      <Col>
                        {/* @ts-ignore */}
                        <FormItem style='width:400px;margin-right:0' name={['actionConfig', i, 'role']} rules={formRules.role}>
                          <RolePickerInput v-model:value={e.role} multiple />
                        </FormItem>
                      </Col>
                    )
                  }
                  {
                    e.messagetargetnotify === 'USER' && (
                      <Col>
                        {/* @ts-ignore */}
                        <FormItem style='width:400px;margin-right:0' name={['actionConfig', i, 'user']} rules={formRules.user}>
                          <UserPickerInput v-model:value={e.user} multiple />
                        </FormItem>
                      </Col>
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
      </>
  }
})
