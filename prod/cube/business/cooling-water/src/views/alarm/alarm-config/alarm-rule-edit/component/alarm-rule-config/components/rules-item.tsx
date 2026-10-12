import { Select, InputNumber, Input, Button } from '@ghcloud/cube-ui'
import { defineComponent, reactive, type PropType, ref } from 'vue'
import { getDeviceModelList, deviceModelEventList, getModelAttributeList } from '@/api/alarm'
import styles from './rules-item.module.less'
import type { RuleConditionCommand, RuleConditionExpCommand } from '../../../index.i'
import { cloneDeep, without } from 'lodash'
export const RulesItem = defineComponent({
  props: {
    value: {
      type: Object as PropType<RuleConditionCommand>,
      default: () => {
        return {
          conditionType: '',
          deviceEventCode: '',
          deviceEventName: '',
          deviceEventType: '',
          deviceGenreId: null,
          deviceGenreName: '',
          deviceModelId: '',
          deviceModelName: '',
          emergencyRuleConditionExpCommands: [{
            propCode: null,
            propName: null,
            propUnit: null,
            op: null,
            oprand: null,
            delayTime: null,
          }]
        }
      },
    },
    ruleItemIndex: {
      type: Number,
      default: () => 0
    },
    deviceTypeOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['updateValue'],
  setup: (props, { emit }) => {
    const modelOptions = ref<{ name: string; id: string; }[]>([])
    const state = reactive({
      deviceTypeOptions: [],
      deviceModelOptions: [],
      deviceEventOptions: [],
      deviceAttrOption: [],
      conditionType: null,
    })
    const factorTypeOptions = [
      {
        value: 'DEVICE_EVENT_CONDITION',
        label: '设备事件',
      },
      {
        value: 'CUSTOM_RULE_CONDITION',
        label: '属性判断',
      },
    ]
    const compareOptions = [
      {
        value: 'EQ',
        label: '等于',
      },
      {
        value: 'NE',
        label: '不等于',
      },
      {
        value: 'IN',
        label: '包含',
      },
      {
        value: 'GT',
        label: '大于',
      },
      {
        value: 'GE',
        label: '大于等于',
      },
      {
        value: 'LT',
        label: '小于',
      },
      {
        value: 'LE',
        label: '小于等于',
      },
      {
        value: 'NOT_IN',
        label: '不包含',
      },
    ]
    // 处理设备类型改变
    const handleDeviceTypeChange = (val: string, option: { name: string; id: string; }): void => {
      getModelOptions(val)
      let propsConfig = cloneDeep(props.value)
      propsConfig = {
        ...props.value,
        deviceGenreId: val,
        deviceGenreName: option.name,
        deviceModelId: null,
        deviceModelName: null,
        conditionType: null,
        deviceEventCode: null,
        deviceEventType: null,
        deviceEventName: null,
        emergencyRuleConditionExpCommands: [
          {
            propCode: null,
            propName: null,
            propUnit: null,
            op: null,
            oprand: null,
            delayTime: null,
          }
        ]
      }
      emit('updateValue', { ...propsConfig }, props.ruleItemIndex)
    }
    // 处理设备型号改变
    const handleDeviceModelChange = (val: string, option: { name: string; id: string; }): void => {
      getModelEventOptions(val)
      getDeviceAttrOptions(val)
      let propsConfig = cloneDeep(props.value)
      propsConfig = {
        ...props.value,
        deviceModelId: val,
        deviceModelName: option.name,
        conditionType: null,
        deviceEventCode: null,
        deviceEventName: null,
        emergencyRuleConditionExpCommands: [
          {
            propCode: null,
            propName: null,
            propUnit: null,
            op: null,
            oprand: null,
            delayTime: null,
          }
        ]
      }
      emit('updateValue', { ...propsConfig }, props.ruleItemIndex)
    }
    const handleEventChange = (val: string, option: { name: string; code: string; eventType: string; }): void => {
      let propsConfig = cloneDeep(props.value)
      propsConfig = {
        ...props.value,
        deviceEventCode: val,
        deviceEventName: option.name,
        deviceEventType: option.eventType,
        emergencyRuleConditionExpCommands: [
          {
            propCode: null,
            propName: null,
            propUnit: null,
            op: null,
            oprand: null,
            delayTime: null,
          }
        ]
      }
      emit('updateValue', { ...propsConfig }, props.ruleItemIndex)
    }
    // 获取设备型号选项
    const getModelOptions = async (value: string): Promise<void> => {
      const { data } = await getDeviceModelList({ genreId: value })
      modelOptions.value = data
      state.deviceModelOptions = data
    }
    // 获取设备事件选项
    const getModelEventOptions = async (value: string): Promise<void> => {
      const { data } = await deviceModelEventList({ modelId: value })
      state.deviceEventOptions = data
    }
    // 获取设备属性选项
    const getDeviceAttrOptions = async (value: string): Promise<void> => {
      const { data } = await getModelAttributeList({ modelId: value })
      state.deviceAttrOption = data
    }
    const delayInputSlots = {
      addonAfter: (): string => {
        return '秒'
      }
    }
    // 属性判断删除
    const handleDelAttrDecide = (item: RuleConditionExpCommand): void => {
      const emergencyRuleConditionExpCommands = without(props.value.emergencyRuleConditionExpCommands, item)
      emit('updateValue', { ...props.value, emergencyRuleConditionExpCommands }, props.ruleItemIndex)
    }
    // 属性判断新增
    const handleAddAttrDecide = (): void => {
      const addAttrDecide = {
        propCode: null,
        propName: null,
        propUnit: null,
        op: null,
        oprand: null,
        delayTime: null,
      }
      const propsConfig = cloneDeep(props.value)
      propsConfig.emergencyRuleConditionExpCommands.push(addAttrDecide)
      emit('updateValue', { ...propsConfig }, props.ruleItemIndex)
    }
    const handleAttrChange = (value: string, option: { id: string;name: string; }, index: number): void => {
      const propsConfig = cloneDeep(props.value)
      propsConfig.emergencyRuleConditionExpCommands[index].propCode = value
      propsConfig.emergencyRuleConditionExpCommands[index].propName = option.name
      emit('updateValue', { ...propsConfig }, props.ruleItemIndex)
    }

    return (): JSX.Element => (
      <div class={styles['flex-align-center']} style={{ alignItems: 'flex-start' }}>
        <Select style={{ width: '160px' }} v-model:value={props.value.deviceGenreId} options={props.deviceTypeOptions} fieldNames={{ label: 'name', value: 'id' }} placeholder='请选择设备类型' onChange={handleDeviceTypeChange} />
        <Select style={{ width: '160px' }} v-model:value={props.value.deviceModelId} options={modelOptions.value} placeholder='请选择设备型号' fieldNames={{ label: 'name', value: 'id' }} onChange={handleDeviceModelChange} key={props.ruleItemIndex} />
        <Select style={{ width: '160px' }} v-model:value={props.value.conditionType} options={factorTypeOptions} placeholder='请选择条件类型' />
        {/* initConfig.emergencyRuleConditionExpCommands[0].startDelayTime */}
        {props.value.conditionType === 'DEVICE_EVENT_CONDITION' &&
          <>
            <div class={styles['flex-align-center']}>
              <Select style={{ width: '160px' }} v-model:value={props.value.deviceEventCode} options={state.deviceEventOptions} fieldNames={{ label: 'name', value: 'code' }} placeholder='请选择设备事件' onChange={handleEventChange} />
            </div>

            <>
              {props.value.emergencyRuleConditionExpCommands.map((item, index) => {
                return (
                  <div class={styles['flex-align-center']} style={{ 'flex-wrap': 'nowrap' }} key={index}>
                    <label>延时报警:</label>
                    <InputNumber v-model:value={item.startDelayTime} style={{ width: '160px' }} />
                    <span>-</span>
                    <InputNumber v-model:value={item.endDelayTime} style={{ width: '160px' }} />
                    <span style={{ flexShrink: 0 }}>分钟</span>
                  </div>
                )
              })}
            </>

          </>}
        {
          props.value.conditionType === 'CUSTOM_RULE_CONDITION' &&
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
            {props.value.emergencyRuleConditionExpCommands.map((item, index) => {
              return (
                <div key={new Date().getTime()}>
                  <div class={styles['flex-align-center']}>
                    <Select v-model:value={item.propCode} style={{ width: '160px' }} options={state.deviceAttrOption} fieldNames={{ label: 'name', value: 'id' }} placeholder='请选择设备属性' onChange={(val, option) => {
                      handleAttrChange(val, option, index)
                    }} />
                    <Select v-model:value={item.op} style={{ width: '160px' }} options={compareOptions} placeholder='比较操作' />
                    <Input v-model:value={item.oprand} placeholder='请输入属性值' style={{ width: '160px' }} showCount={false} />
                    <Input v-model:value={item.delayTime} placeholder='状态持续时延' v-slots={delayInputSlots} showCount={false} style={{ width: '200px' }} />
                    <>
                      {index === 0 && <Button type='link' onClick={handleAddAttrDecide}>新增</Button>}
                      {index !== 0 && <Button type='link' danger onClick={() => {
                        handleDelAttrDecide(item)
                      }}>删除</Button>}
                    </>
                  </div>
                </div>
              )
            })}

          </div>
        }
      </div>
    )
  }
})
