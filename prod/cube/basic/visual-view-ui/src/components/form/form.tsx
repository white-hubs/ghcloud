import { type PropType, defineComponent, ref } from 'vue'
import { NForm,type FormRules,type FormProps,FormInst } from 'naive-ui';
import {type FormValidationError,type FormItemRule, type LabelPlacement}from 'naive-ui/es/form/src/interface'
// import { Form, type FormInstance, type FormProps } from 'ant-design-vue/es'
// import 'ant-design-vue/es/form/style'
// import type { NamePath, RuleType, StoreValue, ValidateOptions, ValidatorRule } from 'ant-design-vue/es/form/interface'
// import type { VueNode } from 'ant-design-vue/es/_util/type'
// export declare interface FormExpose {
//   resetFields: (name?: NamePath) => void;
//   clearValidate: (name?: NamePath) => void;
//   validateFields: (nameList?: NamePath[] | string, options?: ValidateOptions) => Promise<Record<string, unknown>>;
//   validate: (nameList?: NamePath[] | string, options?: ValidateOptions) => Promise<Record<string, unknown>>;
// }
// interface BaseRule {
//   // warningOnly?: boolean;
//   /** validate the value from a list of possible values */
//   // enum?: StoreValue[];
//   /** validate the exact length of a field */
//   len?: number;
//   /** validate the max length of a field */
//   max?: number;
//   /** validation error message */
//   // message?: string | VueNode;
//   /** validate the min length of a field */
//   min?: number;
//   /** validate from a regular expression */
//   pattern?: RegExp;
//   /** indicates whether field is required */
//   required?: boolean;
//   /** transform a value before validation */
//   // transform?: (value: StoreValue) => StoreValue;
//   /** built-in validation type, available options: https://github.com/yiminghe/async-validator#type */
//   // type?: RuleType;
//   /** treat required fields that only contain whitespace as errors */
//   whitespace?: boolean;
//   /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
//   validateTrigger?: string | string[];
//   /** Check trigger timing */
//   trigger?: 'blur' | 'change' | ('change' | 'blur')[];
// }
// declare type AggregationRule = BaseRule & Partial<ValidatorRule>
// interface ArrayRule extends Omit<AggregationRule, 'type'> {
//   type: 'array';
//   defaultField?: RuleObject;
// }
// export declare type RuleObject = AggregationRule | ArrayRule

export default defineComponent({
  props: {
    inline: {
      type: Boolean,
      default: false
    },
    // labelPlacement:{
    //   type: String as PropType<LabelPlacement>,
    //   default: 'left'
    // },
    model: {
      type: Object,
      default: () => {}
    },
    rules: {
      type: Object as PropType<FormRules>,
      default: () => {}
    }
  },
  setup (props: FormProps, { slots, expose }) {
    const formRef = ref<FormInst>()

    // const resetFields = (name?: NamePath): void => {
    //   formRef.value?.resetFields(name)
    // }

    // const clearValidate = (name?: NamePath | undefined): void => {
    //   formRef.value?.clearValidate(name)
    // }

    // const validateFields = (nameList?: string | NamePath[] | undefined, options?: ValidateOptions | undefined): void => {
    //   formRef.value?.validateFields(nameList, options)
    // }

    const validate =  () => {
      return new Promise((resolve,reject)=>{
        formRef.value?.validate((errors) => {
          if (!errors) {
            resolve(null)
          } else {
            reject(errors)
          }
        })
      })
    }
    // const validate = async(validateCallback?: (errors?: Array<FormValidationError>) => void, shouldRuleBeApplied?: (FormItemRule => Boolean) => Promise<void>

    expose({
      // resetFields,
      // clearValidate,
      // validateFields,
      validate,
      // restoreValidation
    })
    return () => {
      return <NForm ref={formRef} {...props} rules={props.rules}>{slots.default?.()}</NForm>
    }
  }
})
