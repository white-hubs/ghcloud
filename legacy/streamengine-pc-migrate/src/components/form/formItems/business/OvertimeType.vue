<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择加班类型" :disabled="readonly" v-if="!props.readonly">
      <a-select-option :value="item.value" v-for="(item, i) in options" :key="i">
        {{ item.label }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?options.find(e=>e.value===props.modelValue)?.label:'--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import eventBus from '@/utils/event-bus'
import { onMounted, ref } from 'vue';


const props = withDefaults(defineProps<{
  modelValue?: string | null;
  readonly?: boolean
  config:{id:string}
}>(), {
  modelValue: null,
  readonly: false,
})

const options = ref([{
  label: '工作日',
  value: 'WORK'
}, {
  label: '休息日',
  value: 'REST',
}, {
  label: '节假日',
  value: 'FESTIVAL',
}]);
const value = ref(props.modelValue)
const emits = defineEmits(['update:modelValue'])
onMounted(()=>{
  eventBus.emit('overTimeChange',{id:props.config.id,name:'overTimeType',readonly:props.readonly})
})


const handleChange = (val: string) => {
  emits('update:modelValue', val)
  eventBus.emit('overTimeChange',{id:props.config.id,name:'overTimeType',readonly:props.readonly})
};
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
