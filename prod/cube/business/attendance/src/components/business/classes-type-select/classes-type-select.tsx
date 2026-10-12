import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch, type VNode } from 'vue'

interface Props {
  value: string[] | undefined;
  mode?: string;
  disabled?: boolean;
  bordered?: boolean;
}
export const ClassesTypeSelect = defineComponent({
  props: ['value', 'mode', 'disabled'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const value = ref(props.value ?? undefined)
    const options = ref<{ label: string; value: string; }[]>([
      { label: '早班', value: 'EARLY' },
      { label: '中班', value: 'MIDDLE_SHIFT' },
      { label: '夜班', value: 'NIGHT_SHIFT' },
      { label: '行政班', value: 'ADMINISTRATION_SHIFT' }
    ])
    watch(() => value.value, () => {
      emit('update:value', value.value)
    })
    watch(() => props.value, () => {
      value.value = props.value ?? []
    })

    return (): VNode =>
      <Select
        v-model:value={value.value}
        options={options}
        mode={props.mode}
        disabled={props.disabled ?? false}
        getPopupContainer={() => document.querySelector('.attendance-layout-content')}
      />
  }
})
