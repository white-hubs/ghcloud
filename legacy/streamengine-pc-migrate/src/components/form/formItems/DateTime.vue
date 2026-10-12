<template>
  <a-date-picker :showTime="props.format.includes('HH')" :placeholder="placeholder" @change="change" v-model:value="value"
    :format="antFormat" :valueFormat="antFormat" style="width:100%" :disabled="readonly" v-if="!props.readonly"/>
  <span v-else>{{ props.modelValue ??'--' }}</span>
</template>
<script setup lang="ts">
import { ProcessType } from '@/typings/process'
import dayjs from 'dayjs'
import { computed, inject, onMounted, ref } from 'vue'
const processType = inject("processType");
const props = withDefaults(defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  format?: string;
  autoCurrentTime?: boolean;
  defaultValue?:string|null;
  readonly?:boolean;
}>(), {
  modelValue: null,
  placeholder: "请选择",
  autoCurrentTime: false,
  readonly:false,
  defaultValue:null,
  format:'yyyy-MM-dd'
})
const emits = defineEmits(['update:modelValue'])

const value = ref(props.modelValue)

const antFormat = computed(() => {
  return props.format.replace('yyyy', 'YYYY').replace('dd', 'DD')
})


const change = () => {
  emits('update:modelValue', value.value)
}

onMounted(() => {
  //自动带出时间
  if (processType === ProcessType.ADD&&props.autoCurrentTime) {
    value.value=dayjs().format(antFormat.value)
    emits('update:modelValue', value.value)
  }

  if (processType === ProcessType.ADD&&props.defaultValue) {
    value.value=dayjs(props.defaultValue).format(antFormat.value)
    emits('update:modelValue', value.value)
  }

})
</script>