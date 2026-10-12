<template>
  <div>
    <a-input disabled v-model:value="value" :placeholder="placeholder" v-if="!props.readonly"/>
    <span v-else>{{ value ?? '--' }}</span>
  </div>
</template>
<script setup lang="ts">
import { getStaffDetail } from '@/api/staff'
import { ProcessType } from '@/typings/process'
import { computed, inject, onMounted, ref, watch } from 'vue'
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
const emits = defineEmits(['update:modelValue'])
const value = ref(props.modelValue ? props.modelValue.name : '')

const associationId = computed(() => {
  let id = (props.params&&props.formData[props.params]) ? props.formData[props.params].id : ""
  return id
})

//管理表单其他组件的id
watch(associationId, (n, o) => {
  getData(n)
})

const getData = async (data?: string) => {
  let id = data ? data : (props.formData?.sponsorId ?? "")
  if(!id&&sessionStorage.getItem('GH-UserInfo')){ //尝试从缓存中获取信息
    const userInfo=JSON.parse(sessionStorage.getItem('GH-UserInfo')!)
    id=userInfo.id
  }
  if(id){
    getStaffDetail({ id: id }).then(res => {
      value.value = res.name;
      emits('update:modelValue', { name: value.value, id: res.id })
    })
  }
}
onMounted(() => {
  if (processType === ProcessType.ADD) {
    getData()
  }
})

</script>
