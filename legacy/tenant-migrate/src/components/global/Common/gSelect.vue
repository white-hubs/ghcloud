<template lang="pug">
a-select(
    allowClear
    v-model:value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder?placeholder:'请选择'"
    :showSearch="showSearch?showSearch:false"
    :mode="mode?mode:null"
    :options="selectOptions?selectOptions:[]"
    :field="field?field:null"
    @change="onChange"
)
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

    onMounted(() => {
      state.modelValue = props.value;
      if (props.url) {
        proxy.$api[props.url]("", props.params).then((res) => {
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
    });

    watch(
      () => props.value,
      (n) => {
        state.modelValue = n;
      }
    );

    const onChange = () => {
      emit("update:value", state.modelValue);
    };
    return {
      ...toRefs(state),
      onChange,
    };
  },
});
</script>
