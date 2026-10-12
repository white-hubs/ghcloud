<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择对象类型" :disabled="readonly" v-if="!props.readonly">
      <a-select-option :value="item.value" v-for="(item, i) in options" :key="i">
        {{ item.label }}
      </a-select-option>
    </a-select>
    <span v-else>{{ options.find(e=>e.value===props.modelValue)?.label || '--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { getApplicationList } from '@/api/ouaa'
import { inject, onMounted, ref } from 'vue'

const businessType = inject("businessType") as string;
const props = withDefaults(defineProps<{
  modelValue?: string | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

// DEVICE("设备"),
// STALL("档位"),
// PROPERTY("资产"),
// SITE_POINT("现场点"),

const options = ref([
  {label:'设备',value:'DEVICE',applicationCode:"DEVICECENTER"},
  {label:'资产',value:'PROPERTY',applicationCode:"PROPERTY_MANAGEMENT"},
  {label:'档位',value:'STALL',applicationCode:"DWGL"},
  {label:'现场点',value:'SITE_POINT',applicationCode:"INSPECTION"},
  {label:'小散工程',value:'SMALL_ENGINEERING',applicationCode:"SMALLENFINEERING"},
  {label:'巡更点',value:'PATROL_POINT',applicationCode:"ELECTRONIC_PATROL"},
  {label:'风险源',value:'RISK_SOURCE',applicationCode:"RISK_SOURCE"},
]);

const value = ref(props.modelValue)
const emits = defineEmits(['update:modelValue'])

const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.value === val);
  emits('update:modelValue', options.value[index].value)
};

onMounted(async () => {
  const res = await getApplicationList()
  options.value=options.value.filter(e=>res.find((ele: { code: string })=>ele.code===e.applicationCode))
  
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
