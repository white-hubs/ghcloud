<template>
  <a-range-picker :showTime="props.format.includes('HH')" :placeholder="placeholder" @change="change" v-model:value="value"
    :format="antFormat" :valueFormat="antFormat" :disabled="readonly" v-if="!props.readonly"/>
  <span v-else>{{props.modelValue? props.modelValue?.join(' - '):'--' }}</span>
</template>
<script setup lang="ts">
import eventBus from '@/utils/event-bus'
import { cubeParkingLotService } from '@/api/service'
import { computed, nextTick, onMounted, ref, watch } from 'vue';
const props = withDefaults(defineProps<{
  modelValue?: [string, string] | null;
  placeholder?: string;
  config:{id:string}
  format: string;
  readonly?:boolean;
  params: string;
  allFormData: any;
}>(), {
  modelValue: null,
  placeholder: "请选择",
  readonly:false
})
const emits = defineEmits(['update:modelValue'])

const value = ref(props.modelValue ? props.modelValue : [null, null])
const index = ref(0)

const antFormat = computed(() => {
  return props.format.replace('yyyy', 'YYYY').replace('dd', 'DD')
})

// 解析关联参数
const paramsInfo = computed(() => {
  if (!props.params) return null;
  // 如果包含 '>'，说明是 GroupList 内的组件
  if (props.params.includes('>')) {
    const [parentId, childId] = props.params.split('>');
    return {
      isNested: true,
      parentField: parentId,
      childField: childId
    };
  } else {
    // 普通组件
    return {
      isNested: false,
      parentField: '',
      childField: props.params
    };
  }
});

onMounted(()=>{
  eventBus.emit('overTimeChange',{id:props.config.id,name:'dateTime',readonly:props.readonly})
  if(paramsInfo.value?.isNested){
    index.value = props.allFormData?.[paramsInfo.value.parentField]?.length-1
  }
})

// 监听关联参数变化
watch(
  () => {
    // 根据是否嵌套在 GroupList 中使用不同的监听路径
    if (paramsInfo.value?.isNested) {
      return props.allFormData?.[paramsInfo.value.parentField]?.[index.value]?.[paramsInfo.value.childField];
    } else if (paramsInfo.value) {
      return props.allFormData?.[paramsInfo.value.childField];
    }
    return null;
  },
  (newVal) => {
    if (newVal) {
      getData(newVal)
    }
  }
);

const getData = async (vechicleNo: string) => {
  try {
    const data = await cubeParkingLotService.getVehicleNumberTime(vechicleNo)
    nextTick(()=>{
      if (data.begin && data.end) {
        // 转换为时间格式
        const begin = (new Date(data.begin)).toLocaleString()
        const end = (new Date(data.end)).toLocaleString()
        value.value = [begin, end]
      } else {
        value.value = [null, null]
      }
      emits('update:modelValue', value.value)
    })
  } catch (error) {
  }
};

const change = () => {
  emits('update:modelValue', value.value)
  eventBus.emit('overTimeChange',{id:props.config.id,name:'dateTime',readonly:props.readonly})
}
</script>