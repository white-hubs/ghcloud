import { defineComponent, onMounted, ref, watch } from 'vue'
import { Form, FormItem, Input } from '@ghcloud/cube-ui'
import { cubeDeviceCenterService } from '@/api/service'
import type { CompareType, ProductProp } from '@ghcloud/cube-iot-center-service'

// 导入拆分的子组件
import { RuleValueInput } from './components/rule-value-input'
import { RuleRow } from './components/rule-row'
import { StatusConfigSection } from './components/status-config-section'
import { useRuleTranslation } from './hooks/use-rule-translation'
import { useFormValidation } from './hooks/use-form-validation'
import { useStatusConfigData } from './hooks/use-status-config-data'
import type { Rule, StatusConfig } from './types'

export const StatusConfigForm = defineComponent({
  name: 'StatusConfigForm',
  props: {
    info: {
      type: String,
      default: () => '',
    },
    value: {
      type: Array as () => StatusConfig[],
      default: () => [
        {
          status: 'on_line',
          conditions: {
            rules: [{
              property: undefined,
              operator: undefined,
              value: undefined,
              dataType: undefined,
              type: 'and'
            }]
          }
        },
        {
          status: 'off_line',
          conditions: {
            rules: [{
              property: undefined,
              operator: undefined,
              value: undefined,
              dataType: undefined,
              type: 'and'
            }]
          }
        }
      ]
    },
    productId: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value'],
  setup (props, { emit, expose }) {
    // 使用提取的钩子函数
    const { formState, initFormState } = useStatusConfigData(props.info)
    const { formRef, validate, getFieldStatus } = useFormValidation(formState)
    const { updateRuleTranslation } = useRuleTranslation()

    const MAX = 999999999999999
    const operatorOptions = ref<CompareType[]>([])
    const propertyOptions = ref<ProductProp[]>([])

    // 监听 info 变化，初始化表单状态
    watch(
      () => props.info,
      () => {
        initFormState(props.info)
      },
      { deep: true, immediate: true }
    )

    // 添加规则
    const addRule = (statusConfig: StatusConfig): void => {
      statusConfig.conditions.rules.push({
        property: undefined,
        operator: undefined,
        value: undefined,
        dataType: undefined,
        type: 'and',
        translation: ''
      })
    }

    // 删除规则
    const removeRule = (rules: Rule[], index: number): void => {
      rules.splice(index, 1)
      emit('update:value', formState.statusConfigs)
    }

    // 处理属性变更
    const handlePropertyChange = (rule: Rule): void=> {
      rule.value = undefined
      rule.translation = ''
      handleChange()
    }

    // 处理值变更
    const handleChange = async (): Promise<void> => {
      // 更新所有规则的翻译
      formState.statusConfigs.forEach(config => {
        config.conditions.rules.forEach(rule => {
          updateRuleTranslation(rule, propertyOptions.value, operatorOptions.value)
        })
      })

      emit('update:value', formState.statusConfigs)

      // 验证表单
      try {
        await formRef.value?.validate()
        formState.errors = {}
      } catch (error: any) {
        if (error.errorFields) {
          error.errorFields.forEach((field: any) => {
            formState.errors[field.name.join('.')] = field.errors[0]
          })
        }
      }
    }

    // 获取属性和操作符选项
    const getData = async (): Promise<void> => {
      try {
        const [prop, compare] = await Promise.all([
          cubeDeviceCenterService.getProductPropList({ prodId: props.productId }),
          cubeDeviceCenterService.getCompareType()
        ])
        propertyOptions.value = prop
        operatorOptions.value = compare
      } catch {}
    }

    // 获取选中的属性
    const getSelectedProperty = (propCode: string): ProductProp | undefined => {
      return propertyOptions.value.find(prop => prop.propCode === propCode)
    }

    onMounted(() => {
      getData()
    })

    expose({
      validate
    })

    // 渲染值输入组件
    const renderValueInput = (rule: Rule, configIndex: number, ruleIndex: number): JSX.Element | null=> {
      const fieldName = `statusConfigs.${configIndex}.conditions.rules.${ruleIndex}.value`

      if (!rule.property) {
        return (
          <FormItem
            name={fieldName}
            {...getFieldStatus(fieldName)}
          >
            <Input placeholder="请先选择属性" disabled style={{ width: '100%' }} />
          </FormItem>
        )
      }

      const propertyOption = getSelectedProperty(rule.property)
      if (!propertyOption) return null

      return (
        <FormItem
          name={fieldName}
          {...getFieldStatus(fieldName)}
        >
          <RuleValueInput
            rule={rule}
            propertyOption={propertyOption}
            onChange={handleChange}
            maxValue={MAX}
          />
        </FormItem>
      )
    }

    return (): JSX.Element => (
      <Form ref={formRef} model={formState} rules={{
        statusConfigs: [
          {
            type: 'array',
            required: true,
            trigger: ['blur', 'change'],
            validator: async (_rule: any, value: StatusConfig[]): Promise<void> => {
              if (!value || !value.length) {
                return Promise.reject('配置不能为空')
              }
              for (let i = 0; i < value.length; i++) {
                const config = value[i]
                if (!config.conditions?.rules?.length) continue

                for (const rule of config.conditions.rules) {
                  if (!rule.property) {
                    return Promise.reject(`${config.status === 'on_line' ? '在线' : '离线'}规则的属性不能为空`)
                  }
                  if (!rule.operator) {
                    return Promise.reject(`${config.status === 'on_line' ? '在线' : '离线'}规则的操作符不能为空`)
                  }
                  if (rule.value === undefined || (Array.isArray(rule.value) && rule.value.length === 0) || rule.value === '') {
                    return Promise.reject(`${config.status === 'on_line' ? '在线' : '离线'}规则的值不能为空`)
                  }
                }
              }
              return Promise.resolve()
            }
          }
        ]
      }}>
        {formState.statusConfigs.map((statusConfig, configIndex) => (
          <StatusConfigSection
            key={configIndex}
            statusConfig={statusConfig}
            onAddRule={() => addRule(statusConfig)}
          >
            {statusConfig.conditions.rules.map((rule, ruleIndex) => (
              <RuleRow
                key={`${configIndex}-${ruleIndex}`}
                rule={rule}
                configIndex={configIndex}
                ruleIndex={ruleIndex}
                propertyOptions={propertyOptions.value}
                operatorOptions={operatorOptions.value}
                getFieldStatus={getFieldStatus}
                onPropertyChange={() => handlePropertyChange(rule)}
                onChange={handleChange}
                onRemove={() => removeRule(statusConfig.conditions.rules, ruleIndex)}
                renderValueInput={() => renderValueInput(rule, configIndex, ruleIndex)}
              />
            ))}
          </StatusConfigSection>
        ))}
      </Form>
    )
  }
})