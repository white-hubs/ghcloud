import { defineComponent, onMounted, ref } from 'vue'
import { InputNumber, Select, message } from '@ghcloud/cube-ui'
import { ModalForm, type FormSource } from '@/components/modal-form/modal-form'
import '@/styles/gateway.less'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { updateReportTacticsByGateway } from '@/api/gateway'

interface DynamicReportStrategy {
  changeUpVal: number | null;
  intervalReportMill: number | null;
  reportStrategy: string | null;
}
interface Props {
  title: string;
  action: string; // 'add' | 'edit' | 'detail'
  gatewayId: string;
}
export const UpdateReportModal = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    gatewayId: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      default: 'add'
    },
  },
  setup: (props: Props, { expose }) => {
    const formData = ref<DynamicReportStrategy>({
      changeUpVal: null,
      intervalReportMill: null,
      reportStrategy: null,
    })
    // 顶部固定的表单
    const topFormRenderRef = ref<{ modalFormRef: FormExpose; }>()
    const escalationOptions = ref([
      { label: '变化上报', value: 'change-up' },
      { label: '定时上报', value: 'period-up' }
    ])
    const changeReport = (value: string): void => {
      if (value === 'change-up') {
        formSource.value = changeUp
        modalRules.value = changeUpRules
      } else {
        formSource.value = periodUp
        modalRules.value = periodUpRules
      }
    }
    const changeUp = [
      {
        label: '上报方式',
        value: 'reportStrategy',
        component: Select,
        props: {
          placeholder: '请选择上报方式',
          options: escalationOptions.value,
          allowClear: true,
          onChange: changeReport
        }
      },
      {
        label: '间隔时长',
        value: 'intervalReportMill',
        component: InputNumber,
        props: {
          placeholder: '请输入间隔时长',
          addonAfter: '毫秒',
        }
      },
      {
        label: '变化值',
        value: 'changeUpVal',
        component: InputNumber,
        props: {
          placeholder: '请输入变化值',
          precision: 9,
        }
      },
    ]
    const periodUp = [
      {
        label: '上报方式',
        value: 'reportStrategy',
        component: Select,
        props: {
          placeholder: '请选择上报方式',
          options: escalationOptions.value,
          allowClear: true,
          onChange: changeReport
        }
      },
      {
        label: '间隔时长',
        value: 'intervalReportMill',
        component: InputNumber,
        props: {
          placeholder: '请输入间隔时长',
          addonAfter: '毫秒',
        }
      },
    ]
    const formSource = ref(changeUp)
    const changeUpRules = {
      reportStrategy: [{ required: true, message: '请选择上报方式', trigger: 'blur' }],
      intervalReportMill: [{ required: true, message: '请输入间隔时长', trigger: 'blur' }],
      changeUpVal: [{ required: true, message: '请输入变化值', trigger: 'blur' }],
    }
    const periodUpRules = {
      reportStrategy: [{ required: true, message: '请选择上报方式', trigger: 'blur' }],
      intervalReportMill: [{ required: true, message: '请输入间隔时长', trigger: 'blur' }],
    }
    const modalRules = ref()
    const show = ref(false)
    const cancle = (): void => {
      show.value = false
    }
    const open = (): void => {
      show.value = true
    }
    const submitLoading = ref(false)
    const ok = async (): Promise<void> => {
      try {
        submitLoading.value = true
        await topFormRenderRef.value?.modalFormRef.validate()
        await updateReportTacticsByGateway({
          gatewayId: props.gatewayId,
          dynamicReportStrategy: {
            changeUpVal: formData.value.changeUpVal,
            intervalReportMill: formData.value.intervalReportMill,
            reportStrategy: formData.value.reportStrategy,
          }
        })
        message.success('操作成功')
        show.value = false
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    onMounted(() => {
      modalRules.value = changeUpRules
    })
    expose({
      open
    })
    return (): JSX.Element =>
      <>
        <ModalForm
          title={props.title}
          v-model:show={show.value}
          formSource={formSource.value as FormSource}
          v-model:formState={formData.value}
          rules={modalRules.value}
          onOk={ok}
          onCancle={cancle}
          ref={topFormRenderRef}
          submitLoading={submitLoading.value}
          class='form-modal-wrap'
          action={props.action}
        />
      </>
  }
})
