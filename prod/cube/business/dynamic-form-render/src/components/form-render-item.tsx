import { defineComponent, computed, type Component, h, ref, watch } from 'vue'
import { FormItems } from './form-items/form-items'
import dayjs from 'dayjs'
interface Props {
  value?: string | number | unknown[];
  formData: Record<string, unknown>;
  dependentParams: string[];
  componentName: string;
  componentProps: Record<string, unknown>;
  customComponent?: Component;
  readonly?: boolean;
}

export default defineComponent({
  props: ['value', 'formData', 'dependentParams', 'componentName', 'componentProps', 'customComponent', 'readonly'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const allFormitems = computed<Record<string, Component>>((): Record<string, Component> => {
      const custom: Record<string, Component> = {}
      if (props.customComponent) {
        custom[props.componentName] = props.customComponent
      }
      return { ...FormItems, ...custom }
    })

    const formItemValue = ref<string | number | unknown[] | undefined>(props.value)
    watch(() => props.value, () => {
      formItemValue.value = props.value
    })
    const componentNotFoundMessage = computed(() => h('div', `尚未实现的表单元素[${props.componentName}],需要外部注入`))

    return () => {
      const editableOptions: Record<string, unknown> = {
        ...props.componentProps,
        readonly: props.readonly,
        bordered: !props.readonly,
        formData: props.formData,
        dependentParams: props.dependentParams,
        value: formItemValue.value,
        'onUpdate:value': (value: string | number | unknown[] | undefined) => {
          formItemValue.value = value
          emit('update:value', value)
        },
      }
      if (props.readonly && !props.customComponent) {
        if (['SelectInput', 'RadioGroup'].includes(props.componentName)) {
          const options = (props.componentProps as { options: { label: string; value: string; }[]; })?.options ?? []
          return options.find(e => e.value === formItemValue.value)?.label ?? '--'
        }
        if (['CheckboxGroup'].includes(props.componentName)) {
          const options = (props.componentProps as { options: { label: string; value: string; }[]; })?.options ?? []
          if (props.value) {
            const res: string[] = []
            options.forEach(e => {
              if ((props.value as unknown[]).includes(e.value)) {
                res.push(e.label)
              }
            })
            return res.join(',')
          }
          return '--'
        }
        if (['Switch'].includes(props.componentName)) {
          let name = props.componentProps?.children as string[]
          let realName = ''
          if(name&&name.length){
            realName = name[0]
            return realName
          }
          return props.value ? '是' : '否'
        }
        if (['TimeRange'].includes(props.componentName)) {
          editableOptions.disabled = true
        }
        if (['DateTime'].includes(props.componentName)) {
          return props.value ? dayjs(props.value as string).format((props.componentProps as { valueFormat?: string; }).valueFormat ?? 'YYYY-MM-DD') : '--'
        }
        if (['UserPickerTable', 'TimeRange'].includes(props.componentName)) {
          const editable = h(allFormitems.value[props.componentName] ?? componentNotFoundMessage.value, editableOptions)
          return editable
        }
        return formItemValue.value ?? '--'
      } else {
        const editable = h(allFormitems.value[props.componentName] ?? componentNotFoundMessage.value, editableOptions)
        return editable
      }
    }
  }
})
