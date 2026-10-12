import { defineComponent, ref, type PropType, watch } from 'vue'
import { Input, Textarea, Select, RadioGroup, InputNumber } from '@ghcloud/cube-ui'
import { ModalForm, type FormSource } from '@/components/modal-form/modal-form'
import '@/styles/gateway.less'
import { getValSchema, getVarDataType } from '@/api/add-form'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { VarState, SelectOptions } from '@/typings/gateway'
import { useFormData } from '@/hook/use-form-data'

interface Props {
  title: string;
  show: boolean;
  submitLoading: boolean;
  action: string; // 'add' | 'edit'
  formData: VarState;
}
export const AddVarModal = defineComponent({
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
      type: Object as PropType<VarState>,
      default: () => ({})
    },
  },
  emits: ['update:show', 'ok', 'update:formData'],
  setup: (props: Props, { emit }) => {
    const formData = ref<VarState>(props.formData ?? {
      varName: '',
      varCode: '',
      readType: '',
      gwId: '',
      enable: '',
      dataType: undefined,
      ctlId: '',
      chlId: '',
      varId: '',
      appConfig: '',
      linkConfig: '',
      remark: '',
      precision: '',
      zoomExpression: '',
      reportStrategy: '',
      intervalReportMill: '',
      changeUpVal: undefined,
      convertStyleConfig: {
        precision: '',
        zoomExpression: '',
      },
      reportStrategyConfig: {
        reportStrategy: undefined,
        intervalReportMill: '',
        changeUpVal: '',
      }
    })
    const { dynFormOptions: linkDynOptions, dynFormData: linkDynamicFormData, labelWidth: linkDynOptionsWidth, updateFormOptions: updateLinkFormData, resetForm: resetLinkForm } = useFormData('')
    const { dynFormOptions: appDynOptions, dynFormData: appDynamicFormData, labelWidth: appDynOptionsWidth, updateFormOptions: updateAppFormData, resetForm: resetAppForm } = useFormData('')
    // 动态表单
    const appDynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const dynOptions = ref<DynamicFormRenderOptionProps[]>([])
    const dynamicFormData = ref<unknown>({})
    const linkDynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    watch(() => props.show, () => {
      getDataTypeOptions()
      if (props.formData.ctlId) getSchema()
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
          dynOptions.value.forEach(e => {
            e.readonly = true
          })
          linkDynOptions.value.forEach(e => {
            e.readonly = true
          })
        }
      } catch {

      }
    }, { deep: true })
    watch(() => formData.value.dataType, (newVal) => {
      // 浮点型显示精度
      if (newVal && ['double', 'float'].includes(newVal)) {
        formSource.value[3].props.hide = false
      } else {
        formSource.value[3].props.hide = true
      }
      // 整数 or 浮点数显示上报变化值
      if (newVal && !['boolean', 'enum', 'string'].includes(newVal)) {
        formSource.value[9].props.hide = false
      } else {
        formSource.value[9].props.hide = true
      }
    })
    watch(() => formData.value.reportStrategy, (newVal) => {
      // 变化上报显示变化值
      if (newVal === 'change-up') {
        formSource.value[9].props.hide = false
      } else {
        formSource.value[9].props.hide = true
      }
    })
    // 配置表单
    const getSchema = async (): Promise<void> => {
      try {
        const res = await getValSchema({ controllerId: props.formData.ctlId ?? '' })
        if (res.data) {
          const { varAppSpec, varLinkSpec } = res.data
          updateAppFormData(varAppSpec)
          updateLinkFormData(varLinkSpec)
        }
      } catch {
      }
    }

    // 数据类型
    const dataTypeOptions = ref<SelectOptions[]>([])
    const getDataTypeOptions = async (): Promise<void> => {
      try {
        const res = await getVarDataType()
        if (res.data && res.data.length > 0) {
          dataTypeOptions.value = res.data
          formSource.value[2].props.options = res.data
        }
      } catch {
      }
    }
    // 顶部固定的表单
    const topFormRenderRef = ref<{ modalFormRef: FormExpose; }>()
    const modalRules = {
      varName: [{ required: true, message: '请输入变量名称', trigger: 'blur' }],
      varCode: [{ required: true, message: '请输入变量标识', trigger: 'blur' }],
      dataType: [{ required: true, message: '请选择数据类型', trigger: 'blur' }],
      enable: [{ required: true, message: '请选择是否启用', trigger: 'blur' }],
      readType: [{ required: true, message: '请选择读写类型', trigger: 'blur' }],
    }
    const formSource = ref([
      {
        label: '变量名称',
        value: 'varName',
        component: Input,
        props: {
          placeholder: '请输入变量名称',
          maxlength: 100,
        }
      },
      {
        label: '变量标识',
        value: 'varCode',
        component: Input,
        props: {
          placeholder: '请输入变量标识',
          maxlength: 100,
        }
      },
      {
        label: '数据类型',
        value: 'dataType',
        component: Select,
        props: {
          placeholder: '请选择数据类型',
          options: dataTypeOptions.value,
          allowClear: true,
          fieldNames: { label: 'key', value: 'val' },
        }
      },
      {
        label: '精度',
        value: 'precision',
        component: InputNumber,
        props: {
          hide: true,
          placeholder: '请输入精度（保留小数点后几位）',
          maxlength: 100,
          min: 0,
          precision: 0,
          allowClear: true,
        }
      },
      {
        label: '是否启用',
        value: 'enable',
        component: RadioGroup,
        props: {
          class: '!w-390px',
          placeholder: '请选择是否启用',
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 }
          ]
        }
      },
      {
        label: '读写类型',
        value: 'readType',
        component: RadioGroup,
        props: {
          class: '!w-390px',
          placeholder: '请选择读写类型',
          options: [
            { label: '读写', value: 1 },
            { label: '只读', value: 0 }
          ]
        }
      },
      {
        label: '缩放表达式',
        value: 'zoomExpression',
        component: Textarea,
        props: {
          placeholder: `语法: 表达式应包含变量原始值 x，您可以使用常见的数学运算符（如 +、-、*、/ 、( 、)）进行计算。
示例:  
  要将原始值增加 10 后再乘以 0.1. (x + 10) * 0.1 
  若要仅将原始值翻倍. x * 2`,
          allowClear: true,
          rows: 6,
          maxlength: 1000,
          showCount: true
        }
      },
      {
        label: '上报方式',
        value: 'reportStrategy',
        component: Select,
        props: {
          placeholder: '请选择上报方式',
          options: [
            { label: '变化上报', value: 'change-up' },
            { label: '定时上报', value: 'period-up' }
          ],
          allowClear: true,
        }
      },
      {
        label: '间隔时长(ms)',
        value: 'intervalReportMill',
        component: InputNumber,
        props: {
          placeholder: '请输入间隔时长',
          min: 0,
          allowClear: true,
          addonAfter: '毫秒'
        }
      },
      {
        label: '变化值',
        value: 'changeUpVal',
        component: InputNumber,
        props: {
          hide: false,
          placeholder: '请输入变化值',
          maxlength: 100,
          min: 0,
          precision: 0,
          allowClear: true,
        }
      },
      {
        label: '变化值',
        value: 'changeUpVal',
        component: InputNumber,
        props: {
          hide: true,
          placeholder: '请输入变化值',
          precision: 9,
          allowClear: true,
        }
      },
      {
        label: '描述',
        value: 'remark',
        component: Textarea,
        props: {
          placeholder: '请输入描述',
          allowClear: true,
          maxlength: 200,
          showCount: true
        }
      }
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
            appConfig: dynamicFormData.value,
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
          labelWidth='110px'
        />
      </>
  }
})
