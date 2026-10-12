<template>
	<TableBase :model-value="value" :readonly="props.readonly" :label="props.config.title" :columns="columns" :row-save-validator="validateRowSerialNumber" v-if="initialized" ref="tableBaseRef">
		<template #header-btn>
			<a-button type="primary" shape="round" v-if="!props.readonly" @click="add">添加资产</a-button>
		</template>
		<template #operation="{ column, record }">
			<a-button type="link" danger @click="del(record)">删除</a-button>
		</template>
	</TableBase>
</template>
<script setup lang="ts">
import { PropertyDetailedParam } from "@/domain/property";
import { onMounted, ref, watch } from "vue";
import TableBase from "./TableBase.vue";
import { checkPropertyCode } from '@/api/property/index'
import { message } from 'ant-design-vue'; 
const props = withDefaults(
	defineProps<{
		modelValue?: any[] | null;
		placeholder?: string;
		readonly?: boolean;
		config?: any;
	}>(),
	{
		modelValue: null,
		readonly: false,
	}
);
const emits = defineEmits(["update:modelValue"]);
const initialized = ref(false);
const tableBaseRef = ref<InstanceType<typeof TableBase>>();
//表格列配置
const columns = ref<any[]>([
	{
		title: "序号",
		dataIndex: "key",
		align: "center",
		customRender: ({ index }: any): string => {
			return index + 1;
		},
		fixed: "left",
		width: 100,
	},
	{
		title: "资产编码",
		dataIndex: "serialNumber",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入资产编码",
			required: true,
			maxlength:200,
		},
		width: 200,
	},
  {
		title: "财务编码",
		dataIndex: "financeNumber",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入财务编码",
			required: true,
			maxlength:200,
		},
		width: 200,
	},
	{
		title: "资产名称",
		dataIndex: "name",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入资产名称",
			required: true,
			maxlength:20,
			onkeyup:/[^\w\u4E00-\u9FA5]/g
		},
		width: 200,
	},
	{
		title: "资产类别",
		dataIndex: "type",
		align: "center",
		name: "AssetTypeSelect",
		props: {
			placeholder: "请选择资产类别",
			required: true,
			options:[]
		},
		width: 200,
	},
	{
		title: "购入日期",
		dataIndex: "purchaseDate",
		align: "center",
		name: "DateTime",
		props: {
			placeholder: "请选择购入日期",
			required: true,
		},
		width: 200,
	},
	{
		title: "维保期限（月）",
		dataIndex: "maintenanceTime",
		align: "center",
		name: "NumberInput",
		props: {
			placeholder: "请输入维保期限（月）",
			required: true,
			minNum: "0",
			maxlength:10
		},
		width: 200,
	},
	{
		title: "使用期限（月）",
		dataIndex: "usageTime",
		align: "center",
		name: "NumberInput",
		props: {
			placeholder: "请输入使用期限（月）",
			required: true,
			minNum: "0",
			maxlength:10
		},
		width: 200,
	},
	{
		title: "规格型号",
		dataIndex: "norms",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入规格型号",
		},
		width: 200,
	},
	{
		title: "计量单位",
		dataIndex: "unit",
		align: "center",
		name: "TextInput",
		props: {
			placeholder: "请输入计量单位",
		},
		width: 200,
	},
	{
		title: "数量",
		dataIndex: "number",
		align: "center",
		name: "NumberInput",
		props: {
			placeholder: "请输入数量",
			minNum: "0",
			required: true,
			maxlength:10
		},
		width: 200,
	},
	{
		title: "原值",
		dataIndex: "price",
		align: "center",
		name: "AmountInput",
		props: {
			placeholder: "请输入原值",
			maxlength:10,
			precision:2
		},
		width: 200,
	},
	{
		title: "管理员",
		dataIndex: "adminId",
		align: "center",
		name: "UserPicker",
		props: {
			multiple: false,
			placeholder: "",
		},
		width: 200,
	},
	{
		title: "区域",
		dataIndex: "areaIds",
		align: "center",
		name: "AreaList",
		props: {
			placeholder: "请选择区域",
			fieldNames:{ label: 'name', value: 'id', children: 'children' },
		},
		width: 200,
	},
]);
const value = ref(props.modelValue ?? []);
const add = () => {
	const data: PropertyDetailedParam = {
		name: "",
		purchaseDate: "",
		typeName: "",
		key: guid(),
		flowConvertData:false
	};
	value.value.push(data);

	function guid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			let r = (Math.random() * 16) | 0,
				v = c == "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
};

const del = (record: PropertyDetailedParam) => {
	value.value = value.value.filter((item) => item.key !== record.key);
};

watch(
	() => value.value,
	() => {
		emits("update:modelValue", value.value);
	},
	{ deep: true }
);

onMounted(() => {
  initialized.value = true;
	if (!props.readonly) {
		columns.value.push({
			dataIndex: "operation",
			title: "操作",
			align: "center",
			fixed: "right",
			width: 100,
		});
	}
});

// 行保存时的资产编码验证函数
const validateRowSerialNumber = async (rowData: any, index: number): Promise<void> => {
  const serialNumber = rowData.serialNumber;
	let errorMsg = '';
  if (!serialNumber) {
    errorMsg = `请输入第${index+1}行资产编码`;
		message.error(errorMsg);
    return Promise.reject(errorMsg);
  }

  try {
    // 调用后端接口校验
    const checkParams = { checkSerialNumberList: [{key: rowData.id, value: serialNumber }] };
    const res = await checkPropertyCode(checkParams);
    if (res && Array.isArray(res) && res.includes(serialNumber)) {
			errorMsg = `第${index+1}行资产编码 ${serialNumber} 已存在`;
			message.error(errorMsg);
      return Promise.reject(errorMsg);
    }
    // 校验通过
    return Promise.resolve();
  } catch {
    // 处理 API 调用错误
    errorMsg = `第${index+1}行校验资产编码时发生错误`;
		message.error(errorMsg);
    return Promise.reject(errorMsg);
  }
};

const validator = async () => {
	if (value.value.length === 0) {
		return Promise.reject("请至少添加一组数据");
	}

	//需要校验的数据
	const requiredColumns = columns.value.filter((e) => {
		if (e.props?.required) {
			return e;
		}
	});

	for (const iterator of requiredColumns) {
		let validate = true;
		let error = "";
		for (let index = 0; index < value.value.length; index++) {
			const element = value.value[index];
			if(value.value.filter(x=>x.serialNumber===element.serialNumber).length>1){
				validate = false;
				error=`第${index + 1}行数据，资产编码重复`
				break
			}
			if (!element[iterator.dataIndex]) {
				validate = false;
				error = `第${index + 1}行数据，缺失${iterator.title}`;
				break;
			}
		}
		if (!validate) {
			return Promise.reject(error);
		}
	}

	// 调用 TableBase 组件的 checkSaveState 方法获取未保存的行索引
	const indexs = tableBaseRef.value?.checkSaveState()
	if (indexs?.length) {
		return Promise.reject(`请先保存第${indexs[0] + 1}行数据`);
	}

	return Promise.resolve();
};
//对外暴露验证方法
defineExpose({
	validator,
});
</script>
<style scoped lang="less"></style>
