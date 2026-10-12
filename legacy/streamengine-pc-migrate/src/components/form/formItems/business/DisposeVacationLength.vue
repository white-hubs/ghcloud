<template>
  <div>
    <a-input v-model:value="value" :placeholder="placeholder" :min="0" v-if="!props.readonly" @change="emits('update:modelValue', value)"/>
    <span v-else>{{ value?value+'小时':'--' }}</span>
  </div>
</template>
<script setup lang="ts">
import { getVacationDuration } from '@/api/attendance'
import { inject, onMounted, ref, watch } from 'vue'

const businessType =inject('businessType') as string;
const props = withDefaults(defineProps<{
  modelValue?: any | null;
  placeholder?: string;
  readonly?: boolean;
  config: any;
  params: string;
  params2: string;
  formData: any
}>(), {
  modelValue: null,
  placeholder: "系统自动计算",
  readonly: false
})
const emits = defineEmits(['update:modelValue','clearValidate'])

watch(
  () => props.formData[props.params],
  () => {
    getData();
  }
);
watch(
  () => props.formData[props.params2],
  () => {
    getData();
  }
);

const getData = async () => {
  if ((!props.formData[props.params2] || props.formData[props.params2].length === 0) || !props.formData[props.params]) {
    value.value = ''
    emits('update:modelValue', null)
    return
  };

  try {
    const params = {
      businessType:businessType,
      staffId:props.formData.sponsorId,
      holidayRuleId: props.formData[props.params].holidayRuleId ?? '',
      period: `${props.formData[props.params2][0]},${props.formData[props.params2][1]}`
    }
    getVacationDuration(params).then(res => {
      emits('update:modelValue', res)
      value.value = res;
    })
  } catch (error) {
  }
};

onMounted(()=>{
  if(props.modelValue&&props.readonly){
    value.value = props.modelValue;
  }
})

const value = ref(props.modelValue)
</script>