import { defineComponent, reactive, ref, watch } from 'vue'
import { Form, FormItem, InputNumber, Row, Col, type FormInstance } from 'ant-design-vue'
import styles from './index.module.less'
export const TaskTimeLimit = defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value'],
  setup: (props, { emit }) => {
    const formState = reactive({
      day: 0,
      hour: 0,
      minute: 0
    })
    const formRef = ref<FormInstance>()
    const rules = {
      day: [
        {
          required: true,
          message: '请输入天数',
        },
        {
          message: '请输入正整数(包含0)',
          pattern: /^[+]{0,1}(\d+)$/g,
        },
      ],
      hour: [
        {
          required: true,
          message: '请输入小时',
        },
        {
          message: '请输入正整数(包含0)',
          pattern: /^[+]{0,1}(\d+)$/g,
        },
      ],
      minute: [
        {
          required: true,
          message: '请输入分钟',
        },
        {
          message: '请输入正整数(包含0)',
          pattern: /^[+]{0,1}(\d+)$/g,
        },
      ]
    }
    watch(() => props.value, () => {
      if (props.value) {
        const limitTimeJson = JSON.parse(props.value) as Record<string, string>
        formState.day = Number(limitTimeJson.day)
        formState.hour = Number(limitTimeJson.hour)
        formState.minute = Number(limitTimeJson.minute)
      }
    })
    watch(() => [formState.day, formState.hour, formState.minute], () => {
      const { day, hour, minute } = formState
      if (day || hour || minute) {
        const limitTimeJson = JSON.stringify({ day, hour, minute })
        emit('update:value', limitTimeJson)
      }
      formRef.value?.validate()
    })
    return (): JSX.Element => (
      <Form ref={formRef} model={formState} rules={rules} layout='inline' class={styles.formContainer}>
        <Row gutter={4}>
          <Col span={8}>
            <FormItem style={{ width: '100%' }} name='day'>
              <InputNumber step={1} min={0} addonAfter='天' v-model:value={formState.day} max={999} placeholder='天' />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem style={{ width: '100%' }} name='hour'>
              <InputNumber step={1} min={0} addonAfter='时' v-model:value={formState.hour} max={23} placeholder='时' />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem style={{ width: '100%' }} name='minute'>
              <InputNumber step={1} min={0} addonAfter='分' v-model:value={formState.minute} max={59} placeholder='分' />
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
})
