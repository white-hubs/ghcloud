import { type PropType, defineComponent, ref } from 'vue'
import { Form, type FormInstance, type FormProps } from 'ant-design-vue/es'
import type { NamePath, RuleType, StoreValue, ValidateOptions, ValidatorRule } from 'ant-design-vue/es/form/interface'
import type { VueNode } from 'ant-design-vue/es/_util/type'
export declare interface FormExpose {
  resetFields: (name?: NamePath) => void;
  clearValidate: (name?: NamePath) => void;
  validateFields: (nameList?: NamePath[] | string, options?: ValidateOptions) => Promise<Record<string, unknown>>;
  validate: (nameList?: NamePath[] | string, options?: ValidateOptions) => Promise<Record<string, unknown>>;
}
interface BaseRule {
  warningOnly?: boolean;
  /** validate the value from a list of possible values */
  enum?: StoreValue[];
  /** validate the exact length of a field */
  len?: number;
  /** validate the max length of a field */
  max?: number;
  /** validation error message */
  message?: string | VueNode;
  /** validate the min length of a field */
  min?: number;
  /** validate from a regular expression */
  pattern?: RegExp;
  /** indicates whether field is required */
  required?: boolean;
  /** transform a value before validation */
  transform?: (value: StoreValue) => StoreValue;
  /** built-in validation type, available options: https://github.com/yiminghe/async-validator#type */
  type?: RuleType;
  /** treat required fields that only contain whitespace as errors */
  whitespace?: boolean;
  /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
  validateTrigger?: string | string[];
  /** Check trigger timing */
  trigger?: 'blur' | 'change' | ('change' | 'blur')[];
}
declare type AggregationRule = BaseRule & Partial<ValidatorRule>
interface ArrayRule extends Omit<AggregationRule, 'type'> {
  type: 'array';
  defaultField?: RuleObject;
}
export declare type RuleObject = AggregationRule | ArrayRule

export default defineComponent({
  props: {
    layout: {
      type: String as PropType<'inline' | 'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    labelAlign: {
      type: String as PropType<'left' | 'right'>,
      default: 'right'
    },
    size: {
      type: String as PropType<'small' | 'middle' | 'large'>,
      default: 'middle'
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {}
      }
    },
    model: {
      type: Object,
      default: () => {
        return {}
      }
    },
    validateOnRuleChange: {
      type: Boolean,
      default: true
    },
    labelCol: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rules: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup (props: FormProps, { slots, expose }) {
    const formRef = ref<FormInstance>()

    const resetFields = (name?: NamePath): void => {
      formRef.value?.resetFields(name)
    }

    const clearValidate = (name?: NamePath | undefined): void => {
      formRef.value?.clearValidate(name)
    }

    const validateFields = (nameList?: string | NamePath[] | undefined, options?: ValidateOptions | undefined): void => {
      formRef.value?.validateFields(nameList, options)
    }

    const validate = async (nameList?: string | NamePath[] | undefined, options?: ValidateOptions | undefined): Promise<Record<string, unknown> | undefined> => {
      return formRef.value?.validate(nameList, options)
    }

    expose({
      resetFields,
      clearValidate,
      validateFields,
      validate
    })

    return (): JSX.Element=> {
      return <Form ref={formRef} {...props}>{slots.default?.()}</Form>
    }
  }
})
