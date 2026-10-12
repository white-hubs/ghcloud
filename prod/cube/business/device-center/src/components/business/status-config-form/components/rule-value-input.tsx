import { defineComponent, type PropType } from 'vue'
import { Select, Input, InputNumber } from '@ghcloud/cube-ui'
import type { ProductProp } from '@ghcloud/cube-iot-center-service'
import type { Rule } from '../types'
import styles from '../status-config-form.module.less'

export const RuleValueInput = defineComponent({
  name: 'RuleValueInput',
  props: {
    rule: {
      type: Object as PropType<Rule>,
      required: true
    },
    propertyOption: {
      type: Object as PropType<ProductProp>,
      required: true
    },
    onChange: {
      type: Function as PropType<() => void>,
      required: true
    },
    maxValue: {
      type: Number,
      default: 999999999999999
    }
  },
  setup (props) {
    const getUnitName = (): string => {
      return props.propertyOption.unitName?.replace('-', '') ?? ''
    }

    const getOptions = (): string => {
      return JSON.parse(props.propertyOption.dataConfig || '[]')
    }

    return (): JSX.Element=> {
      props.rule.dataType = props.propertyOption.dataType
      const options = getOptions()
      const unitName = getUnitName()

      switch (props.propertyOption.dataType ?? '') {
        case 'enum':
        case 'boolean': {
          return (
            <div class={styles.inputWrapper}>
              <Select
                v-model:value={props.rule.value}
                options={options}
                placeholder="请选择值"
                onChange={props.onChange}
                mode={props.propertyOption.dataType === 'enum' ? 'multiple' : undefined}
                maxTagCount={props.propertyOption.dataType === 'enum' ? 2 : undefined}
                allowClear
              />
              <span class={styles.unit}>{unitName}</span>
            </div>
          )
        }
        case 'int':
        case 'long':
          return (
            <div class={styles.inputWrapper}>
              <InputNumber
                v-model:value={props.rule.value}
                placeholder="请输入整数值"
                onChange={props.onChange}
                // @ts-ignore
                min={options[0] ?? 0}
                // @ts-ignore
                max={options[1] ?? props.maxValue}
                allowClear
              />
              <span class={styles.unit}>{unitName}</span>
            </div>
          )
        case 'float':
        case 'double':
          return (
            <div class={styles.inputWrapper}>
              <InputNumber
                v-model:value={props.rule.value}
                placeholder="请输入数值"
                onChange={props.onChange}
                precision={props.propertyOption.precision ?? 0}
                // @ts-ignore
                min={options[0] ?? 0}
                // @ts-ignore
                max={options[1] ?? props.maxValue}
                allowClear
              />
              <span class={styles.unit}>{unitName}</span>
            </div>
          )
        default:
          return (
            <div class={styles.inputWrapper}>
              <Input
                v-model:value={props.rule.value}
                placeholder="请输入值"
                onChange={props.onChange}
                maxLength={props.maxValue}
                showCount={false}
                allowClear
              />
              <span class={styles.unit}>{unitName}</span>
            </div>
          )
      }
    }
  }
})