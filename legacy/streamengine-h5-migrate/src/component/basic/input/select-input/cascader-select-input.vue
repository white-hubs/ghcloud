<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="state.selected"
    readonly />
  <template v-else>
	<VanField is-link readonly :label="props.label" :required="props.required"
		:model-value="state.selected" :error-message="props.errorMessage" @click="pick" :placeholder="props.placeholder"
		clearable @clear="emit('update:modelValue', [])" />

	<VanPopup v-model:show="state.showPicker" round position="bottom">
		<VanCascader :title="props.label" :options="cascaderFieldOptions" :field-names="cascaderFieldNames"
			@close="state.showPicker = false" @finish="onFinish" />
	</VanPopup>
  </template>
</template>

<script setup lang="ts">
import { FormItemExpose } from "../../../../business/dynamic-table/form-item";
import { CascaderOption } from "vant";
import { computed, onMounted, reactive, ref, watch } from "vue";

const props = withDefaults(
	defineProps<{
		options: Record<string, any>[];
		label?: string;
		required?: boolean;
		modelValue?: string[];
		errorMessage?: string;
		placeholder?: string;
		readonly?: boolean;
		fieldNames?: { label: string, value: string, children: string }
	}>(),
	{
		modelValue:()=>[],
		placeholder: "请选择选项",
		fieldNames: () => ({ label: 'label', value: 'value', children: 'children' })
	}
);
const emit = defineEmits<{
	(e: "update:modelValue", value: string[]): void;
}>();
const state = reactive<{
	showPicker: boolean;
	selected: string;
	cascaderValue: string;
}>({
	showPicker: false,
	selected: '',
	cascaderValue: ''
});

const cascaderFieldOptions = computed(() => {
	const removeNullChild = (option: Record<string, any>) => {
		if (option[props.fieldNames.children]) {
			if (option[props.fieldNames.children].length === 0) {
				delete option[props.fieldNames.children]
			} else {
				for (const iterator of option[props.fieldNames.children]) {
					removeNullChild(iterator)
				}
			}
		}
	}
	const options = props.options
	for (const iterator of options) {
		removeNullChild(iterator)
	}
	return options
})
const cascaderFieldNames = computed(() => {
	return {
		text: props.fieldNames.label,
		value: props.fieldNames.value,
		children: props.fieldNames.children,
	};
})

// 全部选项选择完毕后，会触发 finish 事件
const onFinish = ({ selectedOptions }: { selectedOptions: Record<string, unknown>[] }) => {
	state.showPicker = false
	const value = selectedOptions.map(e => {
		return e[props.fieldNames.value] as string
	})
	state.selected = selectedOptions.map(e => { return e[props.fieldNames.label] as string }).join('/')
	emit("update:modelValue", value)
};

defineExpose<FormItemExpose>({
	validate: () => props.modelValue?.length>0,
});

onMounted(() => {
	if (props.modelValue) {
		let res=[]
		const labelKey=props.fieldNames.label
		const valueKey=props.fieldNames.value
		const childKey=props.fieldNames.children
		let options: Record<string, any>[]=[];
		for (let index = 0; index < props.modelValue.length; index++) {
			if(index==0){
				options=props.options??[]
			}
			if(options.length===0){
				break;
			}
			
			const id = props.modelValue[index];
			const findIndex:number= options.findIndex((e: { [x: string]: any; })=>e[valueKey]===id)
			if(findIndex===-1){
				break;
			}
			res.push(options[findIndex][labelKey])
			options=options[findIndex][childKey]??[]
		}

		state.selected=res.join('/') ||'--'
	}
});
function pick() {
	state.showPicker = true;
}
</script>

<style scoped></style>
