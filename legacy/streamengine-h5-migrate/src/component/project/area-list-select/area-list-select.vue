<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="state.fieldText"
    readonly />
  <template v-else>
	<VanField is-link readonly :label="props.label" :required="props.required"
		:model-value="state.fieldText" :error-message="props.errorMessage" @click="pick" :placeholder="props.placeholder"
		clearable @clear="emit('update:modelValue', null)" />

	<VanPopup v-model:show="state.showPicker" round position="bottom">
		<VanNavBar class="nav" title="区域选择" left-text="清空" right-text="确认" @click-left="cancel" @click-right="comfirm" />
		<VanCascader :title="props.label" :options="options" :field-names="cascaderFieldNames" @change="onChange"
			:show-header="false" v-model="cascaderValue"/>
	</VanPopup>
  </template>
</template>

<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { propertyService } from "../../../service/property/property";
import { CascaderOption } from "vant";
import { computed, onMounted, reactive, ref } from "vue";

const props = withDefaults(
	defineProps<{
		label?: string;
		required?: boolean;
		modelValue?: { id: string[], name: string } | null;
		errorMessage?: string;
		placeholder?: string;
		readonly?: boolean;
		fieldNames?: { label: string, value: string, children: string }
		api:string;
	}>(),
	{
		modelValue: null,
		placeholder: "请选择区域",
		fieldNames: () => ({ label: 'name', value: 'id', children: 'children' }),
		api:'',
	}
);
const emit = defineEmits<{
	(e: "update:modelValue", value: { id: string[], name: string } | null): void;
}>();

const cascaderValue = ref('')
const state = reactive<{
	showPicker: boolean;
	cascaderValue: string;
	selected: string;
	value: { id: string[], name: string } | null;
	fieldText: string;
}>({
	showPicker: false,
	selected: '',
	cascaderValue: '',
	value: null,
	fieldText: "",
});

const options = ref<CascaderOption[]>([])

const cascaderFieldNames = computed(() => {
	return {
		text: props.fieldNames.label,
		value: props.fieldNames.value,
		children: props.fieldNames.children,
	};
})

const onChange = ({ selectedOptions }: { selectedOptions: Record<string, unknown>[] }) => {
	const val = selectedOptions.map(e => {
		return e[props.fieldNames.value] as string
	})

	let res = []
	let _options: { id: string; name: string; children?: unknown[] }[] | { [x: string]: any; }[] = [];
	for (let index = 0; index < val.length; index++) {
		if (index == 0) {
			_options = options.value ?? []
		}
		if (_options.length === 0) {
			break;
		}

		const id = val[index];
		const findIndex: number = _options.findIndex((e: { [x: string]: any; }) => e.id === id)
		if (findIndex === -1) {
			break;
		}
		res.push(_options[findIndex].name)
		_options = _options[findIndex].children ?? []
	}

	state.value = {
		id: val,
		name: res.join('/')
	}
	state.selected = selectedOptions.map(e => { return e[props.fieldNames.label] as string }).join('/')
};

const comfirm = () => {
	state.showPicker = false
	state.fieldText = state.selected
	emit('update:modelValue', state.value)
}
const cancel = () => {
	state.showPicker = false
	state.selected = ''
	state.fieldText = ''
	cascaderValue.value=''
	emit('update:modelValue', null)
}

defineExpose<FormItemExpose>({
	validate: () => !!props.modelValue,
});

onMounted(async () => {
	if (props.modelValue) {
		state.selected = props.modelValue.name
		state.fieldText = props.modelValue.name
		cascaderValue.value=props.modelValue.id?.at(-1)??''
	}
	if (!props.readonly) {
		const api=props.api!==''?props.api:'/mdata/area/list'
		const res = await propertyService.getAreaList(api);
		for (const iterator of res) {
			removeNullChild(iterator)
		}
		options.value=res as unknown as CascaderOption[]
	}
});

function removeNullChild(option: Record<string, any>) {
	if (option['children']) {
		if (option['children'].length === 0) {
			delete option['children']
		} else {
			for (const iterator of option['children']) {
				removeNullChild(iterator)
			}
		}
	}
}
function pick() {
	state.showPicker = true;
}
</script>

<style scoped></style>
