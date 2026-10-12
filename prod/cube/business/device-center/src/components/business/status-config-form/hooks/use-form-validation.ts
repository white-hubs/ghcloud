import { ref, type Ref } from 'vue'
import type { FormExpose } from '@ghcloud/cube-ui'
import type { FormState } from '../types'

export function useFormValidation (formState: FormState): {
  formRef: Ref<FormExpose | undefined>;
  validate: () => Promise<unknown>;
  getFieldStatus: (fieldName: string) => {
    validateStatus: string;
    help: string;
  };
} {
  const formRef = ref<FormExpose>()

  const validate = async (): Promise<unknown> => {
    try {
      // 清空之前的错误
      formState.errors = {}

      // 手动验证每个规则
      let hasError = false

      // 遍历所有配置
      for (let i = 0; i < formState.statusConfigs.length; i++) {
        const config = formState.statusConfigs[i]

        // 如果没有配置规则，直接跳过验证
        if (!config.conditions?.rules?.length) {
          continue
        }

        // 验证每条规则
        for (let j = 0; j < config.conditions.rules.length; j++) {
          const rule = config.conditions.rules[j]

          // 验证属性
          if (!rule.property) {
            formState.errors[`statusConfigs.${i}.conditions.rules.${j}.property`] = '属性不能为空'
            hasError = true
          }

          // 验证操作符
          if (!rule.operator) {
            formState.errors[`statusConfigs.${i}.conditions.rules.${j}.operator`] = '操作符不能为空'
            hasError = true
          }

          // 验证值
          if (rule.value === undefined || (Array.isArray(rule.value) && rule.value.length === 0) || rule.value === '') {
            formState.errors[`statusConfigs.${i}.conditions.rules.${j}.value`] = '值不能为空'
            hasError = true
          }
        }
      }

      // 如果有错误，拒绝 Promise
      if (hasError) {
        return Promise.reject(new Error('表单验证失败'))
      }

      // 验证通过后，确保返回正确的数据结构
      const validatedConfigs = formState.statusConfigs.map(config => {
        return {
          status: config.status,
          conditions: {
            rules: config.conditions.rules
          }
        }
      })

      return Promise.resolve(validatedConfigs)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取表单项的验证状态和提示信息
  const getFieldStatus = (fieldName: string): {
    validateStatus: string;
    help: string;
  } => {
    return {
      validateStatus: formState.errors[fieldName] ? 'error' : '',
      help: formState.errors[fieldName] || ''
    }
  }

  return {
    formRef,
    validate,
    getFieldStatus
  }
}