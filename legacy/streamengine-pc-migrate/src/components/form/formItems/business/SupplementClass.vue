<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择补卡班次" :disabled="props.readonly || !props.formData[props.params]" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?props.modelValue.name:'--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { clockInLogByDate } from '@/api/attendance'
import dayjs from 'dayjs'
import { onMounted, ref, watch } from 'vue'

type CommonType = {
  id: string;
  name: string;
}
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

const props = withDefaults(defineProps<{
  modelValue?: CommonType | null;
  readonly?: boolean;
  formData: any;
  params: string
}>(), {
  modelValue: null,
  readonly: false,
})

const options = ref<CommonType[]>([]);
const value = ref(props.modelValue?.id??null)
const emits = defineEmits(['update:modelValue'])

const getData = async () => {
  if (props.formData.sponsorId && props.formData[props.params]) {
    let repairDate = dayjs(props.formData[props.params]).format('YYYY-MM-DD')

    const params = {
      clockInDate: repairDate,
      userId: props.formData.sponsorId as string,
      abnormal:true
    }
    const res = await clockInLogByDate(params)
    if (res) {
      options.value = (res as unknown as unknown[]).map(e => {
        const item = e as { requireClockInTime: number; actualClockInTime: number; ways: 'GPS' | 'DEVEICE' | ''; id: string; clockType: string; state: ClockInStatus; }
        return {
          name: `${dayjs(item.requireClockInTime).format('HH:mm')} ${item.clockType === 'START' ? '上班' : '下班'}${ClockInStatusOptions.find(op => op.value === item.state)?.label}`,
          id: item.id
        }
      })
    }

    if (res.length === 1) {
      handleChange(res[0].id)
      value.value = res[0].id
    } else {
      value.value = null
    }
  }
}

watch(() => props.formData[props.params], () => {
  !props.readonly && getData()
},{immediate:true})

const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

onMounted(async () => {
  if (props.modelValue&&props.readonly) {
    options.value = [props.modelValue]
  } 
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
