<template>
  <div v-if="!props.readonly">
      <a-input 
        style="margin-bottom: 10px;"
        addon-before="姓名:"
        v-model="contact.name" 
        :placeholder="placeholder" 
        @change="changeName"
        :disabled="readonly" 
        :precision="props.precision" 
      />
      <a-input 
        addon-before="电话:"
        v-model="contact.tel" 
        :placeholder="placeholder" 
       @change="changeTel"
        :disabled="readonly"
        maxlength="11"
        :precision="props.precision" 
      />
  </div>
  <div style="margin-top: 5px;" v-else>
    <p>姓名：{{ contact?.name ?? '--' }}</p>
    <p>电话：{{ contact?.tel ?? '--' }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: { name: string; tel: string }
  placeholder?: string
  readonly?: boolean
  maxNum?: number
  minNum?: number
  precision?:number
}>(), {
  placeholder: "请输入",
  readonly: false,
  precision:0,
  maxNum:20,
  minNum:0
})
const emits = defineEmits(['update:modelValue'])
const contact = ref(props.modelValue??{name:'',tel:''})
const changeName=(e:Event)=>{
  const target=e.target as HTMLInputElement;
  contact.value.name=target.value
  emits('update:modelValue', contact.value)
}
const changeTel=(e:Event)=>{
  const target=e.target as HTMLInputElement;
  contact.value.tel=target.value
  emits('update:modelValue', contact.value)
}

</script>
<style scoped>
</style>