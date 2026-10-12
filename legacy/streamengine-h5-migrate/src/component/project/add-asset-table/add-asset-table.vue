<template>
	<VanField type="text" :required="props.required" :readonly="props.readonly" class="group-list" :error-message="errorMessage" :disabled="props.readonly">
		<template #label>
			<span>{{ props.label }}</span>
			<van-button type="primary" size="mini" @click="add" class="add-group" v-if="!props.readonly">添加资产</van-button>
		</template>
		<template #input>
			<TableBase :model-value="value" :readonly="props.readonly" :columns="columns" ref="TableBaseRef" label="资产入库" :row-save-validator="validateRowSerialNumber">
				<template #card-item="{ dataItem, index }">
					<div class="card-header">
						<span class="title">{{ dataItem.name || '--' }}</span>
						<div class="field-item" style="margin-bottom: 0;">
            <span class="label" style="margin-left: 0;">资产编码</span>
							<span class="value">{{ dataItem.serialNumber || '--'}}</span>
						</div>
					</div>
					<div class="card-body">
            <div class="field-item">
              <span class="label">财务编码</span>
              <span class="value">{{ dataItem.financeNumber || '--'}}</span>
            </div>
						<div class="field-item">
							<span class="label">资产类别</span>
							<span class="value">{{ dataItem.type?dataItem.type?.name:"--" }}</span>
						</div>
						<div class="field-item">
							<span class="label">数量</span>
							<span class="value">{{ dataItem.number || '--'}}</span>
						</div>
						<div class="field-item">
							<span class="label">购入日期</span>
							<span class="value">{{ dataItem.purchaseDate || '--'}}</span>
						</div>
						<div class="field-item">
							<span class="label">管理员</span>
							<span class="value">{{ dataItem.adminId ? dataItem.adminId[0].name : "--" }}</span>
						</div>
					</div>
					<div class="card-foot van-cell--clickable" @click.stop="del(index)" v-if="!props.readonly">移除</div>
					<div class="card-foot van-cell--clickable" v-else>轻触查看详情</div>
				</template>
			</TableBase>
		</template>
	</VanField>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import TableBase from "../../../component/basic/table-base/index.vue";
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { propertyService } from "../../../service/property/property";
import { showNotify } from 'vant';
const props = withDefaults(
	defineProps<{
		modelValue?: any[] | null;
		placeholder?: string;
		readonly?: boolean;
		config?: any;
		label: string;
		required?: boolean;
		errorMessage?: string;
		disabled?:boolean;
	}>(),
	{
		modelValue: null,
		readonly: false,
	}
);
const emits = defineEmits(["update:modelValue"]);
const TableBaseRef = ref();

//表格列配置
const columns = ref<any[]>([
	{
		title: "资产编码",
		dataIndex: "serialNumber",
		name: "TextInput",
		props: {
			placeholder: "请输入资产编码",
			required: true,
			maxlength:200,
		},
	},
  {
		title: "财务编码",
		dataIndex: "financeNumber",
		name: "TextInput",
		props: {
			placeholder: "请输入财务编码",
			required: true,
			maxlength:200,
		},
	},
	{
		title: "资产名称",
		dataIndex: "name",
		name: "TextInput",
		props: {
			placeholder: "请输入资产名称",
			required: true,
			maxlength:20,
			onkeyup:/[^\w\u4E00-\u9FA5]/g
		},
	},
	{
		title: "资产类别",
		dataIndex: "type",
		name: "AssetTypeSelect",
		props: {
			placeholder: "请选择资产类别",
			required: true,
			valueKey: "id",
			labelKey: "name",
			options: [],
		},
	},
	{
		title: "购入日期",
		dataIndex: "purchaseDate",
		name: "DateTime",
		props: {
			placeholder: "请选择购入日期",
			required: true,
			format: "yyyy-MM-dd",
		},
	},
	{
		title: "维保期限（月）",
		dataIndex: "maintenanceTime",
		name: "NumberInput",
		props: {
			placeholder: "请输入维保期限（月）",
			required: true,
			minNum: "0",
			maxlength:10
		},
	},
	{
		title: "使用期限（月）",
		dataIndex: "usageTime",
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
		name: "TextInput",
		props: {
			placeholder: "请输入规格型号",
		},
	},
	{
		title: "计量单位",
		dataIndex: "unit",
		name: "TextInput",
		props: {
			placeholder: "请输入计量单位",
		},
	},
	{
		title: "数量",
		dataIndex: "number",
		name: "NumberInput",
		props: {
			placeholder: "请输入数量",
			minNum: "0",
			required: true,
		},
	},
	{
		title: "原值",
		dataIndex: "price",
		name: "AmountInput",
		props: {
			placeholder: "请输入原值",
			maxlength:10,
			precision:2
		},
	},
	{
		title: "管理员",
		dataIndex: "adminId",
		name: "UserPicker",
		props: {
			multiple: false,
			placeholder: "请选择",
		},
	},
	{
		title: "区域",
		dataIndex: "areaIds",
		name: "AreaList",
		props: {
			placeholder: "请选择区域",
		},
	},
]);
const value = ref(props.modelValue ?? []);
const add = () => {
	TableBaseRef.value.showEditPanel();
};

const del = (index:number) => {
	TableBaseRef.value.removeItem(index);
};

watch(
	() => value.value,
	() => {
		// 后端要求的加一个字段
		const modelValue=value.value.map((e: { flowConvertData: boolean; })=>{
      e.flowConvertData=false
      return e
    })
		emits("update:modelValue", modelValue);
	},
	{ deep: true }
);

onMounted(() => {

});

const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请至少添加一组资产` : ''
})
const validate = () => {
  const valid = !!value.value.length
  validInput.value = valid
  return valid
}

// 行保存时的资产编码验证函数
const validateRowSerialNumber = async (rowData: any): Promise<boolean> => {
  const serialNumber = rowData.serialNumber;
	let errorMsg = '';
  if (!serialNumber) {
    errorMsg = `请输入资产编码`;
		showNotify({ type: 'warning', message: errorMsg })
    return false;
  }

  try {
    // 调用后端接口校验
    const checkParams = { checkSerialNumberList: [{key: rowData.id, value: serialNumber }] };
    const res = await propertyService.checkPropertyCode(checkParams);
    if (res && Array.isArray(res) && res.includes(serialNumber)) {
			errorMsg = `资产编码 ${serialNumber} 已存在`;
			showNotify({ type: 'warning', message: errorMsg })
      return false;
    }
    // 校验通过
    return true;
  } catch {
    // 处理 API 调用错误
    errorMsg = '校验资产编码时发生错误';
		showNotify({ type: 'warning', message: errorMsg })
    return false;
  }
};

defineExpose<FormItemExpose>({
	validate
});
</script>
<style scoped lang="less">
.group-list {
	flex-flow: column;
	background-color: #f3f7fa;

	:deep(.van-cell) {
		border-bottom: 1px solid #fafafa;
	}

	:deep(.van-cell__title) {
		width: 100%;
		margin-bottom: 10px;
		position: relative;

		.add-group {
			position: absolute;
			top: 50%;
			right: 0;
			transform: translateY(-50%);
		}
	}

	:deep(.van-field__control--custom) {
		display: flex;
		flex-flow: column;
	}

	.card-header {
		width: 100%;
		box-sizing: border-box;
		padding:10px;
		.title {
			font-size: 20px;
			font-weight: 400;
		}
	}

	.card-body {
		width: 100%;
		box-sizing: border-box;
		padding: 5px 10px;
		border-top: 1px solid #e9e9e9;
		border-bottom: 1px solid #e9e9e9;
	}
	.card-foot {
		text-align: center;
		padding: 15px 10px;
    color:var(--van-button-danger-background);
	}

  .field-item {
      color: #a7a7a7;
      margin-bottom: 10px;
      .label{
        margin-left: 8px;
        color: #333;
      }
      .value {
        margin-left: 10px;
      }
      :deep(.van-field){
        padding: 0;
        border-bottom: 0;
      }
      :deep(.van-cell__title){
        width: auto;
        margin-bottom: 0;
      }
  }
}
</style>
