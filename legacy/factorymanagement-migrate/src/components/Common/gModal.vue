<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    :confirmLoading="show"
    width="1000px"
    :title="title + '列表'"
    @cancel="close"
    @ok="close('ok')"
  >
    <a-form
      layout="inline"
      :model="form"
      class="modal-form"
      v-if="search.length > 0"
    >
      <a-form-item
        v-for="(item, index) in search"
        :label="item.label"
        :key="index"
      >
        <component
          v-model:value="form[item.value]"
          :is="item.component ? item.component : 'a-input'"
          :placeholder="item.placeholder ? item.placeholder : '请输入'"
          :options="item.options ? item.options : []"
          :field="item.field ? item.field : null"
          :url="item.url ? item.url : null"
          :style="{ width: '218px' }"
          :params="item?.params ? item.params : null"
          allowClear
        ></component>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="searchForm">查询</a-button>
      </a-form-item>
    </a-form>
    <a-table
      :rowKey="rowKey"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :scroll="{ y: 450 }"
      size="middle"
      @change="changePage"
    ></a-table>
  </a-modal>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  computed,
  unref,
  reactive,
  watch,
  getCurrentInstance,
} from "vue";

export default defineComponent({
  props: {
    visible: {
      default: false,
      type: Boolean,
    },
    activeId: {
      default: () => [],
      type: Array,
    },
    title: {
      default: "",
      type: String,
    },
    url: {
      default: "",
      type: String,
    },
    selectionType: {
      default: "checkbox",
      type: String,
    },
    search: {
      default: () => [],
      type: Array,
    },
    columns: {
      default: () => [],
      type: Array,
    },
    rowKey: {
      type: [String, Number],
      default: "id",
    },
    defaultParams: {
      default: () => {},
      type: Object,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      allList: [],
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: props.activeId,
      selected: null,
      form: {},
      pagination: {
        showTotal: (total) =>
          `共 ${total} 条   第${state.pagination.current}/${Math.ceil(
            total / state.pagination.pageSize
          )}页`,
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        type: props.selectionType,
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.allList = selectedRows;
          selectedRows.forEach((item) => {
            const index = state.selectedRows.findIndex(
              (s) => s[props.rowKey] === item[props.rowKey]
            );
            if (index === -1) {
              state.selectedRows.push(item);
            }
          });
        },
      };
    });
    watch(modalVisible, (n) => {
      if (n) {
        state.selectedRowKeys = props.activeId;
        if (n) {
          show.value = false;
        }
        getData();
      }
    });
    const getFilter = () => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item) => {
        if (state.selectedRowKeys.indexOf(item[props.rowKey]) > -1) {
          return item;
        }
      });
    };
    const getData = () => {
      props.search.forEach((item) => {
        if (item.component === "a-range-picker") {
          if (item.defaultDate) {
            const date =
              state.form.date && state.form.date.length > 0
                ? [
                    timeFormat(state.form.date[0], false),
                    timeFormat(state.form.date[1], false),
                  ]
                : [];
            if (date.length > 0) {
              state.form[item.defaultDate] = date.join(",");
            } else {
              state.form[item.defaultDate] = null;
            }
          }
        }
        if (item.component === "span") {
          if (item.defaultValue) {
            state.form[item.value] = item.defaultValue;
          }
        }
      });
      const formParams = {
        ...state.form,
        ...props.defaultParams,
        date: null,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
      };
      if (props.url) {
        proxy.$api[props.url](formParams).then((res) => {
          emit("recodes", res.records);
          state.dataSource = res.records;
          state.pagination.total = res.total;
          // state.pagination.showTotal = `共${res.total}条`;
          getFilter();
        });
      }
    };
    let show = ref(false);
    const close = (data) => {
      show.value = true;
      reset();
      if (data === "ok") {
        getFilter();
        emit("close", state.selected, state.selectedRowKeys);
      } else {
        emit("close");
      }
    };
    const changePage = (e) => {
      state.pagination.current = e.current;
      state.pagination.pageSize = e.pageSize;
      getData();
    };
    const searchForm = () => {
      state.pagination.current = 1;
      getData();
    };
    const reset = () => {
      props.search.forEach((item) => {
        state.form[item.value] = item.defaultValue ? item.defaultValue : null;
      });
      state.pagination.current = 1;
      getData();
    };
    return {
      ...toRefs(state),
      modalVisible,
      show,
      rowSelection,
      close,
      getData,
      changePage,
      reset,
      searchForm,
    };
  },
});
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}
:deep(.ant-form-inline .ant-form-item) {
  margin-bottom: 10px;
}
</style>
<style lang="less">
.modal-form {
  .ant-form-item {
    margin-bottom: 10px !important;
  }
}
</style>
