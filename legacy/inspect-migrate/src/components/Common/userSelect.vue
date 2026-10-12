<template>
  <a-select
    :allowClear="allowClear"
    v-model:value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder ? placeholder : '请选择'"
    :showSearch="showSearch ? showSearch : false"
    :mode="mode ? mode : null"
    :options="selectOptions ? selectOptions : []"
    :field="field ? field : null"
    :filterOption="filterOption"
    :getPopupContainer="triggerNode => triggerNode.parentNode"
    @change="onChange"
    class="g-select legacy-user-select"
  >
    <template #suffixIcon  v-if="loading">
      <LoadingOutlined />
    </template>
  </a-select>
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
import { LoadingOutlined } from '@ant-design/icons-vue';
import { replaceObjectKeys } from "@pansy/utils";

export default defineComponent({
  name: "userSelect",
  components: {
    LoadingOutlined
  },
  props: {
    value: {
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
      loading: false,
    });
    const userDataList = []

    const getData = async obj => {
      if(userDataList.length){
        state.selectOptions = [...userDataList]
        return
      }
      state.loading = true;
      let data = [];
      // 一次分页查询不完
      const firstPageRes = await proxy.$api['tenantUsers']({ ...props.params, ...obj, pageNumber:1 })
      state.selectOptions = props.field ? replaceObjectKeys(firstPageRes.records, props.field): data;
      state.selectOptions = state.selectOptions.map(e=>{
        return {
          ...e,
          value:String(e.value)
        }
      })

      const pages = firstPageRes.pages
      const queryTask = []
      for (let i = 1; i < pages; i++) {
        const pageParams = {
          pageNumber: i + 1,
          pageSize: props.params.pageSize,
        }
        queryTask.push(proxy.$api['tenantUsers']({ ...props.params, ...obj,...pageParams }))
      }
      const res = await Promise.all(queryTask)
      data = [...firstPageRes.records,...res.reduce((acc,cur)=>[...acc,...cur.records],[])]
      state.selectOptions = props.field ? replaceObjectKeys(data, props.field): data;
      state.selectOptions = state.selectOptions.map(e=>{
        return {
          ...e,
          value:String(e.value)
        }
      })
      userDataList.push(...state.selectOptions)
      state.loading = false;
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
      n => {
        if (props.mode === "multiple") {
          state.modelValue = n ? (n instanceof Array ? n : n.split(",")) : [];
        } else {
          state.modelValue = n;
        }
      },
    );


    const onChange = (value, option) => {
      emit("update:value", state.modelValue);
      emit("change-check", value, option);
    };
    const filterOption = (inputValue, option) => {
      return option.label.includes(inputValue);
    };

    return {
      ...toRefs(state),
      onChange,
      getData,
      filterOption,
    };
  },
});
</script>
<style lang="less">
.legacy-user-select{
  .ant-select-arrow .anticon>svg{
    display: block !important;
  }
}
</style>
