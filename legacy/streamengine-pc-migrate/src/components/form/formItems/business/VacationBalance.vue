<template>
  <a-input v-model:value="value" :placeholder="placeholder" :disabled="true" v-if="!props.readonly" />
  <span v-else>{{ value ?? '--' }}</span>
</template>
<script setup lang="ts">
import { getVacationBalance } from '@/api/attendance'
import { onMounted, ref, watch,nextTick } from 'vue'
const props = withDefaults(defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  readonly?: boolean;
  params: string;
  formData: any;
}>(), {
  modelValue: null,
  placeholder: "系统自动计算",
  readonly: false
})
const emits = defineEmits(['update:modelValue'])

watch(
  () => props.formData[props.params],
  () => {
    getData();
  }
);

const getData = async () => {
  try {
    const params = {
      staffId: props.formData.sponsorId,
      holidayRuleId: props.formData[props.params].id ?? "",
      unit:"小时"
    };
    
    const res = await getVacationBalance(params);
    nextTick(()=>{
      value.value = res.total+'小时';
      if (res.notLimit) {
        value.value = '不限制';
      }
      emits("update:modelValue", res.notLimit?'-1':res.total);
    })
  } catch (error) {
  }
};

const value = ref(props.modelValue)

onMounted(() => {
  if (props.modelValue) {
    if(/[\u4e00-\u9fa5]/g.test(props.modelValue)){
      value.value = props.modelValue
      return
    }
    if (props.modelValue === 'NO_LIMITED') {
      value.value = '不限制'
    } else if (props.modelValue === 'NOT_CONFIGURED') {
      value.value = '-'
    } else if (props.modelValue === '-1') {
      value.value = '不限制';
    } else {
      value.value = props.modelValue+'小时';
    }
  }else{
    getData()
  }
})
</script>