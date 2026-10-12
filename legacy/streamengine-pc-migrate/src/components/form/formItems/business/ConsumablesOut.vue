<template>
  <TableBase
    ref="tableBaseRef"
    :model-value="value"
    :readonly="props.readonly"
    :label="props.config.title"
    :columns="columns"
    row-key="id"
    :row-save-validator="rowSaveValidator"
  >
    <template #header-content>
      <span v-if="props.required && !props.readonly" style="color: var(--ant-error-color)">（必填）</span>
      <span style="margin: 0 50px">总量：{{ totalNum }} </span>
      <span>金额：{{ totalAmount }}</span>
    </template>
    <template #header-btn>
      <a-button type="primary" shape="round" v-if="!props.readonly" @click="showOrgPicker">选择耗材</a-button>
    </template>
    <template #operation="{ column, record }">
      <a-button type="link" danger @click="del(record)">删除</a-button>
    </template>
  </TableBase>
  <OrgPicker
    title="耗材"
    :url="'getConsumableStoreStock'"
    :columns="orgColumns"
    :search-params="orgSearchParams"
    :search="search"
    ref="orgPickerRef"
    :activeId="activeId"
    @close="selected"
    :selectionType="'checkbox'"
  />
</template>
<script setup lang="ts">
import { Popover, TreeProps, TreeSelectProps, message } from "ant-design-vue";
import { computed, h, onMounted, ref, watch } from "vue";

import OrgPicker from "./OrgPicker.vue";
import TableBase from "./TableBase.vue";
import { getConsumableCategoryTree } from "@/api/property/index";
import { PropertyDetailedParam } from "@/domain/property";
const props = withDefaults(
  defineProps<{
    modelValue?: any[] | null;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    config?: any;
    formData: Record<string, any>;
    params: string;
  }>(),
  {
    modelValue: null,
    readonly: false,
    required: false,
  },
);
const emits = defineEmits(["update:modelValue", "clearValidate"]);
const tableBaseRef = ref<InstanceType<typeof TableBase>>();

const totalAmount = computed(() => {
  let res = 0;
  value.value.forEach((e) => {
    res += e.storeAmount;
    // res += (e.avgPrice??0)*(e.num??0)
  });
  return res.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

const totalNum = computed(() => {
  let res = 0;
  value.value.forEach((e) => {
    res += e.num ? parseInt(e.num) : 0;
  });
  return res;
});

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
    title: "图片",
    dataIndex: "file",
    align: "center",
    customRender: ({ text }: { text: any[] }) => {
      const file: any[] = text || [];
      if (file.length === 0) {
        return "暂无图片";
      }
      return h("img", { src: file[0].path, style: { maxHeight: "100px", maxWidth: "100px" } });
    },
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "耗材编码",
    dataIndex: "code",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "规格型号",
    dataIndex: "model",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "品牌",
    dataIndex: "brand",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "耗材分类",
    dataIndex: "categoryName",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "单位",
    dataIndex: "unit",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "单价",
    dataIndex: "avgPrice",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "库存量",
    dataIndex: "storeNum",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "限领数量",
    dataIndex: "useLimit",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "出库数量",
    dataIndex: "num",
    align: "center",
    name: "ConsumablesOutNumInput",
    props: {
      placeholder: "请输入数量",
      minNum: 0,
      required: true,
      params: "useLimit",
    },
  },
  {
    title: "金额",
    dataIndex: "storeAmount",
    align: "center",
    name: "AmountInputForConsumable",
    props: {
      placeholder: "自动计算",
      disabled: true,
      minNum: 0,
      readonly: true,
      params: "avgPrice",
      params2: "num",
      precision: 2,
    },
  },
]);
const orgColumns = ref<any[]>([
  {
    title: "序号",
    dataIndex: "key",
    align: "center",
    customRender: ({ index }: any): string => {
      return index + 1;
    },
  },
  {
    title: "耗材编码",
    dataIndex: "code",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "规格型号",
    dataIndex: "model",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "品牌",
    dataIndex: "brand",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材分类",
    dataIndex: "categoryName",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "单位",
    dataIndex: "unit",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "质保期限(月)",
    dataIndex: "qualityPeriod",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string | undefined }) => {
      text = text === "" ? undefined : text;
      return [h(Popover, { content: text }, { default: () => text ?? "--" })];
    },
  },
  {
    title: "限领数量",
    dataIndex: "useLimit",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string | undefined }) => {
      text = text === "" ? undefined : text;
      return [h(Popover, { content: text }, { default: () => text ?? "--" })];
    },
  },
  {
    title: "库存量",
    dataIndex: "storeNum",
    align: "center",
    name: "TextInput",
    ellipsis: true,
    customRender: ({ text }: { text: string | undefined }) => {
      text = text === "" ? undefined : text;
      return [h(Popover, { content: text }, { default: () => text ?? "--" })];
    },
  },
]);
const search = ref([
  {
    label: "耗材类别",
    placeholder: "请选择",
    value: "categoryId",
    component: "a-tree-select",
    options: [],
  },
  {
    label: "",
    placeholder: "耗材编码、耗材名称",
    value: "keyword",
  },
]);
const orgSearchParams = computed(() => {
  return [
    {
      key: "storeId",
      value: props.formData[props.params]?.id ?? "",
    },
  ];
});

const value = ref<any[]>(Array.isArray(props.modelValue) ? props.modelValue : []);

// 修正后端详情单个条目的 storeAmount
const correctStoreAmount = (item: any) => {
  const avgPrice = item.avgPrice ?? 0;
  const num = item.num ?? 0;
  // 计算并更新 storeAmount，确保是数字类型
  item.storeAmount = parseFloat((avgPrice * num).toFixed(2));
  return item;
};

const del = (record: PropertyDetailedParam) => {
  value.value = value.value.filter((item) => item.id !== record.id);
};

watch(
  () => value.value,
  () => {
    emits("update:modelValue", value.value);
  },
  { deep: true },
);

watch(
  () => props.formData[props.params],
  () => {
    value.value = [];
    emits("update:modelValue", value.value);
  },
  { deep: true },
);

onMounted(() => {
  if (!props.readonly) {
    columns.value.push({
      dataIndex: "operation",
      title: "操作",
      align: "center",
      fixed: "right",
      width: 100,
    });

    // 耗材分类
    getConsumableCategoryTree().then((res) => {
      const getTreeSelectoptions = (tree: TreeProps["treeData"] = []): TreeSelectProps["treeData"] => {
        return tree.map((e) => {
          return {
            title: e.name,
            value: e.id,
            children: e.children?.length ? getTreeSelectoptions(e.children)! : [],
          };
        });
      };
      if (res) {
        search.value[0].options = getTreeSelectoptions(res as TreeProps["treeData"]) as never[];
      }
    });
  } else {
    if (props.modelValue && Array.isArray(props.modelValue)) {
      // 修正每个条目的 storeAmount 并更新内部 value
      value.value = props.modelValue.map(correctStoreAmount);
    }
  }
});

//弹窗相关
const orgPickerRef = ref();
const activeId = computed(() => value.value.map((item) => item.id));
const selected = (values: any) => {
  if (values) {
    // 后端要求的加一个字段 过滤掉已选择的
    values = values.filter((e: { id: string; flowConvertData: boolean; price: number; num: number; storeAmount: number }) => {
      if (!activeId.value.includes(e.id)) {
        e.flowConvertData = false;
        e.num = 0;
        e.storeAmount = 0;
        return e;
      }
    });

    value.value = value.value.concat(values);
    emits("update:modelValue", value.value);
    emits("clearValidate");
  }
};
const showOrgPicker = () => {
  if (props.params && !props.formData[props.params]) {
    message.error("请先选择仓库");
    return;
  }
  orgPickerRef.value.show();
};

const getRowError = (item: Record<string, any>): string => {
  const num = Number(item.num);
  if (!Number.isSafeInteger(num) || num < 1) {
    return "出库数量必须为大于0的整数";
  }
  // 0 库存也必须校验；限领数量为 0 或未配置时不限制。
  if (item.storeNum != null && item.storeNum !== "" && num > Number(item.storeNum)) {
    return `出库数量不能大于库存数量（${item.storeNum}）`;
  }
  if (Number(item.useLimit) > 0 && num > Number(item.useLimit)) {
    return `出库数量不能大于限领数量（${item.useLimit}）`;
  }
  return "";
};

const rowSaveValidator = async (item: Record<string, any>, index: number) => {
  const error = getRowError(item);
  if (error) {
    const text = `第${index + 1}行${error}`;
    message.error(text);
    return Promise.reject(text);
  }
};

const validator = async () => {
  if (props.readonly) return;
  if (props.required && value.value.length === 0) {
    return Promise.reject("请选择耗材");
  }
  for (let index = 0; index < value.value.length; index++) {
    const error = getRowError(value.value[index]);
    if (error) return Promise.reject(`第${index + 1}行${error}`);
  }
  const unsavedRows = tableBaseRef.value?.checkSaveState();
  if (unsavedRows?.length) {
    return Promise.reject(`请先保存第${unsavedRows[0] + 1}行耗材`);
  }
  return Promise.resolve();
};
//对外暴露验证方法
defineExpose({
  validator,
});
</script>
<style scoped lang="less">
.count {
  text-align: left;
}
</style>
