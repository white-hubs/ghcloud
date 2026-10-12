<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="state.selected?.text"
    readonly />
  <template v-else>
	<VanField is-link readonly :label="props.label" :required="props.required" 
		:model-value="state.selected?.text" :error-message="props.errorMessage" @click="pick" :placeholder="props.placeholder" 
		clearable @clear="emit('update:modelValue', '')" 
	/>
	<VanPopup v-model:show="state.showPicker" round position="bottom">
		<VanPicker :columns="columns" @cancel="cancelPick" @confirm="confirmPick($event.selectedOptions[0])" cancel-button-text="清空" />
	</VanPopup>
  </template>
</template>

<script setup lang="ts">
import { FormItemExpose } from "../../../../business/dynamic-table/form-item";
import { PickerOption } from "vant";
import { computed, onMounted, reactive, watch } from "vue";

const props = withDefaults(
	defineProps<{
		options: Record<string, any>[];
		label?: string;
		required?: boolean;
		modelValue?: string;
		errorMessage?: string;
		placeholder?: string;
		readonly?: boolean;
		valueKey: string;
		labelKey: string;
	}>(),
	{
		placeholder: "请选择选项",
	}
);
const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
}>();
const state = reactive<{
	showPicker: boolean;
	selected?: PickerOption;
}>({
	showPicker: false,
});
const getOptionsByProps = () => {
	return props.options.map((e: any) => {
		const item: { text: string; value: string } = {
			text: "",
			value: "",
		};
		item.text = e[props.labelKey] ?? "";
		item.value = e[props.valueKey] ?? "";
		return item;
	});
};
const columns = computed<PickerOption[]>(() => {
	return getOptionsByProps();
});

watch(
	() => state.selected,
	() => {
		emit("update:modelValue", state.selected ? (state.selected.value as string) : "");
	}
);
defineExpose<FormItemExpose>({
	validate: () => !!state.selected,
});

onMounted(() => {
	if (props.modelValue) {
		const options = getOptionsByProps();
		state.selected = options.find((e) => e.value === props.modelValue);
	}
});
function pick() {
	state.showPicker = true;
}
function cancelPick() {
	state.showPicker = false;
	state.selected = undefined;
}
function confirmPick(selected: PickerOption) {
	state.selected = selected;
	state.showPicker = false;
}
</script>

<style scoped></style>
