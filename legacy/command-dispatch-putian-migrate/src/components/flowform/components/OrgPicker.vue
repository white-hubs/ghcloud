<template>
  <a-modal
    v-model:visible.sync="modalVisible"
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
          :params="item.params ? item.params : null"
          :style="{ width: '218px !important' }"
          allowClear
        ></component>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="getData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      rowKey="id"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :scroll="{ y: 450 }"
      size="middle"
      @change="changePage"
    >
    </a-table>
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
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      modalVisible: false,
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: props.activeId,
      selected: null,
      form: {},
      pagination: {
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
    });
    // const modalVisible = computed(() => {
    //   return props.visible;
    // });
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        type: props.selectionType,
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          selectedRows.forEach((item) => {
            const index = state.selectedRows.findIndex((s) => s.id === item.id);
            if (index === -1) {
              state.selectedRows.push(item);
            }
          });
        },
      };
    });
    watch(state.modalVisible, (n) => {
      if (n) {
        state.selectedRowKeys = props.activeId;
        getData();
      }
    });
    const getFilter = () => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item) => {
        if (state.selectedRowKeys.indexOf(item.id) > -1) {
          return item;
        }
      });
    };
    const show = () => {
      state.selectedRowKeys = props.activeId;
      state.modalVisible = true;
      getData()
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
      });
      const formParams = {
        ...state.form,
        date: null,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
      };
      if (props.url) {
        proxy.$api[props.url](formParams).then((res) => {
          state.dataSource = res?.records??res;
          state.pagination.total = res.total;
          getFilter();

        });
      }
    };

    const close = (data) => {
      if (data === "ok") {
        getFilter();
        emit("close", state.selected);
      } else {
        emit("close");
      }
      state.modalVisible = false
    };
    const changePage = (e) => {
      state.pagination.current = e.current;
      state.pagination.pageSize = e.pageSize;
      getData();
    };
    const reset = () => {
      props.search.forEach((item) => {
        state.form[item.value] = item.defaultValue ? item.defaultValue : null;
      });
      getData();
    };
    return {
      ...toRefs(state),
      rowSelection,
      close,
      getData,
      changePage,
      reset,
      show,
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
