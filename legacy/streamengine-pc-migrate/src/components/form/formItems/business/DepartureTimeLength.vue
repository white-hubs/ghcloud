<template>
  <div>
    <a-input disabled v-model:value="value" :placeholder="placeholder" v-if="!props.readonly"/>
    <span v-else>{{ props.modelValue?`${props.modelValue}小时`:'--' }}</span>
  </div>
</template>
<script setup lang="ts">
import { leavePostDuration } from '@/api/attendance'
import { inject, ref, watch } from 'vue';

const businessType =inject('businessType') as string;
const props = withDefaults(defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  readonly?: boolean;
  config: any;
  params: string;
  params2: string;
  formData: any
}>(), {
  modelValue: null,
  placeholder: "自动计算",
  readonly: false
})
const emits = defineEmits(['update:modelValue'])
const value = ref(props.modelValue?props.modelValue+'小时':'')

watch(() => props.formData[props.params], () => { calculateTime() })
watch(() => props.formData[props.params2], () => { calculateTime() })

const calculateTime =async () => {
  if(props.readonly){
    return
  }
  let val = ''
  if (props.formData[props.params] && props.formData[props.params2]) {
    const params = {
      businessType:businessType,
      staffId:props.formData.sponsorId,
      postStartTime:props.formData[props.params],
      postEndTime:props.formData[props.params2]
    }
    const res = await leavePostDuration(params)
    val = res ?? ''
  }
  if (!val) {
    value.value = ''
  } else {
    value.value = val + '小时';
  }
  emits('update:modelValue', val);
}
</script>