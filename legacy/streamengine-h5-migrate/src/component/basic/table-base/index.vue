<template>
	<transition-group name="list" v-if="dataSource.length">
		<div v-for="(item, index) in dataSource" class="card-item" @click="showEditPanel(item, index)">
			<slot name="card-item" :dataItem="item" :index="index"></slot>
		</div>
	</transition-group>
	<VanEmpty description="暂无数据" v-else />
	<!--编辑&详情面板-->
	<VanPopup v-model:show="showPanel" :style="{ width: '100vw', height: '100vh', margin: 0 }" position="right" duration="0.2">
		<VanNavBar class="nav" :title="label" left-text="取消" right-text="确认" @click-left="cancel" @click-right="confirm" />
		<div class="form-area" v-if="nowEditData">
			<template v-for="(column, index) in props.columns" :key="index">
				<FormItem ref="formItemComponentRef" v-model="nowEditData[column.dataIndex]" :form-data="nowEditData" :form-option="column" :process-type="DynamicTableProcessType.ADD" :readonly="props.readonly" />
			</template>
		</div>
	</VanPopup>
</template>
<script setup lang="ts">
import { DynamicTableProcessType } from "../../../business/dynamic-table/dynamic-table";
import { FormItemComponent } from "../../../business/dynamic-table/form-item";
import { ref } from "vue";
import FormItem from "../../../business/dynamic-table/form-item-component.vue";
import { propertyService } from "../../../service/property/property";
const props = withDefaults(
	defineProps<{
		label: string;
		modelValue: any[];
		readonly: boolean;
		columns: any[];
		rowSaveValidator?: (rowData: any) => Promise<boolean>;
	}>(),
	{
		modelValue: () => [],
		columns: () => [],
		readonly: false,
		rowSaveValidator: undefined,
	}
);
const emits = defineEmits(["update:modelValue"]);
const dataSource = ref<Record<string, any>[]>(props.modelValue ?? []);

// 显示编辑面板
const nowEditData = ref<Record<string, string> | null>(null);
const nowEditIndex = ref(-1);
const showPanel = ref(false);
const cancel = () => {
	showPanel.value = false;
	nowEditData.value = null;
};
const confirm =async () => {
	if (props.readonly) {
		cancel();
		return;
	}

	if (props.rowSaveValidator) {
		const isValid = await props.rowSaveValidator!(nowEditData.value);
		if (!isValid) {
			return;
		}
	}

	if (!validateForm() || !nowEditData.value) {
		return;
	}

	if (nowEditIndex.value === -1) {
		//新增一条数据
		dataSource.value.push(nowEditData.value);
	} else {
		//编辑现有数据
		dataSource.value[nowEditIndex.value] = nowEditData.value;
	}
	emits("update:modelValue", dataSource.value);
	cancel();
};

function validateForm() {
	let result = true;
	formItemComponentRef.value?.forEach((item) => {
		if (!item.validate?.()) {
			result = false;
		}
	});
	return result;
}

//表单校验元素集合
const formItemComponentRef = ref<FormItemComponent[] | null>(null);

/**
 * 对外暴露方法
 */

// 显示详情数据
const showEditPanel = (data: any = null, editIndex: number = -1) => {
	nowEditData.value = JSON.parse(JSON.stringify(data));
	if (!data) {
		const res: Record<string, string> = {};
		for (const key in props.columns) {
			const element = props.columns[key];
			res[element.dataIndex] = "";
		}
		nowEditData.value = res;
	}
	nowEditIndex.value = editIndex;
	showPanel.value = true;
};

//移除
const removeItem = (index: number) => {
	dataSource.value.splice(index, 1);
	emits("update:modelValue", dataSource.value);
};
defineExpose({
	showEditPanel,
	removeItem,
});
</script>
<style scoped lang="less">
.card-item {
	background-color: white;
	border-radius: 3px;
	width: 100%;
	margin-bottom: 10px;
}

.form-area {
	overflow: auto;
	height: calc(100% - var(--van-nav-bar-height));
	:deep(.van-cell__title) {
		width: 25vw !important;
		white-space: nowrap;
	}
	:deep(.van-field__control){
		flex-flow:unset !important
	}
}
.list-move,
.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(30px);
}
.list-leave-active {
	position: absolute;
}
</style>
