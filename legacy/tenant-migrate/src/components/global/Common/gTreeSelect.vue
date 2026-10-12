<template lang="pug">
a-tree-select(
    allowClear
    v-model:value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder?placeholder:'请选择'"
    :showSearch="showSearch?showSearch:false"
    :multiple="multiple?multiple:false"
    :treeData="selectOptions?selectOptions:[]"
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
    disabled: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    field: {
      type: Object,
      default: () => {
        return {
          id: "value",
          name: "title",
          childern: "childern",
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
        proxy.$api[props.url]().then((res) => {
          if (props.field) {
            state.selectOptions = replaceObjectKeys(res, props.field);
          } else {
            state.selectOptions = replaceObjectKeys(res, {
              id: "value",
              name: "title",
              childern: "childern",
            });
          }
        });
      } else if (props.options.length > 0) {
        state.selectOptions = replaceObjectKeys(props.options, props.field);
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
