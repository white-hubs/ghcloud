<template>
  <a-cascader
   
    v-model:value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder ? placeholder : '请选择'"
    :showSearch="showSearch ? showSearch : false"
    :multiple="multiple ? multiple : false"
    :options="selectOptions ? selectOptions : []"
    :field="field ? field : null"
    :change-on-select="changeOnSelect ? changeOnSelect : false"
    @change="onChange"
    :getPopupContainer="(triggerNode) => triggerNode.parentNode"
  />
</template>

<script>
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
import { deleteNullChi } from "@/utils/common";
import _ from "lodash";
export default defineComponent({
  name: "gCascader",
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
    changeOnSelect: {
      type: Boolean,
      default: true,
    },
    field: {
      type: Object,
      default: () => {
        return {
          id: "value",
          name: "label",
          childern: "childern",
        };
      },
    },
    params: {
      type: Object,
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
        proxy.$api[props.url](props.params, "get").then((res) => {
          if (props.field) {
            let data = _.cloneDeep(replaceObjectKeys(res, props.field));
            let deleteNullChidren = deleteNullChi(data, props.field.children);
            state.selectOptions = _.cloneDeep(deleteNullChidren);
          } else {
            let data = replaceObjectKeys(res, {
              id: "value",
              name: "label",
              childern: "childern",
            });
            let deleteNullChidren = deleteNullChi(data, "children");
            state.selectOptions = _.cloneDeep(deleteNullChidren);
          }
        });
      } else if (props.options.length > 0) {
        let deleteNullChidren = _.cloneDeep(props.options);
        if (props.field) {
          let replaced = replaceObjectKeys(deleteNullChidren, props.field);
          state.selectOptions = deleteNullChi(replaced, props.field.childern);
        } else {
          state.selectOptions = deleteNullChidren;
        }
      }
    });

    watch(
      () => props.value,
      (n) => {
        state.modelValue = n;
      }
    );

    const onChange = (value, selectedOptions) => {
      emit("custom-change", value, selectedOptions);
      emit("update:value", state.modelValue);
    };
    return {
      ...toRefs(state),
      onChange,
    };
  },
});
</script>
