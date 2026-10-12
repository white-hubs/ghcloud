<template>
  <TableBase :model-value="value" :readonly="props.readonly" :label="props.config.title" :columns="columns">
    <template #header-content>
      <span style="margin:0 50px">总量：{{ totalNum }} </span>
      <span>金额：{{ totalAmount }}</span>
    </template>
    <template #header-btn>
      <a-button type="primary" shape="round" v-if="!props.readonly" @click="showOrgPicker">选择耗材</a-button>
    </template>
    <template #operation="{ column, record }">
      <a-button type="link" danger @click="del(record)">删除</a-button>
    </template>
  </TableBase>
  <OrgPicker title="耗材" :url="'getConsumablePage'" :columns="orgColumns" :search="search" ref="orgPickerRef"
    :activeId="activeId" :selectedRows="selectedRows" @close="selected" :selectionType="'checkbox'" width="1200px" />
</template>
<script setup lang="ts">
import { PropertyDetailedParam } from "@/domain/property";
import { computed, onMounted, ref, watch, h } from "vue";
import TableBase from "./TableBase.vue";
import OrgPicker from "./OrgPicker.vue";
import { Popover, TreeProps, TreeSelectProps } from "ant-design-vue";
import { getConsumableCategoryTree } from "@/api/property/index";
import _ from 'lodash'
const props = withDefaults(
  defineProps<{
    modelValue?: any[] | null;
    placeholder?: string;
    readonly?: boolean;
    config?: any;
    formData: Record<string, any>;
    params: string;
  }>(),
  {
    modelValue: null,
    readonly: false,
  }
);
const emits = defineEmits(["update:modelValue", "clearValidate"]);

const totalAmount = computed(() => {
  let res = 0
  value.value.forEach(e => {
    res += e.storeAmount
  })
  return res.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

const totalNum = computed(() => {
  let res = 0
  value.value.forEach(e => {
    res += e.num ? parseInt(e.num) : 0
  })
  return res
})
const selectedRows = ref<any[]>([])
//表格列配置
const columns = ref<any[]>([
  {
    title: "序号",
    dataIndex: "key",
    align: "center",
    fixed: "left",
    customRender: ({ index }: any): string => {
      return index + 1;
    },
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    align: "center",
    fixed: "left",
    customRender: ({ text }: { text: string }) => {
      return text || '--'
    }
  },
  {
    title: "耗材编码",
    dataIndex: "code",
    align: "center",
    fixed: "left",
    customRender: ({ text }: { text: string }) => {
      return text || '--'
    }
  },
  {
    title: "图片",
    dataIndex: "file",
    align: "center",
    customRender: ({ text }: { text: any[]; }) => {
      const file: any[] = text || []
      if (file.length === 0) {
        return '暂无图片'
      }
      return h('img', { src: file[0].path, style: { maxHeight: '100px', maxWidth: '100px' } })
    }
  },
  {
    title: "规格型号",
    dataIndex: "model",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text ||'--'
    }
  },
  {
    title: "品牌",
    dataIndex: "brand",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text ||'--'
    }
  },
  {
    title: "耗材分类",
    dataIndex: "categoryName",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text ||'--'
    }
  },
  {
    title: "单位",
    dataIndex: "unit",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text ||'--'
    }
  },
  {
    title: "库存量",
    dataIndex: "stock",
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text!==null?text:'--'
    }
  },
  {
    title: "单价",
    dataIndex: "price",
    align: "center",
    name: "AmountInput",
    props: {
      placeholder: "请输入单价",
      required: true,
      minNum: 0,
			maxlength:10,
      precision: 2
    },
  },
  {
    title: "数量",
    dataIndex: "num",
    align: "center",
    name: "NumberInput",
    props: {
      placeholder: "请输入数量",
      minNum: 1,
      required: true
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
      params: 'price',
      params2: 'num',
      precision: 2
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
    title: '耗材编码',
    dataIndex: 'code',
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "规格型号",
    dataIndex: "model",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "品牌",
    dataIndex: "brand",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "耗材分类",
    dataIndex: "categoryName",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "单位",
    dataIndex: "unit",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '质保期限(月)',
    dataIndex: 'qualityPeriod',
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string | undefined }) => {
      text = text === '' ? undefined : text
      return [
        h(Popover, { content: text }, { default: () => text ?? '--' })
      ]
    }
  },
  {
    title: '限领数量',
    dataIndex: 'useLimit',
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: string | undefined }) => {
      text = text === '' ? undefined : text
      return [
        h(Popover, { content: text }, { default: () => text ?? '--' })
      ]
    }
  },
  {
    title: "库存量",
    dataIndex: "stock",
    align: "center",
    name: "TextInput",
    ellipsis: true,
    customRender: ({ text }: { text: string | undefined }) => {
      text = text === '' ? undefined : text
      return [
        h(Popover, { content: text }, { default: () => text ?? '--' })
      ]
    }
  },
]);
const search = ref(
  [
    {
      label: '耗材类别',
      placeholder: "请选择",
      value: 'categoryId',
      component: 'a-tree-select',
      options: [],
    },
    {
      label: '',
      placeholder: "耗材编码、耗材名称",
      value: 'keyword'
    }
  ]
)

const value = ref(props.modelValue ?? []);
const del = (record: PropertyDetailedParam) => {
  value.value = value.value.filter((item) => item.id !== record.id);
  selectedRows.value = _.cloneDeep(value.value) ;
  activeId.value = value.value.map((item: any) => {
    return item.id;
  });
};

watch(
  () => value.value,
  () => {
    emits("update:modelValue", value.value);
  },
  { deep: true }
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
    selectedRows.value = _.cloneDeep(value.value);
    activeId.value = value.value.map((item: any) => {
      return item.id;
    })
    // 耗材分类
    getConsumableCategoryTree().then(res => {
      const getTreeSelectoptions = (tree: TreeProps['treeData'] = []): TreeSelectProps['treeData'] => {
        return tree.map(e => {
          return {
            title: e.name,
            value: e.id,
            children: e.children?.length ? getTreeSelectoptions(e.children)! : []
          }
        })
      }
      if (res) {
        search.value[0].options = getTreeSelectoptions(res as TreeProps['treeData']) as never[]
      }
    })
  }
});

//弹窗相关
const orgPickerRef = ref();
const activeId = ref<any[]>([]);
const selected = (values: any) => {
  if (values) {
    // 后端要求的加一个字段 过滤掉已选择的
    values = values.filter((e: { id: string; flowConvertData: boolean; price: number; num: number,storeAmount:number }) => {
      if (!activeId.value.includes(e.id)) {
        e.flowConvertData = false
        e.price = 0
        e.num = 1
        e.storeAmount=0
        return e
      }
    })

    value.value = value.value.concat(values);
    emits("update:modelValue", value.value);
    emits("clearValidate");
    selectedRows.value = _.cloneDeep(value.value);
    activeId.value = value.value.map((item: any) => {
      return item.id;
    });
  }
};
const showOrgPicker = () => {
  orgPickerRef.value.show()
}

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
