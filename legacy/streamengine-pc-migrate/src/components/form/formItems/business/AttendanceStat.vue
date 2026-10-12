<template>
  <a-input disabled v-model:value="value" :placeholder="placeholder" v-if="!props.readonly"/>
  <span v-else>{{ props.modelValue?props.modelValue+unit:'--' }}</span>
</template>
<script setup lang="ts">
import { getAttendanceStat } from '@/api/attendance'
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: { id: string, name: string } | null
  config: { attr: string };
  formData: { [key: string]: any };
  params: string;
  placeholder?: string;
  readonly:boolean
}>(), {
  modelValue: null,
  placeholder: '系统自动计算'
})
const emits = defineEmits(['update:modelValue'])
const value = ref(props.modelValue ?? '')

watch(() => props.formData[props.params], () => {
  if (!props.formData[props.params]) {
    value.value = '';
    emits('update:modelValue', null)
    return
  }
  getData()
})

const unit = computed(()=>{
  if (props.config.attr === 'SICK_LEAVE'||props.config.attr==='COMPASSIONATE_LEAVE') {
    return '天'
  } else {
    return '次'
  }
})


const getData = async (data?: string) => {
  let userId = data ? data : (props.formData?.sponsorId ?? "")
  let period = props.formData[props.params]
  if (userId && period && period.length > 0) {
    getAttendanceStat({ type: props.config.attr, userId: userId, period: period.join(',') }).then(res => {
      value.value = res+unit.value;
      emits('update:modelValue', res)
    })
  }
}

</script>
