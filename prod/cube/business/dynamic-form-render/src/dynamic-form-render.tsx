import { defineComponent, ref, type PropType, watch, computed, renderSlot } from 'vue'
import type { DynamicFormRenderOptionProps } from './dynamic-form-render-props'
import { Form, FormItem } from '@ghcloud/cube-ui'
import Col from './components/col'
import FormRenderItem from './components/form-render-item'
import './dynamic-form-render.less'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
interface Props {
  /** 表单项配置集合  */
  formOptions: DynamicFormRenderOptionProps[];
  /** 表单label宽度  */
  labelWidth?: string;
  /** 表单数据  */
  formData?: Record<string, unknown>;
  /** 表单自定义校验规则 */
  customValidatesRules?: Record<string, RuleObject | RuleObject[]>;
  /** 重复监听 formData 特性开关 */
  repeatWatch?: boolean;
}

export default defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '120px',
    },
    formOptions: {
      type: Array as PropType<DynamicFormRenderOptionProps[]>,
      default: () => [],
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    repeatWatch: {
      type: Boolean,
      default: true,
    },
    customValidatesRules: {
      type: Object as unknown as PropType<Record<string, RuleObject | RuleObject[]>>,
      default: () => {},
    }
  },
  emits: ['update:formData'],
  setup (props: Props, { emit, expose, slots }) {
    const formRef = ref<FormExpose>()
    const formData = ref(props.formData ?? {}) // 表单数据
    watch(() => formData.value, () => {
      emit('update:formData', formData.value)
    })

    watch(() => props.formData, () => {
      if (props.formData && props.repeatWatch) {
        formData.value = props.formData
      }
    })

    const rules = computed(() => {
      const rule: Record<string, RuleObject | RuleObject[]> = {}
      props.formOptions.forEach((item) => {
        const componentName = item.componentName ?? 'TextInput'
        const preText = ['SelectInput', 'DateTime', 'DateTimeRange', 'Cascader', 'TreeSelect'].includes(componentName) ? '请选择' : '请填写'

        if (item.required) {
          // 基本校验
          rule[item.key] = { required: true, message: `${preText}${item.title}`, trigger: 'blur' }
        }
      })
      return { ...rule, ...props.customValidatesRules }
    })
    const hasSlot = (name: string): boolean => !!slots[name]

    // 对外暴露组件实例
    expose({
      formRef
    })
    return () => (

      <Form ref={formRef} labelCol={{ style: { width: props.labelWidth } }} model={formData.value} rules={rules.value}>
        {
          props.formOptions.map(item => {
            const componentName = item.componentName ?? 'TextInput'

            if (!item.hidden) {
              return (
                <Col key={item.key.toString()} width={item.width ?? 100} className={`${item.customClass ?? ''}`}>
                  <FormItem label={item.title} name={item.key.toString()} class={{ 'hidden-label': item.hiddenLabel, 'remove-label': item.removeLabel }}>
                    {
                      hasSlot(componentName)
                        ? renderSlot(slots, componentName, item as unknown as Record<string, unknown>)
                        : <FormRenderItem
                            componentName={componentName}
                            componentProps={item.componentProps}
                            formData={formData.value}
                            dependentParams={item.dependentParams}
                            v-model:value={formData.value[item.key]}
                            customComponent={item.customComponent}
                            readonly={item.readonly ?? false}
                          />
                    }
                  </FormItem>
                </Col>
              )
            }
            return ''
          })
        }
      </Form>
    )
  }
})
