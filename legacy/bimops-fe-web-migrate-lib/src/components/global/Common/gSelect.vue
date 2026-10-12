<template>
  <a-select
    :allowClear="allowClear"
    v-model:value="modelValue"
    :disabled="disabled"
    :filterOption="url ? false : true"
    :placeholder="placeholder ? placeholder : '请选择'"
    :showSearch="showSearch ? showSearch : false"
    :mode="mode ? mode : null"
    :options="selectOptions ? selectOptions : []"
    :field="field ? field : null"
    :maxTagCount="maxTagCount"
    :getPopupContainer="selectPopupContainer"
    :loading="pagingLoading"
    @dropdownVisibleChange="dropdownVisibleChange"
    @popupScroll="popupScroll"
    @change="onChange"
    v-on="showSearch ? { search } : {}"
    class="g-select"
  ></a-select>
</template>
<script>
import { replaceObjectKeys } from "@pansy/utils";
import { createVNode, defineComponent, onMounted, toRefs, getCurrentInstance, reactive, ref, watch } from "vue";

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
    remotePaging: {
      type: Boolean,
      default: false,
    },
    pageSize: {
      type: Number,
      default: 50,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const selectPopupContainer = (triggerNode) => {
      if (!triggerNode || !triggerNode.closest) {
        return document.body;
      }
      return triggerNode.closest(".g-layout-container") || triggerNode.closest(".layout-content") || triggerNode.parentNode;
    };
    const state = reactive({
      selectOptions: [],
      modelValue: null,
      pageNumber: 0,
      pagingLoading: false,
      hasMore: true,
      keyword: "",
    });

    const mapOptions = (data) => (props.field ? replaceObjectKeys(data, props.field) : data);

    const getData = (obj = {}, reset = true) => {
      if (props.url) {
        if (!props.remotePaging) {
          proxy.$api[props.url]({ ...props.params, ...obj }).then((res) => {
            const data = res.records ? res.records : res;
            state.selectOptions = mapOptions(data);
          });
          return;
        }
        if (state.pagingLoading || (!reset && !state.hasMore)) {
          return;
        }
        const pageNumber = reset ? 1 : state.pageNumber + 1;
        state.pagingLoading = true;
        proxy.$api[props.url]({ ...props.params, ...obj, pageNumber, pageSize: props.pageSize })
          .then((res) => {
            const data = res.records || [];
            const options = mapOptions(data);
            state.selectOptions = reset
              ? options
              : [
                  ...state.selectOptions,
                  ...options.filter((option) => !state.selectOptions.some((item) => String(item.value) === String(option.value))),
                ];
            state.pageNumber = pageNumber;
            state.hasMore = res.pages ? pageNumber < res.pages : data.length >= props.pageSize;
          })
          .finally(() => {
            state.pagingLoading = false;
          });
      } else if (props.options.length > 0) {
        state.selectOptions = mapOptions(props.options);
      }
    };

    onMounted(() => {
      state.modelValue = props.value ? props.value : props.mode === "multiple" ? [] : "";
      state.modelValue = props.value ? props.value : props.mode === "multiple" ? [] : null;
      getData();
    });

    watch(
      () => props.value,
      (n) => {
        if (props.mode === "multiple") {
          if (n == null || n === "") {
            state.modelValue = [];
          } else if (Array.isArray(n)) {
            state.modelValue = n;
          } else if (typeof n === "string") {
            state.modelValue = n.split(",");
          } else {
            state.modelValue = [n];
          }
        } else {
          state.modelValue = n;
        }
      },
    );

    watch(
      () => props.params,
      (n) => {
        // getData();
      },
    );
    watch(
      () => props.options,
      (n) => {
        // getData();
      },
    );

    const onChange = (value, option) => {
      emit("update:value", state.modelValue);
      emit("change-check", value, option);
    };

    const search = (value) => {
      state.keyword = value;
      getData({ [props.searchKey ? props.searchKey : "keyword"]: value });
    };

    const dropdownVisibleChange = () => {
      state.keyword = "";
      getData();
    };

    const popupScroll = (event) => {
      if (!props.remotePaging) {
        return;
      }
      const target = event.target;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
        getData({ [props.searchKey ? props.searchKey : "keyword"]: state.keyword }, false);
      }
    };

    return {
      ...toRefs(state),
      onChange,
      getData,
      dropdownVisibleChange,
      search,
      popupScroll,
      selectPopupContainer,
    };
  },
});
</script>
<style lang="less">
.g-select {
  &.ant-select {
    width: 218px;
  }
}
</style>
