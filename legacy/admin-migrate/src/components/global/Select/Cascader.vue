<template>
  <a-cascader
    v-model:value="value"
    :options="selectOption"
    :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
    placeholder="请选择"
    :size="size"
    :disabled="disabled"
  />
</template>
<script lang='jsx'>
import { defineComponent, ref, getCurrentInstance } from "vue";
import request from "@/utils/request";
import { deleteNullChild } from "@/utils/common";
import { number } from "echarts";
export default defineComponent({
  props: {
    api: {
      type: String,
      default: () => {
        return "/mgt/area/list";
      },
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    size: {
      type: String,
      default: () => {
        return "default";
      },
    },
    disabled: {
      type: [String, Number, Boolean],
      default: () => {
        return false;
      },
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const selectOption = ref([]);
    request({
      url: props.api,
      method: props.method,
      params: props.params,
    }).then((res) => {
      if (res.records) {
        selectOption.value = deleteNullChild(res.records);
      } else {
        selectOption.value = deleteNullChild(res);
      }
    });

    return {
      // value: ref(undefined),
      selectOption,
    };
  },
});
</script>
