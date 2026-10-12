import { reactive } from 'vue'
import type { FormState } from '../types'

export function useStatusConfigData (initialInfo: string): {
  formState: FormState;
  initFormState: (info: string) => void;
} {
  const formState = reactive<FormState>({
    statusConfigs: [],
    errors: {}
  })

  const initFormState = (info: string): void => {
    try {
      formState.statusConfigs = JSON.parse(info || '[]')

      if (formState.statusConfigs.length === 0) {
        formState.statusConfigs = [
          {
            status: 'on_line',
            conditions: {
              rules: []
            }
          },
          {
            status: 'off_line',
            conditions: {
              rules: []
            }
          }
        ]
      }
    } catch {
      formState.statusConfigs = [
        {
          status: 'on_line',
          conditions: {
            rules: []
          }
        },
        {
          status: 'off_line',
          conditions: {
            rules: []
          }
        }
      ]
    }
  }

  // 初始化
  initFormState(initialInfo)

  return {
    formState,
    initFormState
  }
}