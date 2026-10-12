import { defineComponent, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, type FormInstance, DatePicker, Select } from '@ghcloud/cube-ui'
import type { FormState } from '../fault-report'
import { cubeMaintainService } from '@/api/service'
import { MonthPicker } from 'ant-design-vue'
export const ADDModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object as PropType<FormState>,
      default: () => ({

      })
    }
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    const formState = reactive({
      type: undefined,
      reportTime: '',

    })
    const typeOptions = ref()
    const formRef = ref<FormInstance>()
    onMounted(() => {
      getType()
    })
    const getType = async (): Promise<void> => {
      try {
        typeOptions.value = await cubeMaintainService.faultReportType()
      } catch (error) {
      }
    }
    watch(() => props.formData, (val) => {
      Object.assign(formState, val)
    })
    const handleOk = async (): Promise< void> => {
      await formRef.value?.validate()
      emit('save', formState)
    }
    return () => (
      <Modal
        title='新增故障报告'
        width={600}
        onCancel={() => {
          emit('update:visible')
          formState.type = undefined
          formState.reportTime = ''
        }}
        onOk={handleOk}
        v-model:visible={props.visible}
      >
        <Form
          ref={formRef}
          rules={{
            type: [{
              required: true,
              message: '请输入类型名称'
            }],
            reportTime: [{
              required: true,
              message: '请选择时间'
            }],
          }} model={formState}
        >
          <FormItem label='报告类型' name='type'>
            <Select
              allowClear
              placeholder='请选择'
              style='width: 180px'
              fieldNames={{ label: 'name', value: 'code' }}
              options={typeOptions.value}
              v-model:value={formState.type}
              onChange={(val) => {
                formState.type = val
                formState.reportTime = ''
              }}
            />
          </FormItem>

          <FormItem label='时间选择' name='reportTime'>
            {
            formState.type === 'REPORT_MONTH'
              ? <MonthPicker v-model:value={formState.reportTime} placeholder='请选择时间' />
              : <DatePicker v-model:value={formState.reportTime} placeholder='请选择时间' />
          }
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
