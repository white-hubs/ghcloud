import { defineComponent, ref, type PropType, watch } from 'vue'
import { Input, Select } from '@ghcloud/cube-ui'
import { ModalForm, type FormSource } from '@/components/modal-form/modal-form'
import '@/styles/gateway.less'
import { getChannelAppLink, getChannelSchema } from '@/api/add-form'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { ChannelState, SelectOptions } from '@/typings/gateway'
import { useFormData } from '@/hook/use-form-data'

interface Props {
  title: string;
  show: boolean;
  submitLoading: boolean;
  action: string; // 'add' | 'edit' | 'detail'
  formData: ChannelState;
}
export const AddChannelModal = defineComponent({
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
      default: 'add'
    },
    formData: {
      type: Object as PropType<ChannelState>,
      default: () => ({})
    },
  },
  emits: ['update:show', 'ok', 'update:formData'],
  setup: (props: Props, { emit }) => {
    const formData = ref<ChannelState>(props.formData ?? {
      name: '',
      deviceNum: '',
      pluginCode: '',
      secret: '',
      remark: '',
      appConfig: '',
      linkConfig: '',
    })
    const { dynFormOptions: linkDynOptions, dynFormData: linkDynamicFormData, labelWidth: linkDynOptionsWidth, updateFormOptions: updateLinkFormData, resetForm: resetLinkForm } = useFormData('')
    const { dynFormOptions: appDynOptions, dynFormData: appDynamicFormData, labelWidth: appDynOptionsWidth, updateFormOptions: updateAppFormData, resetForm: resetAppForm } = useFormData('')
    // 动态表单
    const linkDynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const appDynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const resetFormData = (): void => {
      for (const key in formData.value) {
        (formData.value as Record<string, unknown>)[key] = undefined
      }
    }
    watch(() => props.show, () => {
      getPluginOptions().then(() => {
        if (props.formData.commCode) changeAppLinkCode(props.formData.commCode as string)
      })
      formSource.value[1].props.disabled = props.action === 'edit'
      formSource.value[2].props.disabled = props.action === 'edit'
      if (props.action === 'add') {
        resetFormData()
      }
      if (props.action === 'edit' || props.action === 'detail') {
        formData.value = props.formData
      }
    })

    watch(() => props.formData, () => {
      resetLinkForm()
      resetAppForm()
      try {

        if (props.formData.chlName) formData.value.channelName = props.formData.chlName
        if (props.formData.chlCode) formData.value.commCode = props.formData.chlCode
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

    // 通信协议
    const appLinkOptions = ref<SelectOptions[]>([])
    const getPluginOptions = async (): Promise<void> => {
      try {
        const res = await getChannelAppLink(props.formData.pluginCode)
        if (res.data && res.data.length > 0) {
          appLinkOptions.value = res.data
          formSource.value[1].props.options = res.data
        }
      } catch {
      }
    }
    // 选择通信协议，切换通信接口数据
    const interfaceOptions = ref<SelectOptions[]>([])
    const changeAppLinkCode = async (value: string): Promise<void> => {
      try {
        interfaceOptions.value = appLinkOptions.value.find(e => e.code === value)?.children ?? []
        formSource.value[2].props.options = interfaceOptions.value
      } catch {
      }
    }
    // 选择通信协议，切换对应的配置表单
    const changeInterfaceCode = async (value: string): Promise<void> => {
      try {
        if (!value) return
        const res = await getChannelSchema({
          pluginCode: props.formData.pluginCode || '',
          commCode: formData.value.commCode || '',
          interfaceCode: value
        })
        if (res.data) {
          const { appConfig, linkConfig } = res.data
          // 更新应用配置表单
          updateAppFormData(appConfig)
          // 更新链接配置表单
          updateLinkFormData(linkConfig)
        }
      } catch (error) {
      }
    }

    // 顶部固定的表单
    const topFormRenderRef = ref<{ modalFormRef: FormExpose; }>()
    const modalRules = {
      channelName: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
      commCode: [{ required: true, message: '请选择通讯协议', trigger: 'blur' }],
      interfaceCode: [{ required: true, message: '请选择通讯接口', trigger: 'blur' }],
    }
    const formSource = ref([
      {
        label: '通道名称',
        value: 'channelName',
        component: Input,
        props: {
          placeholder: '请输入通道名称',
          maxlength: 100,
        }
      },
      {
        label: '通讯协议',
        value: 'commCode',
        component: Select,
        props: {
          placeholder: '请选择通讯协议',
          options: appLinkOptions.value,
          allowClear: true,
          fieldNames: { label: 'name', value: 'code' },
          disabled: props.action === 'edit',
          onChange: changeAppLinkCode
        }
      },
      {
        label: '通讯接口',
        value: 'interfaceCode',
        component: Select,
        props: {
          placeholder: '请选择通讯接口',
          options: interfaceOptions.value,
          allowClear: true,
          fieldNames: { label: 'name', value: 'code' },
          disabled: props.action === 'edit',
          onChange: changeInterfaceCode
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
            commCode: formData.value.commCode || '',
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
              class={(appDynOptions.value.length > 0 && props.action !== 'detail') ? 'dynamic-form' : ''}
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
          formSource={formSource.value as FormSource}
          v-model:formState={formData.value}
          rules={modalRules}
          onOk={ok}
          onCancle={cancle}
          ref={topFormRenderRef}
          submitLoading={props.submitLoading}
          v-slots={dynamicSlots}
          class='form-modal-wrap'
          action={props.action}
        />
      </>
  }
})
