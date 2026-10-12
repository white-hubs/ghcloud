<template lang="pug">
a-cascader(
    allowClear
    v-model:value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder?placeholder:'请选择'"
    :showSearch="showSearch?showSearch:false"
    :multiple="multiple?multiple:false"
    :options="selectOptions?selectOptions:[]"
    :field="field?field:null"
    :displayRender="displayRender"
    :style="{display:onlyLabel? 'none':''}"
    @change="onChange")
span(v-if="onlyLabel") {{locationName}}      
</template>

<script lang='jsx'>
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
          name: "label",
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
      locationName: "",
    });

    const displayRender = ({ labels }) => {
      emit("getLabel", labels);
      state.locationName = labels.join(" / ");
      return labels.join(" / ");
    };

    onMounted(() => {
      state.modelValue = props.value;
      if (props.url) {
        proxy.$api[props.url]().then((res) => {
          if (props.field) {
            state.selectOptions = replaceObjectKeys(res, props.field);
          } else {
            state.selectOptions = replaceObjectKeys(res, {
              id: "value",
              name: "label",
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
      displayRender,
      onChange,
    };
  },
});
</script>
