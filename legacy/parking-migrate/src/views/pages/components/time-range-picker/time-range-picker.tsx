import { defineComponent, ref, watch } from 'vue'

export const TimeRangePicker = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup(props, { emit }) {
    const timeValue = ref(props.value)

    watch(() => props.value, (newValue) => {
      timeValue.value = newValue
    }, { deep: true, immediate: true })

    return () => (
      <a-range-picker
        v-model:value={timeValue.value}
        style={{ width: '100%' }}
        valueFormat='YYYY-MM-DD'
        allowClear
        onChange={() => emit('update:value', timeValue.value)}
        onCalendarChange={() => emit('update:value', timeValue.value)}
        getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode}
      />
    )
  }
})
