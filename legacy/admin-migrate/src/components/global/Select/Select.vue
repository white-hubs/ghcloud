<template lang="pug">
//- @focus="handleFocus"
  @blur="handleBlur"
  @change="handleChange"
a-select(
  :showSearch="showSearch"
  :field="field"
  :disabled="disabled"
  :placeholder="placeholder"
  option-filter-prop="label"
  :size="size"
  :mode="mode"
  allowClear
  @popupScroll="popupScroll"
  @search="fetchUser")
  a-select-option(v-if="simple" v-for="item in selectOption" :value="item[checkvalue]") {{item[showValue]}}
</template>
<script lang='jsx'>
import {
  defineComponent,
  ref,
  getCurrentInstance,
  onMounted,
  watch,
} from "vue";
import request from "@/utils/request";
import { stringify } from "qs";
import { debounce } from "lodash-es";
export default defineComponent({
  props: {
    api: {
      type: String,
      default: () => {
        return "";
      },
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    options: {
      type: Array,
    },
    placeholder: {
      type: String,
      default: () => {
        return "请选择";
      },
    },
    field: {
      default: () => {
        return { name: "id", label: "name" };
      },
      type: Object,
    },
    method: {
      type: String,
      default: () => {
        return "get";
      },
    },
    simple: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    showSearch: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    size: {
      type: String,
      default: () => {
        return "default";
      },
    },
    checkvalue: {
      type: String,
      default: () => {
        return "id";
      },
    },
    showValue: {
      type: String,
      default: () => {
        return "name";
      },
    },
    disabled: {
      type: [Boolean, String, Number],
      default: () => {
        return false;
      },
    },
    mode: {
      type: String,
    },
    dataMethod: {
      type: String,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const selectOption = ref([]);
    const condition = ref({
      keyword: null,
      pageNumber: 1,
      pageSize: 1000,
    });
    const getData = async () => {
      if (props.options) {
        selectOption.value = props.options;
        return;
        // } else if (props.api) {
      } else {
        getCheckedData({
          api: props.api,
          method: props.method,
          params: { ...props.params, ...condition.value },
        });
      }
      // else if (props.dataMethod) {
      //   const method = proxy.$api[props.dataMethod];
      //   const data = await method("get", props.params);
      //   if (data && data.records) {
      //     selectOption.value = data.records;
      //   } else {
      //     selectOption.value = data;
      //   }
      // }
    };
    const getCheckedData = async (data) => {
      if (props.api) {
        request({
          url: data.api,
          method: data.method,
          params: data.params,
        }).then((res) => {
          if (res.records) {
            selectOption.value = res.records;
          } else {
            selectOption.value = res;
          }
        });
      } else if (props.dataMethod) {
        const method = proxy.$api[props.dataMethod];
        const res = await method("get", data.params);
        if (res && res.records) {
          selectOption.value = res.records;
        } else {
          selectOption.value = res;
        }
      }
    };

    const popupScroll = (e) => {
      const { target } = e;
      const result = target.scrollTop + target.offsetHeight;
      // 滚动条到底
      if (result === target.scrollHeight) {
        condition.value.pageSize += 5;
        getCheckedData({
          api: props.api,
          method: props.method,
          params: { ...props.params, ...condition.value },
        });
      }
    };

    const fetchUser = debounce((value) => {
      condition.value.keyword = value;
      const params = { ...props.params, ...condition.value };
      getCheckedData({
        api: props.api,
        method: props.method,
        params: params,
      });
    }, 1000);

    watch(
      () => condition.value.keyword,
      () => {
        fetchUser(condition.value.keyword);
      }
    );

    onMounted(() => {
      getData();
    });

    return {
      selectOption,
      popupScroll,
      fetchUser,
    };
  },
});
</script>
