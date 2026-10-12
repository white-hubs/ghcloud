<template>
  <SelectInput v-bind="props" v-model="selected" :options="options" option-text-key="name" option-value-key="id"
    v-if="!props.readonly" />
  <VanField readonly disabled :label="props.label" :required="props.required" :model-value="selected?.name"
    :error-message="props.errorMessage" :placeholder="'请选择'" v-else />
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import SelectInput from '../../../component/basic/input/select-input/select-input.vue'
import { SupplementClassOption } from '../../../domain/supplement-class-option'
import { attendanceService } from '../../../service/attendance/attendance.service'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref, watch } from 'vue'
import { SupplementClassProps } from './supplement-class'
import dayjs from 'dayjs'

/** 打卡状态 */
enum ClockInStatus {
  /** 正常 */
  NORMAL = 'NORMAL',
  /** 休息 */
  REST = 'REST',
  /** 旷工 */
  NEGLECT_WORK = 'NEGLECT_WORK',
  /** 异常 */
  ABNORMAL_WORK = 'ABNORMAL_WORK',
  /** 未打卡 */
  NOT_CHECKED = 'NOT_CHECKED',
  /** 早退 */
  EARLY_CHECKED = 'EARLY_CHECKED',
  /** 迟到 */
  LATE_CHECKED = 'LATE_CHECKED',
  /** 缺卡 */
  LACK_CHECKED = 'LACK_CHECKED',
}
const ClockInStatusOptions = [
  { label: '正常', value: ClockInStatus.NORMAL },
  { label: '休息', value: ClockInStatus.REST },
  { label: '旷工', value: ClockInStatus.NEGLECT_WORK },
  { label: '异常', value: ClockInStatus.ABNORMAL_WORK },
  { label: '未打卡', value: ClockInStatus.NOT_CHECKED },
  { label: '早退', value: ClockInStatus.EARLY_CHECKED },
  { label: '迟到', value: ClockInStatus.LATE_CHECKED },
  { label: '缺卡', value: ClockInStatus.LACK_CHECKED },
]

const props = defineProps<SupplementClassProps>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: SupplementClassOption): void;
}>()
const options = ref<SupplementClassOption[]>([])
const selected = ref<SupplementClassOption>()
defineExpose<FormItemExpose>({
  validate: () => !!selected.value
})
onMounted(() => {
  if (props.readonly && props.modelValue) {
    let option: SupplementClassOption
    if (typeof props.modelValue === 'string') {
      option = { id: props.modelValue, name: props.modelValue }
    } else {
      option = props.modelValue
    }
    options.value = [option]
    selected.value = option
  }
})
watch(() => props.dependFormValues, async () => {
  if (props.readonly) {
    return
  }
  const [repairDate] = props.dependFormValues
  if(!repairDate){
    return
  }
  const user = await staffService.getCurrentUser()
  await attendanceService.getSupplementClasses(user.id, repairDate)
  .then(res=>{
    options.value=res.map(e => {
      const item = e as { requireClockInTime: number; actualClockInTime: number; ways: 'GPS' | 'DEVEICE' | ''; id: string; clockType: string; state: ClockInStatus; }
      return {
        name: `${dayjs(item.requireClockInTime).format('HH:mm')} ${item.clockType === 'START' ? '上班' : '下班'}${ClockInStatusOptions.find(op => op.value === item.state)?.label}`,
        id: item.id
      }
    })
  })
},{immediate:true})
watch(selected, () => {
  if (selected.value) {
    emit('update:modelValue', selected.value)
  }
})
</script>

<style scoped></style>
