<template>
  <a-select
    allowClear
    v-model:value="modelValue"
    :disabled="disabled"
    :filterOption="false"
    :placeholder="placeholder ? placeholder : '请选择'"
    :showSearch="showSearch ? showSearch : false"
    :mode="mode ? mode : null"
    :options="selectOptions ? selectOptions : []"
    :field="field ? field : null"
    @change="onChange"
  ></a-select>
</template>
<script lang="jsx">
import {
  createVNode,
  defineComponent,
  onMounted,
  toRefs,
  getCurrentInstance,
  reactive,
  ref,
  watch,
} from "vue";
import { replaceObjectKeys } from "@pansy/utils";

export default defineComponent({
  name: "gSelect",
  props: {
    value: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    mode: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
      default: null,
    },
    field: {
      type: Object,
      default: () => {
        return {
          id: "value",
          name: "label",
        };
      },
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      selectOptions: [],
      modelValue: null,
    });

    const getData = (obj) => {
      if (props.url) {
        proxy.$api[props.url]({ ...props.params, ...obj }).then((res) => {
          const data = res.records ? res.records : res;
          state.selectOptions = props.field
            ? replaceObjectKeys(data, props.field)
            : data;
        });
      } else if (props.options.length > 0) {
        state.selectOptions = props.field
          ? replaceObjectKeys(props.options, props.field)
          : props.options;
      }
    };

    onMounted(() => {
      state.modelValue = props.value
        ? props.value
        : props.mode === "multiple"
        ? []
        : "";
      state.modelValue = props.value
        ? props.value
        : props.mode === "multiple"
        ? []
        : null;
      getData();
    });

    watch(
      () => props.value,
      (n) => {
        if (props.mode === "multiple") {
          state.modelValue = n ? (n instanceof Array ? n : n.split(",")) : [];
        } else {
          state.modelValue = n;
        }
      }
    );

    const onChange = (value, option) => {
      emit("update:value", state.modelValue);
      emit("change-check", value, option);
    };
    return {
      ...toRefs(state),
      onChange,
      getData,
    };
  },
});
</script>
