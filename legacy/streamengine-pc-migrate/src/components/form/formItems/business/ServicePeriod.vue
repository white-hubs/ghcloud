<template>
  <span v-if="props.readonly">
    {{ value.radioValue === 'limited' ? `有期限${value.date ? '：' + value.date : ''}` : value.radioValue === 'unlimited' ? '无期限' : '--' }}
  </span>
  <a-radio-group v-else @change="handleChange" v-model:value="value.radioValue">
    <a-radio value="limited">
      <div class="radio-content">
        <span>有期限</span>
        <div class="date-picker" v-if="value.radioValue === 'limited'">
          <a-date-picker valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" @change="handleChange" allowClear v-model:value="value.date" />
        </div>
      </div>
    </a-radio>
    <a-radio value="unlimited">无期限</a-radio>
  </a-radio-group>
</template>
<script lang="ts" setup>
import { onMounted, ref, nextTick, onBeforeMount } from 'vue'
import {cubePersonnelManagementService} from '@/api/service'
import type {PersonCategory} from '@ghcloud/cube-personnel-management-service'
interface ModelValue {
  radioValue: string,
  date: string,
}
const props = withDefaults(defineProps<{
  modelValue?: ModelValue | null;
  placeholder?: string;
  readonly?:boolean;
  params: string;
  formData: any;
}>(), {
  modelValue: null,
  placeholder: "请选择",
  options: () => { return [] },
  readonly:false
})
const validator = async () => {
  if(props.formData[props.params]==='ZCRY'){
    if(value.value.radioValue !== 'limited'){
      return Promise.reject('驻场人员必须选择有期限');
    }
    if(!value.value.date){
      return Promise.reject('请选择期限时间');
    }
  }
  return Promise.resolve();
}
const value = ref({
      radioValue:'limited',
      date: '',
    })
const emits = defineEmits(['update:modelValue'])
const options = ref<PersonCategory[]>([])
onBeforeMount(()=>{
  if(props.modelValue){
          value.value = props.modelValue
      }
})
onMounted(()=>{
  getOptions()
})
const getOptions = async () => {
  const res = await cubePersonnelManagementService.getPersonnelCategoryListAll()
  options.value = res
}
const handleChange = () => {
  emits('update:modelValue', value.value)
};

defineExpose({
  validator
})
</script>
<style scoped>
.select-input {
  width: 100%;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
