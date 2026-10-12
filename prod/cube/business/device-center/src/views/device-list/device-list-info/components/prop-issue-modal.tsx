import { cubeDeviceCenterService } from '@/api/service'
import { Form, FormItem, Input, InputNumber, Modal, Select, message, type FormExpose, type RuleObject } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'

interface EnumOption {
  value: string | number;
  label: string;
}

interface PropRecordForIssue {
  id: string;
  propCode: string;
  name: string;
  dataType: string;
  dataTypeName?: string;
  dataConfig?: string;
  dataWrite?: number;
  unitName?: string;
  precision?: number;
  newValue?: string;
}

export const PropIssueModal = defineComponent({
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
    const currentProp = ref<PropRecordForIssue | null>(null)
    const formState = reactive<{ value: unknown }>({
      value: undefined
    })

    const parseDataConfig = (dataConfig?: string): unknown[] => {
      if (!dataConfig) {
        return []
      }
      try {
        const parsed = JSON.parse(dataConfig)
        return Array.isArray(parsed) ? parsed : []
      } catch (_ignore) {
        return []
      }
    }

    const getEnumOptions = (): EnumOption[] => {
      const config = parseDataConfig(currentProp.value?.dataConfig)
      return config.filter((item): item is EnumOption => typeof item === 'object' && item !== null && 'value' in item && 'label' in item)
    }

    const getRangeConfig = (): { min?: number; max?: number } => {
      const config = parseDataConfig(currentProp.value?.dataConfig)
      const min = typeof config[0] === 'number' ? config[0] : undefined
      const max = typeof config[1] === 'number' ? config[1] : undefined
      return {
        ...(typeof min === 'number' ? { min } : {}),
        ...(typeof max === 'number' ? { max } : {})
      }
    }

    const isNumericType = (): boolean => ['int', 'long', 'float', 'double'].includes(currentProp.value?.dataType || '')
    const isFloatType = (): boolean => ['float', 'double'].includes(currentProp.value?.dataType || '')
    const isEnumType = (): boolean => ['enum', 'boolean'].includes(currentProp.value?.dataType || '')

    const buildRules = (): Record<string, RuleObject[]> => {
      const rules: Record<string, RuleObject[]> = {
        value: [{
          required: true,
          message: '请输入属性值',
          trigger: isEnumType() ? 'change' : 'blur'
        } as RuleObject]
      }
      if (isNumericType()) {
        const { min, max } = getRangeConfig()
        rules.value.push({
          validator: (_rule: unknown, value: unknown): Promise<void> => {
            if (value === undefined || value === null || value === '') {
              return Promise.resolve()
            }
            const num = typeof value === 'number' ? value : Number(value)
            if (!Number.isFinite(num)) {
              return Promise.reject(new Error('请输入数字'))
            }
            if (typeof min === 'number' && num < min) {
              return Promise.reject(new Error(`值不能小于${min}`))
            }
            if (typeof max === 'number' && num > max) {
              return Promise.reject(new Error(`值不能大于${max}`))
            }
            return Promise.resolve()
          },
          trigger: 'blur'
        } as RuleObject)
      }
      if (isEnumType()) {
        const options = getEnumOptions()
        const allowed = new Set(options.map((item) => String(item.value)))
        rules.value.push({
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
      }
      return rules
    }

    const formRules = ref<Record<string, RuleObject[]>>({})

    const openModal = (record: PropRecordForIssue): void => {
      currentProp.value = record
      formState.value = undefined
      formRules.value = buildRules()
      modalVisible.value = true
      formRef.value?.clearValidate()
    }

    const closeModal = (): void => {
      modalVisible.value = false
    }

    const normalizeValue = (raw: unknown): string => {
      if (!currentProp.value) {
        return ''
      }
      if (isNumericType()) {
        const num = typeof raw === 'number' ? raw : Number(raw)
        if (!Number.isFinite(num)) {
          return String(raw ?? '')
        }
        if (isFloatType()) {
          const precision = typeof currentProp.value.precision === 'number' ? currentProp.value.precision : undefined
          return typeof precision === 'number' ? String(Number(num.toFixed(precision))) : String(num)
        }
        return String(Math.trunc(num))
      }
      if (isEnumType()) {
        const options = getEnumOptions()
        const allNumeric = options.length > 0 && options.every((item) => /^-?\d+(\.\d+)?$/.test(String(item.value)))
        if (allNumeric && raw !== undefined && raw !== null && raw !== '') {
          return String(Number(raw))
        }
      }
      return String(raw ?? '')
    }

    const ok = async (): Promise<void> => {
      try {
        submitLoading.value = true
        await formRef.value?.validate()
        if (!currentProp.value?.propCode) {
          message.error('未获取到属性编码')
          return
        }
        /** Apifox CommandRequest：propValue 为 string */
        const propValue = normalizeValue(formState.value)
        const commandSeq = `${Date.now()}${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`
        const issuePayload: {
          commandSeq: string;
          deviceId: string;
          propCode: string;
          propValue: string;
        } = {
          commandSeq,
          deviceId: String(props.deviceId),
          propCode: currentProp.value.propCode,
          propValue
        }
        const deviceCenterService = cubeDeviceCenterService as typeof cubeDeviceCenterService & {
          issueDeviceCommand?: (payload: {
            commandSeq?: string | null;
            deviceId?: string | null;
            propCode?: string | null;
            propValue?: string | null;
          }) => Promise<unknown>;
        }
        await issueDeviceCommandWithFallback(deviceCenterService, issuePayload)
        message.success('指令下发成功')
        modalVisible.value = false
      } catch (_ignore) {
        message.error('指令下发失败')
      } finally {
        submitLoading.value = false
      }
    }

    async function issueDeviceCommandWithFallback (
      svc: { issueDeviceCommand?: (payload: {
        commandSeq?: string | null;
        deviceId?: string | null;
        propCode?: string | null;
        propValue?: string | null;
      }) => Promise<unknown> },
      payload: {
        commandSeq: string;
        deviceId: string;
        propCode: string;
        propValue: string;
      }
    ): Promise<void> {
      if (typeof svc.issueDeviceCommand === 'function') {
        await svc.issueDeviceCommand(payload)
        return
      }
      const resp = await fetch('/api/iot/north/device/command/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      if (!resp.ok) {
        throw new Error(`issue failed: ${resp.status}`)
      }
    }

    expose({
      openModal
    })

    return (): JSX.Element => {
      const options = getEnumOptions()
      const { min, max } = getRangeConfig()
      const precision = typeof currentProp.value?.precision === 'number' ? currentProp.value.precision : undefined
      const stepForInput = isFloatType() && typeof precision === 'number' ? 1 / Math.pow(10, precision) : undefined
      const unitName = currentProp.value?.unitName?.replace(/^[-]{1,2}$/, '') || ''

      return (
        <Modal
          visible={modalVisible.value}
          title='指令下发'
          width={760}
          onCancel={closeModal}
          confirmLoading={submitLoading.value}
          onOk={ok}
        >
          <Form model={formState} ref={formRef} rules={formRules.value} labelCol={{ style: { width: '110px' } }}>
            <FormItem label='属性名称'>
              <span>{currentProp.value?.name || '--'}</span>
            </FormItem>
            <FormItem label='属性标识'>
              <span>{currentProp.value?.propCode || '--'}</span>
            </FormItem>
            <FormItem label='属性值' name='value'>
              {isEnumType() ? (
                <Select
                  v-model:value={formState.value}
                  options={options.map((item) => ({ label: item.label, value: item.value }))}
                  placeholder='请选择属性值'
                  style={{ width: '320px' }}
                  allowClear
                />
              ) : isNumericType() ? (
                <InputNumber
                  v-model:value={formState.value as number}
                  allowClear
                  style={{ width: '320px' }}
                  {...(typeof min === 'number' ? { min } : {})}
                  {...(typeof max === 'number' ? { max } : {})}
                  {...(typeof precision === 'number' ? { precision } : {})}
                  {...(typeof stepForInput === 'number' ? { step: stepForInput } : {})}
                />
              ) : (
                <Input
                  v-model:value={formState.value as string}
                  placeholder='请输入属性值'
                  allowClear
                  style={{ width: '320px' }}
                />
              )}
              {unitName ? <span style={{ marginLeft: '8px', color: '#8c8c8c' }}>{unitName}</span> : null}
            </FormItem>
          </Form>
        </Modal>
      )
    }
  }
})
