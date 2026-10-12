<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker" :label="label" @click="showPicker = true" placeholder="请选择"
    :error-message="errorMessage" />
  <VanPopup v-model:show="showPicker" position="bottom">
    <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { PickerOption } from "vant";
import { computed, onMounted, ref, watch } from "vue";
import bus from "../../../infrastructure/bus";

const props = defineProps<{
	required?: boolean;
	readonly?: boolean;
	label?: string;
	modelValue?: { id: string; name: string };
  dependFormValues: any[];
}>();
const columns = ref([
  { value: 'ACTIVE', text: '处理中' },
  { value: 'FINISHED', text: '已完成' },
]);
const showPicker = ref(false);
const selected = ref();
const emits = defineEmits(["update:modelValue"]);

const validInput = ref(true);
const errorMessage = computed(() => {
	return !validInput.value && props.required ? `请选择${props.label}` : "";
});

function hidePicker() {
	showPicker.value = false;
}

function confirmPicker(selectedOptions: PickerOption[]) {
	selected.value = {id: selectedOptions[0].value, name: selectedOptions[0].text};
	emits("update:modelValue", selected.value);
  bus.emit('CHANGE_NUMBER_INPUT',selected.value.id==='FINISHED'?100:0)
	hidePicker();
}

onMounted(async () => {
	if (props.modelValue) {
		selected.value = props.modelValue;
	}
});

watch(() => props.dependFormValues, () => {
  if(props.readonly){
    return
  }
  let numberValue = props.dependFormValues[0] ?? null
  if(numberValue === null){
    return
  }
  const index = parseInt(numberValue) >= 100 ? 1 : 0
  selected.value = {id: columns.value[index].value, name: columns.value[index].text};
  emits("update:modelValue", selected.value);
})

defineExpose<FormItemExpose>({
	validate: () => {
		const valid = !!selected.value;
		validInput.value = valid;
		return valid;
	},
});
</script>
