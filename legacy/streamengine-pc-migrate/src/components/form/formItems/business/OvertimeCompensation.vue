<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择加班补偿" :disabled="props.readonly" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?.name ?? '--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { getWorkOvertimeCompensation } from '@/api/attendance';
import eventBus from '@/utils/event-bus';
import { onMounted, ref,inject, onUnmounted, nextTick } from 'vue';
type CommonType = {
  id: string;
  name: string;
}

const props = withDefaults(defineProps<{
  modelValue?: CommonType | null;
  readonly?: boolean;
  formData: any;
  params: string;
}>(), {
  modelValue: null,
  readonly: false,
})
const processId = inject('processId') as string
const options = ref<CommonType[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])
const params=ref(props.params)

const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

const getData = async () => {
  const query = {
    workOvertimeType: props.formData[params.value??''],
    processInstanceId: processId
  }
  const res = await getWorkOvertimeCompensation(query)
  options.value = res
  if (options.value.length === 1&&value.value==='') {
    value.value = options.value[0].id
    handleChange(options.value[0].id)
  }
}
eventBus.on('overTimeChange',(value:any)=>{
  if(value.name==='overTimeType'){
    params.value=value.id
    nextTick(()=>{
      getData();
    })
  }
})
onMounted(async () => {
  if (props.modelValue) {
    options.value = [props.modelValue]
    value.value = props.modelValue.id
  }
})
onUnmounted(()=>{
  eventBus.off('overTimeChange')
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
