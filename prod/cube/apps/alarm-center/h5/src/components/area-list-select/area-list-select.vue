<template>
  <VanPopup v-model:show="props.showPicker" round position="bottom">
    <VanNavBar class="nav" title="区域选择" left-text="清空" right-text="确认" @click-left="cancel" @click-right="confirm" />
    <VanCascader :options="options" :field-names="cascaderFieldNames" @change="onChange"
      :show-header="false" v-model="cascaderValue" />
  </VanPopup>
</template>

<script setup lang="ts">
import { cubeMdataService } from "../../api/server";
import type { CascaderOption } from "vant";
import { computed, onMounted, reactive, ref } from "vue";

const props = withDefaults(
	defineProps<{
    showPicker:boolean;
		modelValue?: { id: string[], name: string } | null;
		fieldNames?: { label: string, value: string, children: string }
	}>(),
	{
		modelValue: null,
		fieldNames: () => ({ label: 'name', value: 'id', children: 'children' }),
    showPicker:false
	}
);
const emit = defineEmits<{
	(e: "update:modelValue", value: { id: string[], name: string } | null): void;
	(e: "update:showPicker", value: boolean): void;
}>();

const cascaderValue = ref('')
const state = reactive<{
	cascaderValue: string;
	selected: string;
	value: { id: string[], name: string } | null;
}>({
	selected: '',
	cascaderValue: '',
	value: null,
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

	let res:{
    id: string;
    name: string;
    children?: unknown[] | undefined;
}[] = []
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

const confirm = () => {
	emit('update:modelValue', state.value)
	emit('update:showPicker', false)
}
const cancel = () => {
	emit('update:showPicker', false)
	state.selected = ''
	cascaderValue.value=''
	emit('update:modelValue', null)
}

onMounted(async ()=>{
  const res = await cubeMdataService.getAreaTree()
  for (const iterator of res) {
			removeNullChild(iterator)
		}
		options.value=res as unknown as CascaderOption[]
})

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
</script>

<style scoped></style>
