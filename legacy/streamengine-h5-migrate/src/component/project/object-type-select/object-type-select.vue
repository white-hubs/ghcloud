<template>
  <VanField
    v-if="props.readonly"
    :required="props.required"
    :label="label"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
      :label="label" @click="showPicker = true" placeholder="请选择对象类型" :error-message="errorMessage" />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
    </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { ouaaService } from '../../../service/ouaa/ouaa.'
import { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'
import bus from "../../../infrastructure/bus";
import { useRoute } from 'vue-router'

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: string;
}>()
const route=useRoute()
const columns = ref([
  {text:'设备',value:'DEVICE',applicationCode:"DEVICECENTER"},
  {text:'资产',value:'PROPERTY',applicationCode:"PROPERTY_MANAGEMENT"},
  {text:'档位',value:'STALL',applicationCode:"DWGL"},
  {text:'现场点',value:'SITE_POINT',applicationCode:"INSPECTION"},
  {text:'小散工程',value:'SMALL_ENGINEERING',applicationCode:"SMALLENFINEERING"},
  {text:'巡更点',value:'PATROL_POINT',applicationCode:"ELECTRONIC_PATROL"},
  {text:'风险源',value:'RISK_SOURCE',applicationCode:"RISK_SOURCE"},
])
const showPicker = ref(false)
const selected = ref()
const emits = defineEmits(['update:modelValue'])
function hidePicker() {
  showPicker.value = false
}

function confirmPicker(selectedOptions: PickerOption[]) {
  selected.value = {id:selectedOptions[0].value,name:selectedOptions[0].text}
  emits('update:modelValue', selected.value.id)
  hidePicker()
}

bus.on("objectSelectScan", (type): void => {
  const find = columns.value.find(e=>e.value===type)
  if(find){
    selected.value={name:find.text,id:find.value}
    emits('update:modelValue', selected.value.id)
  }
});

onMounted(async () => {
  const res = await ouaaService.getApplicationList()
  columns.value = columns.value.filter(e=>res.find(ele=>ele.code===e.applicationCode))

  //从链接获取对象类型做初始化
  if(route.query.entity){
    const entity=JSON.parse(route.query.entity as string)??{}
    const curretnType=columns.value.find(x=>x.value===entity.entityType)
    curretnType&&confirmPicker([curretnType] as PickerOption[])
  }

  if (props.modelValue) {
    const find = columns.value.find(e=>e.value===props.modelValue)
    selected.value = {id:find?.value,name:find?.text}
  }
})

const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})

const validInput = ref(true)
defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id
    validInput.value = valid
    return !!selected.value
  }
})
</script>
