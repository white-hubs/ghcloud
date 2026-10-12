<template>
	<TableBase :model-value="value" :readonly="true" :label="props.config.title" :columns="columns">
		<template #header-btn>
			<a-button type="primary" shape="round" v-if="!props.readonly" @click="orgPickerRef.show()">选择资产</a-button>
		</template>
		<template #bodyCell="{ column, record }">
			<template v-if="column.dataIndex==='operation'&&!props.readonly">
				<a-button type="link" danger @click="del(record)">删除</a-button>
			</template>
		</template>
	</TableBase>
	<OrgPicker title="资产" :url="'getPropertyDetailedPage'" :columns="dialogTableColumns" ref="orgPickerRef"
		:activeId="activeId" @close="selected" :selectionType="'checkbox'" :search-params="searchParams" :search="search"
		width="1200px" />
</template>
<script setup lang="ts">
import { PropertyDetailedParam } from "@/domain/property";
import { computed, inject, onMounted, ref, watch } from "vue";
import TableBase from "./TableBase.vue";
import OrgPicker from "./OrgPicker.vue";
import dayjs from "dayjs";
import { getAssemblyClassify } from "@/api/property/index";
const businessType =inject('businessType') as string;
const props = withDefaults(
	defineProps<{
		modelValue?: any[] | null;
		placeholder?: string;
		readonly?: boolean;
		config?: any;
		formData: any;
  	params: string
	}>(),
	{
		modelValue: null,
		readonly: false,
	}
);
const emits = defineEmits(["update:modelValue",'clearValidate']);

//表格列配置
const columns = ref<any[]>([
	{
		title: "序号",
		dataIndex: "key",
		align: "center",
		customRender: ({ index }: any): string => {
			return index + 1;
		},
	},
	{
		title: "资产编码",
		dataIndex: "serialNumber",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入资产编码",
		},
	},
  {
		title: "财务编码",
		dataIndex: "financeNumber",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入财务编码",
		},
	},
	{
		title: "资产名称",
		dataIndex: "name",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入资产名称",
		},
	},
	{
		title: "资产类别",
		dataIndex: "typeName",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请选择资产类别",
			valueKey: "id",
			labelKey: "name",
		},
	},
	{
		title: "管理员",
		dataIndex: "adminName",
		align: "center",
		name: "TextInput",
		props: {
			multiple: false,
			placeholder: "",
		},
	},
	{
		title: "购入日期",
		dataIndex: "purchaseDate",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请选择购入日期",
		},
    customRender: ({ text }: any): string => {
			return text ? dayjs(text).format('YYYY-MM-DD'):'--'
		},
	},
	{
		title: "原值",
		dataIndex: "price",
		align: "center",
		name: "AmountInput",
		props: {
			maxlength:10,
			placeholder: "请输入原值",
		},
	},
	{
		title: "规格型号",
		dataIndex: "norms",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入规格型号",
		},
	},
	{
		title: "计量单位",
		dataIndex: "unit",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入计量单位",
		},
	},
	{
		title: "数量",
		dataIndex: "number",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入数量",
			minNum: "0",
		},
	}
]);

//弹窗表格列配置
const search=ref([
	{
    label:'资产类别',
    placeholder:"请选择",
		component:'a-select',
		options:[],
    value:'typeId'
  },
  {
    label:'',
    placeholder:"资产编码、资产名称",
    value:'keyword'
  }
])
const dialogTableColumns=columns.value.map(e=>{
	if(e.dataIndex!=='key'&&!e.customRender){
		e.customRender=({ text }:{text:string}) => {return text ||'--'}
	}
	return e
})
const assetStatus: { label: string; value: string; }[] = [
  { label: '闲置', value: 'LEAVE_UNUSED' },
  { label: '在用', value: 'MAKE_USE_OF' },
  { label: '报废', value: 'WEED_OUT' }
]
dialogTableColumns.splice(4, 0, {
	title: "状态",
	dataIndex: "status",
	align: "center",
	customRender: ({ text }:{text:string}) => {return assetStatus.find(e=>e.value===text)?.label ||'--'}
});
const searchParams=computed(()=>{
	const res=[{
		key:'businessType',value:businessType
	}]
	if(props.formData[props.params]){
		res.push({
			key:'receiveDepId',value:props.formData[props.params][0].id
		})
	}
	return res
})


const value = ref(props.modelValue ?? []);
const del = (record: PropertyDetailedParam) => {
	value.value = value.value.filter((item) => item.id !== record.id);
	activeId.value = value.value.map((item: {id:string}) => {
		return item.id;
	})
};

watch(
	() => value.value,
	() => {
		emits("update:modelValue", value.value);
	},
	{ deep: true }
);

onMounted(() => {
	if(!props.readonly){
		columns.value.push({
			title: "操作",
			dataIndex: "operation",
		})

		// 资产分类
		getAssemblyClassify({ type: "assetType" }).then((res) => {
			search.value[0].options= res.records.map((e: { name: any; id: any; })=>{
				return {label:e.name,value:e.id}
			})
		})
	}
});

//弹窗相关
const orgPickerRef = ref()
const activeId = ref<any[]>([]);
const selected = (values: any) => {
	if (values) {
    value.value=values
		emits('update:modelValue', values)
		emits('clearValidate')
		activeId.value = values.map((item: any) => {
		  return item.id;
		})
	}
};

const validator = async () => {
	if (value.value.length === 0) {
		return Promise.reject("请至少添加一组数据");
	}
	return Promise.resolve();
};
//对外暴露验证方法
defineExpose({
	validator,
});
</script>
<style scoped lang="less"></style>
