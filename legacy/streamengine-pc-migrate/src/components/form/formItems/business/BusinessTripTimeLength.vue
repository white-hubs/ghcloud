<template>
  <div>
    <a-input  v-model:value="value" @input="valueChange" :placeholder="placeholder" suffix="小时" v-if="!props.readonly"/>
    <span v-else>{{ props.modelValue?`${props.modelValue}小时`:'--' }}</span>
  </div>
</template>
<script setup lang="ts">
import { awayBusinessDuration } from '@/api/attendance'
import { ref, watch } from 'vue';

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
const value = ref(props.modelValue?props.modelValue:'')

watch(() => props.formData[props.params], () => { calculateTime() })
watch(() => props.formData[props.params2], () => { calculateTime() })

/**
 * 计算时间差并更新值
 */
const calculateTime =async () => {
  if(props.readonly){
    return
  }
  let val = ''
  if (props.formData[props.params] && props.formData[props.params2]) {
    const params = {
      staffId:props.formData.sponsorId,
      startTime:props.formData[props.params],
      endTime:props.formData[props.params2]
    }
    const res = await awayBusinessDuration(params)
    val = res ?? ''
  }
  if (!val) {
    value.value = ''
  } else {
    value.value = val ;
  }
  emits('update:modelValue', val);
}

/**
 * 处理输入变化，允许输入数字和小数点
 */
const valueChange = (e: any) => {
  // 使用正则表达式过滤非数字和小数点字符
  const numericValue = e.target.value.replace(/[^0-9.]/g, '')
  // 确保只有一个小数点
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    value.value = parts[0] + '.' + parts.slice(1).join('')
  } else {
    value.value = numericValue
  }
  emits('update:modelValue', value.value);
}
</script>