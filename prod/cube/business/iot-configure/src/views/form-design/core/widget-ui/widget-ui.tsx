import { computed, defineComponent, h } from 'vue'
import type { FormItem } from '../widget'
import { Alert, CheckboxGroup, Input, RadioGroup } from '@ghcloud/cube-ui'
import Select from '@ghcloud/cube-ui/src/components/select/select'


interface Props{
  formItem: FormItem;
  value?: unknown;
  readonly?: boolean;
  style?: Record<string, unknown>;
}

export const WidgetUI = defineComponent({
  props: ['formItem', 'value', 'readonly', 'style'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {

    const widget: Record<string, JSX.Element> = {
      'input': <Input />,
      'textAlert': <Alert />,
      'select': <Select />,
      'radioGroup': <RadioGroup />,
      'checkboxGroup': <CheckboxGroup />,
    }
    const componentProps = computed(()=>{
      const res = props.formItem.props
      if (props.formItem.name === 'textAlert'){
        res.message = props.formItem.props.value
      }
      return res
    })

    return (): JSX.Element =>
      <>
        {
          Object.keys(widget).includes(props.formItem.name) ?
            h(widget[props.formItem.name], {
              ...componentProps.value,
              readonly: props.readonly ?? false,
              value: props.value,
              style: props.style,
              'onUpdate:value': (val: unknown) => emit('update:value', val),
            })
            :
            <div>未实现{props.formItem.name}</div>
        }
      </>
  }
})