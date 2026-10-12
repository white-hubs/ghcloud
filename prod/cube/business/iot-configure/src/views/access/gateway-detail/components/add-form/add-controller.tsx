import { defineComponent, ref, type PropType, watch } from 'vue'
import { Input } from '@ghcloud/cube-ui'
import { ModalForm, type FormSource } from '@/components/modal-form/modal-form'
import '@/styles/gateway.less'
import { getControllerSchema } from '@/api/add-form'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { ControllerState } from '@/typings/gateway'
import { useFormData } from '@/hook/use-form-data'

interface Props {
  title: string;
  show: boolean;
  submitLoading: boolean;
  action: string; // 'add' | 'edit'
  formData: ControllerState;
}
export const AddControllerModal = defineComponent({
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
      type: Object as PropType<ControllerState>,
      default: () => ({})
    },
  },
  emits: ['update:show', 'ok', 'update:formData'],
  setup: (props: Props, { emit }) => {
    const formData = ref<ControllerState>(props.formData ?? {
      ctlName: '',
      appConfigSchema: '',
      linkConfigSchema: '',
      ctlCode: '',
      ctlId: '',
      ctlStatus: '',
      dynamicConfig: '',
      lastOnlineTime: '',
      chlId: '',
      appConfig: '',
      linkConfig: '',
      remark: '',
    })
    const { dynFormOptions: linkDynOptions, dynFormData: linkDynamicFormData, labelWidth: linkDynOptionsWidth, updateFormOptions: updateLinkFormData, resetForm: resetLinkForm } = useFormData('')
    const { dynFormOptions: appDynOptions, dynFormData: appDynamicFormData, labelWidth: appDynOptionsWidth, updateFormOptions: updateAppFormData, resetForm: resetAppForm } = useFormData('')
    // 动态表单
    const appDynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const linkDynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    watch(() => props.show, () => {
      if (props.formData.chlId) getSchema()
      if (props.action === 'add') {
        for (const key in formData.value) {
          (formData.value as Record<string, unknown>)[key] = undefined
        }
      }
    })

    watch(() => props.formData, () => {
      resetLinkForm()
      resetAppForm()
      try {
        if (props.action === 'edit' || props.action === 'detail') {
          formData.value = props.formData
          linkDynamicFormData.value = formData.value?.linkConfig ? JSON.parse(formData.value?.linkConfig) : {}
          appDynamicFormData.value = formData.value?.appConfig ? JSON.parse(formData.value?.appConfig) : {}
        }
        if (formData.value?.linkConfigSchema) {
          updateLinkFormData(formData.value?.linkConfigSchema)
        }
        if (formData.value?.appConfigSchema) {
          updateAppFormData(formData.value?.appConfigSchema)
        }
        if (props.action === 'detail') {
          appDynOptions.value.forEach(e => {
            e.readonly = true
          })
          linkDynOptions.value.forEach(e => {
            e.readonly = true
          })
        }
      } catch {
      }
    }, { deep: true })

    // 配置表单
    const getSchema = async (): Promise<void> => {
      try {
        const res = await getControllerSchema({ channelId: props.formData.chlId ?? '' })
        if (res.data) {
          const { ctlAppSpec, ctlLinkSpec } = res.data
          updateAppFormData(ctlAppSpec)
          updateLinkFormData(ctlLinkSpec)
        }
      } catch {
      }
    }

    // 顶部固定的表单
    const topFormRenderRef = ref<{ modalFormRef: FormExpose; }>()
    const modalRules = {
      ctlName: [{ required: true, message: '请输入控制器名称', trigger: 'blur' }],
      ctlCode: [{ required: true, message: '请输入控制器标识', trigger: 'blur' }],
    }
    const formSource = ref([
      {
        label: '控制器名称',
        value: 'ctlName',
        component: Input,
        props: {
          placeholder: '请输入控制器名称',
          maxlength: 100,
        }
      },
      {
        label: '控制器标识',
        value: 'ctlCode',
        component: Input,
        props: {
          placeholder: '请输入控制器标识',
          maxlength: 100,
        }
      },
    ])
    const cancle = (): void => {
      emit('update:show', false)
    }
    const ok = async (): Promise<void> => {
      if (props.action === 'detail') {
        emit('update:show', false)
        return
      }
      Promise.allSettled([
        topFormRenderRef.value?.modalFormRef.validate(),
        appDynamicFormRenderRef.value?.formRef.validate(),
        linkDynamicFormRenderRef.value?.formRef.validate()
      ]).then(async (values) => {
        const rejected = values.some(c => c.status === 'rejected')
        if (!rejected) {
          emit('update:formData', {
            ...formData.value,
            appConfig: appDynamicFormData.value,
            linkConfig: linkDynamicFormData.value,
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
              class={appDynOptions.value.length > 0 ? 'dynamic-form' : ''}
              formOptions={appDynOptions.value}
              labelWidth={`${appDynOptionsWidth.value}px`}
              v-model:formData={appDynamicFormData.value}
              ref={appDynamicFormRenderRef}
            />
            <DynamicFormRender
              class={(linkDynOptions.value.length > 0 && props.action !== 'detail') ? 'dynamic-form' : ''}
              formOptions={linkDynOptions.value}
              labelWidth={`${linkDynOptionsWidth.value}px`}
              v-model:formData={linkDynamicFormData.value}
              ref={linkDynamicFormRenderRef}
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
          formSource={formSource.value as unknown as FormSource}
          v-model:formState={formData.value}
          rules={modalRules}
          onOk={ok}
          onCancle={cancle}
          ref={topFormRenderRef}
          submitLoading={props.submitLoading}
          v-slots={dynamicSlots}
          labelWidth='94px'
          action={props.action}
        />
      </>
  }
})
