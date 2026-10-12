import { computed, defineComponent, ref, type PropType, watch } from 'vue'
import { Select, Input, InputNumber } from '@ghcloud/cube-ui'
import type { ProductProp } from '@ghcloud/cube-iot-center-service'
import styles from './default-value-input.module.less'

export const DefaultValueInput = defineComponent({
  name: 'DefaultValueInput',
  props: {
    value: {
      type: [String, Number, Array],
      default: undefined
    },
    propertyOption: {
      type: Object as PropType<ProductProp>,
      required: true
    },
    onChange: {
      type: Function as PropType<() => void>,
      default: () => {}
    },
    maxValue: {
      type: Number,
      default: 999999999999999
    },
    minValue: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'change'],
  setup (props, { emit }) {
    const unitName = computed(() => {
      return props.propertyOption.unitName?.replace('-', '') ?? ''
    })

    const options = computed(() => {
      return props.propertyOption.dataConstraint || []
    })
    const defaultValue = ref(props.value)
    watch(() => props, () => {
      defaultValue.value = props.value
    }, { deep: true, immediate: true })
    const handleChange = (): void => {
      emit('update:value', defaultValue.value)
      emit('change', defaultValue.value)
      props.onChange(defaultValue.value)
    }

    return (): JSX.Element => {

      switch (props.propertyOption.dataType ?? '') {
        case 'enum':
        case 'boolean': {
          return (
            <div class={styles.inputWrapper}>
              <Select
                v-model:value={defaultValue.value}
                options={options.value}
                placeholder="请选择默认值"
                onChange={handleChange}
                disabled={props.disabled}
                allowClear
              />
              <span class={styles.unit}>{unitName.value}</span>
            </div>
          )
        }
        case 'int':
        case 'long':
          return (
            <div class={styles.inputWrapper}>
              <InputNumber
                v-model:value={defaultValue.value}
                placeholder="请输入整数值"
                onChange={handleChange}
                min={props.minValue}
                max={props.maxValue}
                precision={0}
                disabled={props.disabled}
                allowClear
              />
              <span class={styles.unit}>{unitName.value}</span>
            </div>
          )
        case 'float':
        case 'double':
          return (
            <div class={styles.inputWrapper}>
              <InputNumber
                v-model:value={defaultValue.value}
                placeholder="请输入数值"
                onChange={handleChange}
                precision={props.propertyOption.precision ?? 2}
                min={props.minValue}
                max={props.maxValue}
                disabled={props.disabled}
                allowClear
              />
              <span class={styles.unit}>{unitName.value}</span>
            </div>
          )
        default:
          return (
            <div class={styles.inputWrapper}>
              <Input
                v-model:value={defaultValue.value}
                placeholder="请输入默认值"
                onChange={handleChange}
                maxLength={props.maxValue}
                showCount={false}
                disabled={props.disabled}
                allowClear
              />
              <span class={styles.unit}>{unitName.value}</span>
            </div>
          )
      }
    }
  }
})