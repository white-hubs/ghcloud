import { defineComponent, ref, type PropType, watch } from 'vue'
import { Input, Textarea, Select } from '@ghcloud/cube-ui'
import { ModalForm, type FormSource } from '@/components/modal-form/modal-form'
import '@/styles/gateway.less'
import { getPluginProtocolList, getDynamicCfgSchema } from '@/api/gateway'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { GatewayState } from '@/typings/gateway'
import { useFormData } from '@/hook/use-form-data'

interface Props {
  title: string;
  show: boolean;
  submitLoading: boolean;
  action: string; // 'add' | 'edit'
  formData: GatewayState;
}
export const GatewayModal = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    },
    submitLoading: {
      type: Boolean,
      default: false
    },
    action: {
      type: String,
      default: ''
    },
    formData: {
      type: Object as PropType<GatewayState>,
      default: () => ({})
    },
  },
  emits: ['update:show', 'ok', 'update:formData'],
  setup: (props: Props, { emit }) => {
    const formData = ref<GatewayState>(props.formData ?? {
      name: '',
      deviceNum: '',
      pluginCode: '',
      secret: '',
      remark: '',
      gwConfig: '',
      gwConfigSchema: '',
    })
    // 动态表单
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const { dynFormOptions: dynOptions, dynFormData: dynamicFormData, labelWidth: dynOptionsWidth, updateFormOptions, resetForm } = useFormData('')
    watch(() => props.show, () => {
      getPluginOptions()
      if (props.action === 'add') {
        dynamicFormData.value = {}
        for (const key in formData.value) {
          (formData.value as Record<string, unknown>)[key] = undefined
        }
      }
    })

    watch(() => props.formData, () => {
      resetForm()
      if (props.action === 'edit' || props.action === 'detail') {
        formData.value = props.formData
        if (formData.value.gwConfig) {
          dynamicFormData.value = typeof formData.value.gwConfig === 'string' ? JSON.parse(formData.value.gwConfig) : formData.value.gwConfig
        }
        if (formData.value.gwConfigSchema) {
          updateFormOptions(formData.value.gwConfigSchema)
        }
      }
    }, { deep: true })

    // 插件列表
    const pluginCodeOptions = ref([])
    const getPluginOptions = async (): Promise<void> => {
      try {
        const res = await getPluginProtocolList()
        if (res.data) {
          pluginCodeOptions.value = res.data
          formSource.value[2].props.options = res.data
        }
      } catch {
      }
    }
    // 选择插件协议 切换对应的配置表单
    const changePluginCode = async (value: string): Promise<void> => {
      try {
        let dynamicFormConfig = ''
        const res = await getDynamicCfgSchema({ pluginCode: value })
        if (res.data) {
          dynamicFormConfig = res.data
        }
        updateFormOptions(dynamicFormConfig)
      } catch {

      }
    }
    // 顶部固定的表单
    const topFormRenderRef = ref<{ modalFormRef: FormExpose; }>()
    const modalRules = {
      deviceNum: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
      name: [{ required: true, message: '请输入网关名称', trigger: 'blur' }],
      pluginCode: [{ required: true, message: '请选择插件协议', trigger: 'blur' }],
    }
    const formSource = ref([
      {
        label: '设备编码',
        value: 'deviceNum',
        component: Input,
        props: {
          placeholder: '请输入设备编码',
          maxlength: 100,
          onChange: (e: { target: { value: string; }; }): JSX.Element | string=> {
            const inputValue = e.target.value
            formData.value.deviceNum = inputValue.replace(/\s/g, '')
            return formData.value.deviceNum
          }
        }
      },
      {
        label: '网关名称',
        value: 'name',
        component: Input,
        props: {
          placeholder: '请输入网关名称',
          maxlength: 100,
        }
      },
      {
        label: '插件协议',
        value: 'pluginCode',
        component: Select,
        props: {
          placeholder: '请选择插件协议',
          options: pluginCodeOptions.value,
          allowClear: true,
          fieldNames: { label: 'name', value: 'code' },
          disabled: props.action === 'edit',
          onChange: changePluginCode
        }
      },
      {
        label: '私钥',
        value: 'secret',
        component: Textarea,
        props: {
          placeholder: '请输入私钥',
          autoSize: { minRows: 2, maxRows: 4 },
          maxlength: 200
        }
      },
      {
        label: '描述',
        value: 'remark',
        component: Textarea,
        props: {
          placeholder: '请输入备注说明',
          autoSize: { minRows: 2, maxRows: 4 },
          maxlength: 200
        }
      }
    ])
    const cancle = (): void => {
      emit('update:show', false)
    }
    const ok = async (): Promise<void> => {
      Promise.allSettled([
        topFormRenderRef.value?.modalFormRef.validate(),
        dynamicFormRenderRef.value?.formRef.validate()
      ]).then(async (values) => {
        const rejected = values.some(c => c.status === 'rejected')
        if (!rejected) {
          // let obj = {};
          // const result = values.filter(c => c.status === 'fulfilled').map(c => c as PromiseFulfilledResult<unknown>).map(c => Object.assign(obj, c.value));
          emit('update:formData', {
            ...formData.value,
            gwConfig: dynamicFormData.value
          })
          emit('ok')
        }
      })
    }
    const dynamicSlots = {
      'dynamic-form': (): JSX.Element => {
        return (
          <>
            <DynamicFormRender
              class={dynOptions.value.length > 0 ? 'dynamic-form' : ''}
              formOptions={dynOptions.value}
              labelWidth={`${dynOptionsWidth.value}px`}
              v-model:formData={dynamicFormData.value}
              ref={dynamicFormRenderRef}
            />
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <ModalForm
          title={props.title}
          v-model:show={props.show}
          formSource={formSource.value as FormSource}
          v-model:formState={formData.value}
          rules={modalRules}
          onOk={ok}
          onCancle={cancle}
          ref={topFormRenderRef}
          submitLoading={props.submitLoading}
          v-slots={dynamicSlots}
        />
      </>
  }
})
