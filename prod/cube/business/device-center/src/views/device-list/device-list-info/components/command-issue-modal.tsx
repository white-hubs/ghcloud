import { cubeDeviceCenterService } from '@/api/service'
import { Form, FormItem, Input, InputNumber, Modal, Select, message, type FormExpose, type RuleObject } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'

interface InputParamDataConfigRange {
  type: 'range' | string
  min?: number
  max?: number
  step?: number
}

interface InputParamDataConfigEnum {
  type: 'enum' | string
  enumValues?: { value: string | number; label: string }[]
}

interface InputParamDataConfigLength {
  type: 'length' | 'strLen' | string
  len?: number
  strLen?: number
  max?: number
  length?: number
}

type InputParamDataConfig = InputParamDataConfigRange | InputParamDataConfigEnum | InputParamDataConfigLength | Record<string, unknown>

interface InputParamDef {
  name?: string
  param_code: string
  data_type?: string
  description?: string
  required?: boolean
  precision?: number
  unit_symbol?: string
  data_config?: InputParamDataConfig
}

interface ProductMethodForIssue {
  methodCode: string
  name?: string
  methodType?: string
  inputParams?: { params?: InputParamDef[] } | null
  prodId?: string
}

interface IssueFormState {
  [paramCode: string]: unknown
}

export const CommandIssueModal = defineComponent({
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
  setup (props, { expose }) {
    const modalVisible = ref(false)
    const submitLoading = ref(false)

    const formRef = ref<FormExpose>()
    const formState = reactive<IssueFormState>({})

    const currentMethod = ref<ProductMethodForIssue | null>(null)
    const inputParams = ref<InputParamDef[]>([])

    const renderSelectOptions = (enumValues: { value: string | number; label: string }[]): { label: string; value: string | number }[] => {
      return enumValues.map((e) => ({ label: e.label, value: e.value }))
    }

    const clearFormState = (): void => {
      Object.keys(formState).forEach((k) => {
        delete formState[k]
      })
    }

    const getConfigType = (cfg: InputParamDataConfig | undefined): string => {
      if (!cfg || typeof cfg !== 'object') {
        return ''
      }
      return String((cfg as Record<string, unknown>).type ?? '')
    }

    const getRangeConfig = (param: InputParamDef): { min?: number; max?: number; step?: number } => {
      const cfg = param.data_config as InputParamDataConfigRange | undefined
      const res: { min?: number; max?: number; step?: number } = {}
      if (typeof cfg?.min === 'number') res.min = cfg.min
      if (typeof cfg?.max === 'number') res.max = cfg.max
      if (typeof cfg?.step === 'number') res.step = cfg.step
      return res
    }

    const getEnumConfig = (param: InputParamDef): { enumValues: { value: string | number; label: string }[] } => {
      const cfg = param.data_config as InputParamDataConfigEnum | undefined
      return {
        enumValues: Array.isArray(cfg?.enumValues) ? cfg.enumValues : []
      }
    }

    const getLengthConfig = (param: InputParamDef): { len?: number } => {
      const cfg = param.data_config as InputParamDataConfigLength | undefined
      const len = cfg?.len ?? cfg?.strLen ?? cfg?.max ?? cfg?.length
      if (typeof len === 'number') {
        return { len }
      }
      return {}
    }

    const buildRules = (): Record<string, RuleObject[]> => {
      const rules: Record<string, RuleObject[]> = {}
      for (const p of inputParams.value) {
        const key = p.param_code
        const ruleList: RuleObject[] = []
        if (p.required) {
          ruleList.push({
            required: true,
            message: `请输入${p.name || key}`,
            trigger: 'blur'
          } as RuleObject)
        }
        const cfgType = getConfigType(p.data_config)

        if (cfgType === 'range') {
          const { min, max } = getRangeConfig(p)
          ruleList.push({
            validator: (_rule: unknown, value: unknown): Promise<void> => {
              if (value === undefined || value === null || value === '') {
                return Promise.resolve()
              }
              const num = typeof value === 'number' ? value : Number(value)
              if (!Number.isFinite(num)) {
                return Promise.reject(new Error('请输入数字'))
              }
              if (min !== undefined && num < min) {
                return Promise.reject(new Error(`值不能小于${min}`))
              }
              if (max !== undefined && num > max) {
                return Promise.reject(new Error(`值不能大于${max}`))
              }
              return Promise.resolve()
            },
            trigger: 'blur'
          } as RuleObject)
        } else if (cfgType === 'enum') {
          const { enumValues } = getEnumConfig(p)
          const allowed = new Set(enumValues.map((e) => String(e.value)))
          ruleList.push({
            validator: (_rule: unknown, value: unknown): Promise<void> => {
              if (value === undefined || value === null || value === '') {
                return Promise.resolve()
              }
              if (allowed.size > 0 && !allowed.has(String(value))) {
                return Promise.reject(new Error('请选择合法枚举值'))
              }
              return Promise.resolve()
            },
            trigger: 'change'
          } as RuleObject)
        } else if (cfgType === 'length' || cfgType === 'strLen') {
          const { len } = getLengthConfig(p)
          ruleList.push({
            validator: (_rule: unknown, value: unknown): Promise<void> => {
              if (value === undefined || value === null) {
                return Promise.resolve()
              }
              if (typeof len === 'number' && typeof value === 'string' && value.length > len) {
                return Promise.reject(new Error(`长度不能超过${len}`))
              }
              return Promise.resolve()
            },
            trigger: 'blur'
          } as RuleObject)
        }

        // 兼容：如果不识别配置类型，仍然只保留 required 规则
        rules[key] = ruleList
      }
      return rules
    }

    const openModal = (method: ProductMethodForIssue): void => {
      currentMethod.value = method
      inputParams.value = method.inputParams?.params ?? []
      clearFormState()
      for (const p of inputParams.value) {
        // 初始化为 undefined，交给 Form 自己控制是否报 required
        formState[p.param_code] = undefined
      }
      submitLoading.value = false
      modalVisible.value = true
      formRef.value?.clearValidate()
      syncRules()
    }

    const closeModal = (): void => {
      modalVisible.value = false
    }

    const ok = async (): Promise<void> => {
      try {
        submitLoading.value = true
        const values = await formRef.value?.validate()
        const normalized: Record<string, unknown> = {}
        if (values && typeof values === 'object') {
          normalizedFromForm(values, normalized)
        }
        if (!currentMethod.value?.methodCode) {
          message.error('未获取到方法编码')
          return
        }
        const inputParamsPayload: Record<string, unknown> = {}
        for (const p of inputParams.value) {
          const v = normalized[p.param_code]
          if (v !== undefined) {
            inputParamsPayload[p.param_code] = v
          }
        }
        const commandSeq = `${Date.now()}${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`
        const deviceCenterCommandService = cubeDeviceCenterService as typeof cubeDeviceCenterService & {
          invokeProductMethod: (payload: {
            commandSeq?: string | number;
            deviceId: string | number;
            methodCode: string;
            inputParams: Record<string, unknown>;
          }) => Promise<unknown>;
        }
        const invokePayload = {
          commandSeq,
          deviceId: props.deviceId,
          methodCode: currentMethod.value.methodCode,
          inputParams: inputParamsPayload,
        }
        await invokeProductMethodWithFallback(deviceCenterCommandService, invokePayload)
        message.success('指令下发成功')
        modalVisible.value = false
      } catch (_ignore) {
        message.error('指令下发失败')
      } finally {
        submitLoading.value = false
      }
    }

    async function invokeProductMethodWithFallback (
      deviceCenterCommandService: {
        invokeProductMethod?: (payload: {
          commandSeq?: string | number;
          deviceId: string | number;
          methodCode: string;
          inputParams: Record<string, unknown>;
        }) => Promise<unknown>;
      },
      payload: {
        commandSeq?: string | number;
        deviceId: string | number;
        methodCode: string;
        inputParams: Record<string, unknown>;
      }
    ): Promise<void> {
      if (typeof deviceCenterCommandService.invokeProductMethod === 'function') {
        await deviceCenterCommandService.invokeProductMethod(payload)
        return
      }
      // 兜底：当 service 方法未热更新到运行时，直接请求接口保证下发可用
      const resp = await fetch('/api/iot/north/product-method/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      if (!resp.ok) {
        throw new Error(`invoke failed: ${resp.status}`)
      }
    }

    function normalizedFromForm (
      values: unknown,
      out: Record<string, unknown>
    ): void {
      if (!values || typeof values !== 'object') {
        return
      }
      const record = values as Record<string, unknown>
      for (const p of inputParams.value) {
        const raw = record[p.param_code]
        const cfgType = getConfigType(p.data_config)
        if (cfgType === 'range') {
          const dt = p.data_type
          const precision = typeof p.precision === 'number' ? p.precision : undefined
          if (raw === undefined) {
            out[p.param_code] = raw
            continue
          }
          const num = typeof raw === 'number' ? raw : Number(raw)
          if (!Number.isFinite(num)) {
            out[p.param_code] = raw
            continue
          }
          if (dt === 'float' || dt === 'double') {
            if (typeof precision === 'number') {
              out[p.param_code] = Number(num.toFixed(precision))
            } else {
              out[p.param_code] = num
            }
          } else {
            // int/long 等：取整
            out[p.param_code] = dt === 'int' || dt === 'long' ? Math.trunc(num) : num
          }
          continue
        }

        if (cfgType === 'enum') {
          const enumValues = getEnumConfig(p).enumValues
          const isNumericString = (val: unknown): boolean => {
            if (typeof val === 'number') return Number.isFinite(val)
            if (typeof val !== 'string') return false
            return /^-?\d+(\.\d+)?$/.test(val.trim())
          }
          const tryParseNumber = (val: unknown): unknown => {
            if (typeof val === 'number') return val
            if (typeof val === 'string' && isNumericString(val)) return Number(val.trim())
            return val
          }

          // 如果枚举全集都看起来是数字，把表单值转成数字（适配后端示例里的 0/1）
          const shouldConvertAll = enumValues.length > 0 && enumValues.every((e) => isNumericString(e.value))
          if (shouldConvertAll) {
            out[p.param_code] = tryParseNumber(raw)
          } else {
            out[p.param_code] = raw
          }
          continue
        }

        if (cfgType === 'length' || cfgType === 'strLen') {
          out[p.param_code] = raw === undefined ? raw : String(raw)
          continue
        }

        out[p.param_code] = raw
      }
    }

    const formRules = ref<Record<string, RuleObject[]>>({})

    // 由于 cube-ui 的 rules 需要稳定引用，这里在 inputParams 更新后重新生成
    const syncRules = (): void => {
      formRules.value = buildRules()
    }

    expose({
      openModal
    })

    return (): JSX.Element => (
      <Modal
        visible={modalVisible.value}
        title='指令下发'
        width={900}
        onCancel={closeModal}
        confirmLoading={submitLoading.value}
        onOk={ok}
      >
        <Form model={formState} ref={formRef} rules={formRules.value} labelCol={{ style: { width: '110px' } }}>
          {inputParams.value.map((p) => {
            const cfgType = getConfigType(p.data_config)
            const label = p.name || p.param_code
            if (cfgType === 'range') {
              const { min, max, step } = getRangeConfig(p)
              const dt = p.data_type
              const precision = typeof p.precision === 'number' ? p.precision : undefined
              const shouldInferStep = (dt === 'float' || dt === 'double') && typeof precision === 'number' && typeof step !== 'number'
              const stepForInput = shouldInferStep ? 1 / Math.pow(10, precision) : step
              return (
                <FormItem key={p.param_code} label={label} name={p.param_code}>
                  <InputNumber
                    v-model:value={formState[p.param_code] as number}
                    allowClear
                    style={{ width: '320px' }}
                    {...(typeof min === 'number' ? { min } : {})}
                    {...(typeof max === 'number' ? { max } : {})}
                    {...(typeof stepForInput === 'number' ? { step: stepForInput } : {})}
                    {...(typeof p.precision === 'number' ? { precision: p.precision } : {})}
                  />
                </FormItem>
              )
            }

            if (cfgType === 'enum') {
              const { enumValues } = getEnumConfig(p)
              return (
                <FormItem key={p.param_code} label={label} name={p.param_code}>
                  <Select
                    v-model:value={formState[p.param_code]}
                    options={renderSelectOptions(enumValues)}
                    placeholder='请选择'
                    style={{ width: '320px' }}
                    allowClear
                  />
                </FormItem>
              )
            }

            if (cfgType === 'length' || cfgType === 'strLen') {
              const { len } = getLengthConfig(p)
              return (
                <FormItem key={p.param_code} label={label} name={p.param_code}>
                  <Input
                    v-model:value={formState[p.param_code] as string}
                    placeholder='请输入'
                    allowClear
                    style={{ width: '320px' }}
                    {...(typeof len === 'number' ? { maxlength: len } : {})}
                  />
                </FormItem>
              )
            }

            // fallback：未知配置类型，按字符串输入
            return (
              <FormItem key={p.param_code} label={label} name={p.param_code}>
                <Input v-model:value={formState[p.param_code] as string} placeholder='请输入' allowClear style={{ width: '320px' }} />
              </FormItem>
            )
          })}
        </Form>
      </Modal>
    )
  }
})

