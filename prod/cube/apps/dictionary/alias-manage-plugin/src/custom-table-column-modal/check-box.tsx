import { defineComponent } from 'vue'

interface Props {
  label: string;
  checked?: boolean;
  indeterminate?: boolean;
}

export const CheckBox = defineComponent({
  props: ['label', 'checked', 'indeterminate'],
  emits: ['update:checked'],
  setup (props: Props, { emit }) {
    return () =>
      <label class={`ant-checkbox-wrapper ${props.checked ? 'ant-checkbox-wrapper-checked' : ''} ${props.indeterminate ? 'ant-checkbox-indeterminate' : ''}`} onClick={() => { emit('update:checked', !props.checked) }}>
        <span class={`ant-checkbox ${props.checked ? 'ant-checkbox-checked' : ''}`}>
          <input type="checkbox" class="ant-checkbox-input" />
          <span class="ant-checkbox-inner"></span>
        </span>
        <span onClick={() => { emit('update:checked', !props.checked) }} style='user-select:none'>{props.label}</span>
      </label>
  },
})
