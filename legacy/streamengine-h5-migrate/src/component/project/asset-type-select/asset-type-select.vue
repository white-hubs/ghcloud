<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
	<VanField is-link :required="props.required" :model-value="selected?.name" readonly
		name="picker" :label="label" @click="showPicker = true" placeholder="请选择岗位" :error-message="errorMessage" />
	<VanPopup v-model:show="showPicker" position="bottom">
		<van-cascader
			title="请选择资产类别"
			v-model="fieldValue"
			:options="columns"
			@close="showPicker = false"
			:field-names="{text: 'name',value: 'id',children: 'children',}"
			@change="onChange"
			:closeable="false"
		>
			<template #title>
				<div class="cascader-header">
					<span class="van-picker__cancel" @click="showPicker=false">取消</span>
					<span class="van-picker__confirm" @click="confirmPicker">确认</span>
				</div>
			</template>
		</van-cascader>
	</VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { propertyService } from '../../../service/property/property'
import { watch } from 'vue'
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
	required?: boolean;
	readonly?: boolean;
	label?: string;
	modelValue?: { id: string; name: string };
	options:unknown[]
}>();
const columns = ref();
const fieldValue = ref(props.modelValue?.id ?? '')
const showPicker = ref(false);
const selected = ref();
const selectCascader= ref();
const emits = defineEmits(["update:modelValue"]);

const validInput = ref(true);
const errorMessage = computed(() => {
	return !validInput.value && props.required ? `请选择${props.label}` : "";
});

function hidePicker() {
	showPicker.value = false;
}

function onChange(data:{selectedOptions: {id:string,name:string}[]}){
	const id= data.selectedOptions[data.selectedOptions.length-1].id
	const name= data.selectedOptions[data.selectedOptions.length-1].name
	selectCascader.value={id,name}
}

function confirmPicker() {
	selected.value=selectCascader.value
	emits("update:modelValue", selectCascader.value);
	hidePicker();
}

function removeEmptyChild(data:any){
	for (let index = 0; index < data.length; index++) {
		if(!data[index].children){
			if(data[index].children.length===0){
				data[index].children=null
			}else{
				removeEmptyChild(data[index].children)
			}
		}
	}
	return data
}

onMounted(async () => {
	if (props.modelValue) {
		selected.value = props.modelValue;
	}
  if(!props.readonly){
		propertyService.getAssemblyClassifyTree({ type: "assetType" }).then((res) => {
      columns.value = removeEmptyChild(res)
		})
  }
});

defineExpose<FormItemExpose>({
	validate: () => {
		const valid = !!selected.value;
		validInput.value = valid;
		return valid;
	},
});
</script>
<style scoped lang="less">
:deep(.van-cascader__header){
	padding: 0;
	.van-cascader__title{
		width: 100% !important;
	}
	.cascader-header{
		display: flex;
		justify-content: space-between;
		span{
			font-weight:400
		}
	}
}
:deep(.van-tabs__content){
  height: 50%;
}
</style>
