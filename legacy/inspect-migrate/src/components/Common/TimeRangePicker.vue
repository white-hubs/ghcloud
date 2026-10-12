<template>
  <div class="time-range-picker">
    <a-time-picker
      v-model:value="startMoment"
      format="HH:mm"
      :placeholder="startPlaceholder"
      allow-clear
      @change="onRangeChange"
    />
    <span class="time-range-sep">至</span>
    <a-time-picker
      v-model:value="endMoment"
      format="HH:mm"
      :placeholder="endPlaceholder"
      allow-clear
      @change="onRangeChange"
    />
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import moment from 'moment'

const VALUE_SEP = '-'
const TIME_FORMAT = 'HH:mm'

function parseValue (v) {
  if (!v || typeof v !== 'string') return { start: null, end: null }
  const parts = v.split(VALUE_SEP)
  if (parts.length !== 2) return { start: null, end: null }
  const start = parts[0].trim()
  const end = parts[1].trim()
  if (!start || !end) return { start: null, end: null }
  return { start, end }
}

function toMoment (timeStr) {
  if (!timeStr) return null
  const base = moment().format('YYYY-MM-DD')
  const m = moment(`${base} ${timeStr}`, `YYYY-MM-DD ${TIME_FORMAT}`)
  return m.isValid() ? m : null
}

export default {
  name: 'TimeRangePicker',
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: '请选择时间段',
    },
  },
  emits: ['update:value'],
  setup (props, { emit }) {
    const startPlaceholder = '开始时间'
    const endPlaceholder = '结束时间'

    const startMoment = ref(null)
    const endMoment = ref(null)

    watch(
      () => props.value,
      (val) => {
        const { start, end } = parseValue(val)
        startMoment.value = toMoment(start)
        endMoment.value = toMoment(end)
      },
      { immediate: true }
    )

    function onRangeChange () {
      const s = startMoment.value
      const e = endMoment.value
      const startStr = s && typeof s.format === 'function' ? s.format(TIME_FORMAT) : null
      const endStr = e && typeof e.format === 'function' ? e.format(TIME_FORMAT) : null
      if (startStr && endStr) {
        emit('update:value', `${startStr}${VALUE_SEP}${endStr}`)
      } else {
        emit('update:value', null)
      }
    }

    return {
      startPlaceholder,
      endPlaceholder,
      startMoment,
      endMoment,
      onRangeChange,
    }
  },
}
</script>

<style scoped>
.time-range-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.time-range-sep {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
