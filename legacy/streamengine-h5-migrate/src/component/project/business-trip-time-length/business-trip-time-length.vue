<template>
  <div>
    <VanField v-model="value" :label="props.label"  :required="props.required" :readonly="props.readonly"
      :disabled="false" placeholder="自动计算" type="number" @update:model-value="handleInput" >
     <template #button>
     <span>小时</span>
    </template>
    </VanField>
  </div>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { attendanceService } from '../../../service/attendance/attendance.service'
import { ref, watch } from 'vue';

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string; 
  modelValue?: { id: string; name: string };
  dependFormValues: any;
  sponsorId:string;
}>();
const emits = defineEmits(["update:modelValue"]);

const value = ref(props.modelValue ? props.modelValue  : '')

watch(() => props.dependFormValues, () => {
  calculateTime()
}, { deep: true })

/**
 * 计算时间差并更新值
 */
const calculateTime =async () => {
  if(props.readonly){
    return
  }
  if (props.dependFormValues[0] && props.dependFormValues[1]) {
    let val = ''
    const params = {
      staffId:props.sponsorId,
      startTime:props.dependFormValues[0],
      endTime:props.dependFormValues[1]
    }
    val = await attendanceService.awayBusinessDuration(params)
    if (!val) {
      value.value = ''
    } else {
      value.value = val ;
    }
    emits('update:modelValue', val);
  }
}

/**
 * 处理输入变化，允许输入数字和小数点
 */
const handleInput = (val: string) => {
  if (props.readonly) return;
  // 移除单位
  let numericValue = val;
  // 过滤非数字和小数点字符
  numericValue = numericValue.replace(/[^0-9.]/g, '');
  
  // 确保只有一个小数点
  const parts = numericValue.split('.');
  if (parts.length > 2) {
    numericValue = parts[0] + '.' + parts.slice(1).join('');
  }
  // 更新显示值和实际值
  value.value = numericValue ? numericValue + '' : '';
  emits('update:modelValue', numericValue);
}

defineExpose<FormItemExpose>({
  validate: () => !!value.value
})
</script>