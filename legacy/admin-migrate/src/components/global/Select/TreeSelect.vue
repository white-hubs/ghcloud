<template>
  <a-tree-select
    style="width: 100%"
    :tree-data="treeData"
    :fieldNames="fieldNames"
    :size="size"
    :disabled="disabled"
    :tree-checkable="treeCheckable"
    :maxTagCount="10"
    allow-clear
    :multiple="multiple"
    :placeholder="placeholder"
    :show-checked-strategy="SHOW_CHILD"
    search-placeholder="Please select"
    @select="select"
  />
</template>
<script lang='jsx'>
import { TreeSelect } from "ant-design-vue";
import {
  defineComponent,
  reactive,
  ref,
  watch,
  getCurrentInstance,
  toRefs,
  onMounted,
} from "vue";
import request from "@/utils/request";
const SHOW_CHILD = TreeSelect.SHOW_CHILD;
export default defineComponent({
  props: {
    api: {
      type: String,
      default: () => {
        return "";
      },
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    method: {
      type: String,
      default: () => {
        return "get";
      },
    },
    params: {
      type: Object,
      default: () => {
        return null;
      },
    },
    fieldNames: {
      type: Object,
      default: () => {
        return {
          children: "children",
          label: "name",
          key: "key",
          value: "id",
        };
      },
    },
    placeholder: {
      type: String,
      default: () => {
        return "请选择";
      },
    },
    size: {
      type: String,
      default: () => {
        return "default";
      },
    },
    methodName: String,
    treeCheckable: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    multiple: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    disabled: {
      type: [Boolean, String],
      default: () => {
        return false;
      },
    },
  },
  emits: ["getType"],
  setup(props, { emit }) {
    // const value = ref([]);
    const { proxy } = getCurrentInstance();
    const addKey = (data) => {
      const arr = data.filter((item) => {
        if (!item?.key) {
          Object.assign(item, { key: item.id });
        }
        if (item.children.length) {
          addKey(item.children);
        }
        return item;
      });
      return arr;
    };
    const data = reactive({
      treeData: [],
    });

    const getData = () => {
      if (props.api) {
        request({
          url: props.api,
          method: props.method,
          params: props.params,
        }).then((res) => {
          if (res.records) {
            data.treeData = addKey(res.records);
          } else {
            data.treeData = addKey(res);
          }
        });
      }
      if (props.methodName) {
        const method = proxy.$api[props.methodName];
        method("get", props.params).then((res) => {
          if (res.records) {
            data.treeData = addKey(res.records);
          } else {
            data.treeData = addKey(res);
          }
        });
      }
    };

    const select = (val, ...rest) => {
      const extra = rest.find(
        (r) =>
          r &&
          typeof r === 'object' &&
          ('selectedNodes' in r || 'node' in r || 'triggerNode' in r)
      )
      const sn = extra?.selectedNodes?.[0]
      const row = sn?.props?.dataRef ?? sn?.dataRef ?? sn
      emit("getData", row ?? sn);
      emit("getValue", val);
    };

    onMounted(() => {
      getData();
    });

    watch(
      () => props.params,
      () => {
        getData();
      },
      { deep: true }
    );
    return {
      // value: ref(undefined),
      ...toRefs(data),
      SHOW_CHILD,
      select,
    };
  },
});
</script>
