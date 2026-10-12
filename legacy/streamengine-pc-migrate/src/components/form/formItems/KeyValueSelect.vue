<template>
  <span v-if="props.readonly">{{ options.find(item => item.value === value)?.label || '--' }}</span>
  <a-select v-else ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input" :placeholder="props.placeholder">
    <a-select-option :value="item.value" v-for="item in options">{{ item.label }}</a-select-option>
  </a-select>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
	defineProps<{
		options: { label: string; value: any }[];
		modelValue: any;
		valueKey: string;
		labelKey: string;
		placeholder?: string;
    readonly?:boolean
	}>(),
	{
		valueKey: "value",
		labelKey: "label",
		options: () => [],
		placeholder: "请选择",
	}
);

const options = computed(() => {
	return props.options.map((e: any) => {
		const item: { label: string; value: string } = {
			label: "",
			value: "",
		};
		item.label = e[props.labelKey] ?? "";
		item.value = e[props.valueKey] ?? "";
		return item;
	});
});

const value = ref(props.modelValue ?? null);
const emits = defineEmits(["update:modelValue"]);
const handleChange = (val: string) => {
	emits("update:modelValue", val);
};
</script>
