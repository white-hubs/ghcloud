import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Row, Col, Button } from '@ghcloud/cube-ui'
import { basicInfoConfig } from './index-config'
import { AlarmRuleConfig } from './component/alarm-rule-config'
import styles from './index.module.less'
import { getAlarmLevels } from '@/api/alarm'
import type { AlarmRuleConfigState, AlarmActionConfigState } from './index.i'
import { AlarmNotifyConfig } from './component/alarm-notify-config'
export const AlarmRuleEdit = defineComponent({
  setup: () => {
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const state = reactive<{ basicForm: Record<string, unknown>; alarmRuleConfigStates: AlarmRuleConfigState;alarmNotifyConfigs: AlarmActionConfigState; }>({
      basicForm: {
        name: '',
        alarmLevelId: null,
        emergencyEventTypeCode: null,
        repeatTime: '',
        estimatedHandlerTime: '',
        estimatedHandlerUnit: 'MINUTE',
        remark: '',
        levelsOption: []

      },
      alarmRuleConfigStates: {
        rulePeriodTimed: false,
        emergencyRuleTimeCommands: [{
          startTime: '',
          endTime: ''
        }],
        emergencyRuleConditionCommands: [],
        emergencyRuleConditionDeviceCommands: []
      },
      alarmNotifyConfigs: {
        actionConfig: {
          dutyUser: false,
          targetModifyParams: []
        },
        actionType: '',
        enabled: false
      }
    })
    const validateHandlerTime = async (rule: unknown, value: string): Promise<void> => {
      if (!value) {
        return Promise.reject(new Error('请输入处理时限'))
      } else {
        if (!state.basicForm.estimatedHandlerUnit) {
          return Promise.reject(new Error('请选择处理时限单位'))
        }
        return Promise.resolve()
      }
    }
    const rules = {
      emergencyEventTypeCode: [{ required: true, message: '请选择事件分类' }],

      name: [{ required: true, message: '请输入预案名称' }],
      alarmLevelId: [{ required: true, message: '请选择报警级别' }],
      repeatTime: [{ required: true, message: '请输入去重周期' }],
      estimatedHandlerTime: [
        {
          required: true,
          validator: validateHandlerTime
        },
      ],
      estimatedHandlerUnit: [
        { required: true, message: '请选择处理时限单位' },
      ],
      applicationCode: [{ required: true, message: '请选择类型' }],
    }
    const getAlarmLevelsOptions = async (): Promise<void> => {
      const { data } = await getAlarmLevels()
      state.basicForm.levelsOption = data
    }
    onMounted(() => {
      getAlarmLevelsOptions()
    })
    const handleSave = async (): Promise<void> => {
      await formRef.value?.validate()
    }
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <>

            <div style={{ padding: '16px 0' }}>
              {/* 基本信息 */}
              <Form
                ref={formRef}
                rules={rules}
                model={state.basicForm}
              >
                <div class={styles['basic-info']}>
                  <div class={styles.title}>基本信息</div>
                  <Row gutter={[32, 16]}>
                    {basicInfoConfig.map(item => {
                      return (
                        <Col span={8} key={item.value}>
                          <FormItem label={`${item.label}`} name={item.value}>
                            {item.component(state.basicForm, item.value)}
                          </FormItem>
                        </Col>
                      )
                    })}
                  </Row>
                </div>
                <div class={styles['alarm-rules']}>
                  <div class={styles.title}>报警规则</div>
                  <AlarmRuleConfig v-model:value={state.alarmRuleConfigStates} />
                </div>
                <div class={styles['alarm-rules']}>
                  <div class={styles.title}>报警通知</div>
                  {/* <AlarmRuleConfig v-model:value={state.alarmRuleConfigStates} /> */}
                  <AlarmNotifyConfig />
                </div>
              </Form>
            </div>

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (<Button type='primary' onClick={handleSave}>保存</Button>)
      }
    }
    return (): JSX.Element => (
      <div class={styles['alarm-rule-edit']}>
        <GLayout title='报警规则' showSearch={false} v-slots={layoutSlots} />
      </div>
    )
  }
})
