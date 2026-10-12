<template>
  <a-select
    :allowClear="allowClear"
    v-model:value="modelValue"
    :disabled="disabled"
    :filterOption="url?false:true"
    :placeholder="placeholder ? placeholder : '请选择'"
    :showSearch="showSearch ? showSearch : false"
    :mode="mode ? mode : null"
    :options="selectOptions ? selectOptions : []"
    :field="field ? field : null"
    :maxTagCount="maxTagCount"
    @dropdownVisibleChange="dropdownVisibleChange"
    @change="onChange"
    @search="search"
    class="g-select"
  ></a-select>
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
    maxTagCount: {
      type: Number,
      default: 1000,
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    searchKey: {
      type: String,
      default: "keyword",
    },
    allowClear: {
      type: Boolean,
      default: true,
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

    watch(
      () => props.params,
      (n) => {
        getData();
      }
    );
    watch(() =>props.options,(value) =>{
      getData()
    })

    const onChange = (value, option) => {
      emit("update:value", state.modelValue);
      emit("change-check", value, option);
    };

    
    const search = (value) => {
      getData({ [props.searchKey ? props.searchKey : "keyword"]: value });
    };

    const dropdownVisibleChange = () => {
      getData();
    };

    return {
      ...toRefs(state),
      onChange,
      getData,
      dropdownVisibleChange,
      search,

    };
  },
});
</script>
<style lang="less">
.g-select{
  &.ant-select{
    width: 218px;
  }
}
</style>
