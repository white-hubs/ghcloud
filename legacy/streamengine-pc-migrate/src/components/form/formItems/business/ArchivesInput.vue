<template>
  <div>
    <a-input disabled v-model:value="value" :placeholder="placeholder" v-if="!props.readonly" />
    <span v-else>{{ value ?? '--' }}</span>
  </div>
</template>
<script setup lang="ts">
import { getStaffInfo } from '@/api/staff'
import { ProcessType } from '@/typings/process'
import { computed, inject, onMounted, ref, watch } from 'vue'
const genderIds=['MALE','FEMALE','NONE']
const processType = inject("processType");

const props = withDefaults(defineProps<{
  modelValue?: { id: string, name: string } | null
  placeholder?: string
  config: any;
  formData: { [key: string]: any };
  params?: string;
  readonly:boolean;
}>(), {
  modelValue: null,
  placeholder: "自动填充",
})
const emits = defineEmits(['update:modelValue','clearValidate'])
const value = ref(props.modelValue ? props.modelValue.name : '')

const associationId = computed(() => {
  let id = ''
  if(props.params&&props.formData[props.params]){
    const staff=props.formData[props.params]
    try {
      id=Array.isArray(staff)?staff[0].id:staff.id
    } catch (error) {
      
    }
  }
  return id
})

//管理表单其他组件的id
watch(()=>associationId.value, (n, o) => {
  if(genderIds.includes(n)) return;
  getData(n)
})

const getData = async (data?: string) => {
  emits('clearValidate')
  let id = data ? data : (props.formData?.sponsorId ?? "")
  getStaffInfo({ attr: props.config.attr?props.config.attr:'name', id: id }).then(res => {
    value.value = res.name;
    if(res.name){
      emits('update:modelValue', { name: value.value, id: res.id??'' })
    }else{
      emits('update:modelValue', null)
    }
  })
}
onMounted(() => {
  if (processType === ProcessType.ADD) {
    getData()
  }
})

</script>
