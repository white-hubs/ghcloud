import { Form, FormItem, Modal } from '@ghcloud/cube-ui'
import { defineComponent, ref, type PropType, h, type Component, watch } from 'vue'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
interface IOptions {
  children?: IOptions[];
  code?: string;
  id?: string | number;
  label?: string;
  value?: string;
  key?: string;
  val?: string;
  name?: string;
}
type FormSource = { value: string | number; label: string;component: Component;props?: { options: IOptions[]; }; }[]
interface Props {
  formSource: FormSource;
  formState: Record<string, string | number | []>;
  rules: Record<string, unknown[]>;
  title: string;
  show: boolean;
  submitLoading?: boolean;
  labelWidth?: string;
  action: string; // 'add' | 'edit' | 'detail'
}

export const ModalForm = defineComponent({
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
    labelWidth: {
      type: String,
      default: '80px'
    },
    formState: {
      type: Object,
      default: () => { return {} }
    },
    rules: {
      type: Object,
      default: () => { return {} }
    },
    formSource: {
      type: Array as PropType<FormSource>,
      default: () => []
    },
    action: {
      type: String,
      default: 'add'
    },
  },
  emits: ['update:show', 'ok', 'cancle', 'update:formState'],
  setup: (props: Props, { emit, expose, slots }) => {
    const cancel = (): void => {
      emit('cancle', false)
      emit('update:show', false)
    }
    const ok = (): void => {
      emit('ok', false)
    }
    const modalFormRef = ref<FormExpose>()
    const formState = ref<Record<string | number, string | number | [] | unknown>>(props.formState ?? {})
    const formSource = ref(props.formSource ?? {})
    watch(() => props.show, () => {
      formState.value = props.formState ?? {}
    })
    watch(() => props.formSource, () => {
      formSource.value = props.formSource ?? {}
    }, { deep: true })
    // 对外暴露组件实例
    expose({
      modalFormRef
    })
    return () =>
      <Modal
        visible={props.show}
        title={props.title}
        confirmLoading={props.submitLoading ?? false}
        destroyOnClose
        onCancel={cancel}
        onOk={ok}
      >
        <Form ref={modalFormRef} model={formState.value} rules={props.rules} labelCol={{ style: { width: props.labelWidth } }}>
          {
            formSource.value.map((e, i) => {
              if (props.action === 'detail') {
                if (e.props?.options && e.props?.options.length > 0) {
                  const curItem = e.props?.options.find(f => (f?.value === formState.value[e.value] || f?.id === formState.value[e.value] || f?.code === formState.value[e.value] || f?.val === formState.value[e.value]))
                  return (
                    <FormItem label={e?.label} name={e?.value.toString()} key={i}>
                      {
                        curItem?.name || curItem?.label || curItem?.key || '--'
                      }
                    </FormItem>
                  )
                } else {
                  return (
                    <FormItem label={e?.label} name={e?.value.toString()} key={i}>
                      <span>{formState.value[e.value] || '--'}</span>
                    </FormItem>
                  )
                }
              } else {
                return (
                  <FormItem label={e?.label} name={e?.value.toString()} key={i}>
                    {
                      h(
                        e.component,
                        {
                          ...(e.props ?? {}),
                          value: formState.value[e.value],
                          'onUpdate:value': (value: string | number | unknown[] | undefined) => {
                            formState.value[e.value] = value
                            emit('update:formState', formState.value)
                          },
                        },
                      )
                    }
                  </FormItem>
                )
              }
            })
          }
        </Form>
        {/* 动态表单 */}
        {slots['dynamic-form']?.()}
        {slots.default?.()}
      </Modal>
  }
})
