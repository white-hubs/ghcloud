<template>
  <div class="group-list">
    <div class="header">
      <div class="header-content">
        <GVerticalLine :title="props.label"></GVerticalLine>
        <slot name="header-content"></slot>
      </div>
      <div class="btns">
        <slot name="header-btn"></slot>
      </div>
    </div>
    <a-table
      :columns="props.columns"
      :dataSource="dataSource"
      :rowKey="props.rowKey"
      class="tabal-base"
      :pagination="props.pagination"
      :scroll="!props.readonly ? { x: 2000 } : {}"
    >
      <template #headerCell="{ column }">
        <template v-if="column.props?.required">
          <span style="color: var(--ant-error-color)">{{ column.title }}</span>
        </template>
      </template>

      <template #bodyCell="{ column, record, text, index }">
        <slot name="bodyCell" :column="column" :record="record" :editableData="editableData" :index="index"></slot>
        <template v-if="column.name">
          <a-form-item-rest v-if="editableData.length && editableData[index]?.editable">
            <FormItemRender
              v-model:value="record[column.dataIndex]"
              :config="column"
              :formData="record"
              ref="formItemRef"
              :readonly="column.props.readonly ?? props.readonly"
            />
          </a-form-item-rest>
          <template v-else-if="!column.customRender">
            {{ componentFeedBack(text, column.name, column) }}
          </template>
        </template>

        <!--操作区域-->
        <template v-if="column.dataIndex === 'operation' && !props.readonly">
          <a-button type="link" @click="saveOrEdit(index)">
            {{ editableData[index]?.editable ? "保存" : "编辑" }}
          </a-button>
          <slot name="operation" :column="column" :record="record"></slot>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts">
import { watch, ref, computed } from "vue";

import GVerticalLine from "@/components/common/gVerticalLine.vue";
import FormItemRender from "@/components/form/FormItemRender.vue";
const emit = defineEmits(["rowSave"]);
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: any[];
    readonly: boolean;
    columns: any[];
    pagination?: boolean;
    rowKey?: string;
    rowSaveValidator?: (rowData: any, rowIndex: number) => Promise<void>;
  }>(),
  {
    modelValue: () => [],
    columns: () => [],
    readonly: false,
    pagination: false,
    rowKey: "key",
    rowSaveValidator: undefined,
  },
);
const editableData = ref<Record<string, any>[]>([]);
const dataSource = ref<Record<string, any>[]>(props.modelValue);

//新增或者删除一行数据
watch(
  () => props.modelValue.length,
  (newValue, oldValue) => {
    if (newValue > oldValue) {
      for (let index = 0; index < newValue - oldValue; index++) {
        editableData.value = [...editableData.value, { ...props.modelValue[oldValue + index], editable: !props.readonly }];
      }
    } else {
      // editableData.value = props.modelValue.map((e) => {
      // 	return { editable: false, ...e };
      // });
      const data = props.modelValue.map((e) => e[props.rowKey]);
      if (data.length === 0) {
        editableData.value = [];
      } else {
        editableData.value = editableData.value.filter((item) => data.includes(item[props.rowKey]));
      }
    }
    dataSource.value = props.modelValue;
  },
  { deep: true, immediate: true },
);

//行编辑 或者 保存
const saveOrEdit = async (index: number) => {
  // editableData.value[index].editable = !editableData.value[index].editable;
  // if(!editableData.value[index].editable){
  //   emit("rowSave", index);
  // }
  const currentRowData = editableData.value[index];
  if (currentRowData?.editable) {
    if (props.rowSaveValidator) {
      try {
        await props.rowSaveValidator(dataSource.value[index], index);
        currentRowData.editable = false;
        emit("rowSave", index);
      } catch (error: any) {}
    } else {
      currentRowData.editable = false;
      emit("rowSave", index);
    }
  } else {
    if (currentRowData) {
      currentRowData.editable = true;
    }
  }
};

//表单组件回显
const componentFeedBack = computed(() => {
  return (text: string | any[], componentName: string, column: { props: any; customRender?: Function }) => {
    if (!componentName) {
      return text;
    }
    if (componentName === "UserPicker") {
      return text
        ? (text as any[])
            .map((e: any) => {
              return e.name;
            })
            .join(",")
        : "--";
    }

    if (componentName === "AssetTypeSelect") {
      return text ? (text as unknown as { id: string; name: string }).name : "--";
    }
    if (componentName === "KeyValueSelect") {
      const findIndex = column.props.options.findIndex((e: any) => e[column.props.valueKey ?? "value"] === text);
      let res = "";
      if (findIndex !== -1) {
        res = column.props.options[findIndex][column.props.labelKey ?? "label"];
      }
      return res || "--";
    }
    if (componentName === "AreaList") {
      if (!text) {
        return "--";
      }
      const value = text as unknown as { id: string[]; name: string };
      return value.name;
    }
    if (componentName === "CascaderInput") {
      let res = [];
      const labelKey = column.props.fieldNames?.label ?? "label";
      const valueKey = column.props.fieldNames?.value ?? "value";
      const childKey = column.props.fieldNames?.children ?? "children";
      let options = [];
      for (let index = 0; index < text.length; index++) {
        if (index == 0) {
          options = column.props.options ?? [];
        }
        if (options.length === 0) {
          break;
        }

        const id = text[index];
        const findIndex: number = options.findIndex((e: { [x: string]: any }) => e[valueKey] === id);
        if (findIndex === -1) {
          break;
        }
        res.push(options[findIndex][labelKey]);
        options = options[findIndex][childKey] ?? [];
      }

      return res.join("/") || "--";
    }

    if (componentName === "AmountInputForConsumable" || componentName === "AmountInput") {
      return text
        ? parseFloat(text.toString())
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : "0.00";
    }

    if (componentName === "ConsumablesOutNumInput" || componentName === "NumberInput") {
      return text ?? 0;
    }

    return text || "--";
  };
});

//校验保存状态
const checkSaveState = (): number[] => {
  return editableData.value.map((e, index) => (e.editable ? index : -1)).filter((index) => index !== -1);
};

defineExpose({
  checkSaveState,
});
</script>
<style scoped lang="less">
.header {
  box-sizing: border-box;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .header-content {
    display: flex;
    align-items: center;
    .verticalLine {
      margin-right: 10px;
    }
  }
}
</style>
