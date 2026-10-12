<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
		:label="label" @click="showPicker = true" placeholder="请选择" :error-message="errorMessage"/>
	<VanPopup v-model:show="showPicker" position="bottom">
		<VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
	</VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { propertyService } from '../../../service/property/property';
import { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
	required?: boolean;
	readonly?: boolean;
	label?: string;
	modelValue?: { id: string, name: string };
	errorMessage?:string;
}>()
const columns = ref()
const showPicker = ref(false)
const selected = ref()
const emits = defineEmits(['update:modelValue'])
function hidePicker() {
	showPicker.value = false
}

function confirmPicker(selectedOptions: PickerOption[]) {
	selected.value = selectedOptions[0].value
	emits('update:modelValue', selected.value)
	hidePicker()
}

const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})
const validate = () => {
  const valid = !!selected.value
  validInput.value = valid
  return valid
}


onMounted(async () => {
	const res = await propertyService.getAssemblyClassify({ type: "reasonForScrapping" });
	columns.value = res.records!.map(e => {
		return { text: e.name, value: e }
	})
	if (props.modelValue) {
		selected.value = props.modelValue
	}
})

defineExpose<FormItemExpose>({
	validate
})
</script>
  