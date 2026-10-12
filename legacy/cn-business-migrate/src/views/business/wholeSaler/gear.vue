<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="1000px"
    title="选择档位"
    @cancel="close"
    @ok="close('ok')"
  >
    <a-form layout="inline" :model="form" class="modal-form">
      <a-form-item label="档位类型">
        <g-select
          v-model:value="form.type"
          placeholder="请选择"
          url="getBoothTypeList"
          :field="{ id: 'value', name: 'label' }"
        />
      </a-form-item>
      <a-form-item label="出租属性">
        <a-select
          v-model:value="form.leaseType"
          placeholder="请选择"
          :options="leaseType"
        />
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="form.keyword" placeholder="档位编号/档位名称" />
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

<script lang="jsx">
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
import { rentAttr, types } from "@/utils/enumerate";
import { replaceObjectKeys } from "@pansy/utils";
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
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const columns = [
      {
        title: "档位编号",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "档位名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "档位类型",
        dataIndex: "typeName",
        key: "typeName",
      },
      // {
      //     title: '所在区域',
      //     dataIndex: 'area',
      //     key: 'area',
      // },
      {
        title: "建筑面积（m²）",
        dataIndex: "builtUpArea",
        key: "builtUpArea",
      },
      {
        title: "实用面积（m²）",
        dataIndex: "practicalArea",
        key: "practicalArea",
      },
      {
        title: "出租属性",
        dataIndex: "leaseType",
        key: "leaseType",
        slots: {
          customRender: "leaseType",
        },
        customRender: ({ text }) => {
          if (text) {
            return (
              <PopOver position="topLeft" content="可租">
                可租
              </PopOver>
            );
          } else {
            return (
              <PopOver position="topLeft" content="不可租">
                不可租
              </PopOver>
            );
          }
        },
      },
      {
        title: "档位状态",
        dataIndex: "enabled",
        key: "enabled",
        slots: {
          customRender: "enabled",
        },
        customRender: ({ text }) => {
          if (text) {
            return (
              <PopOver position="topLeft" content="启用">
                启用
              </PopOver>
            );
          } else {
            return (
              <PopOver position="topLeft" content="禁用">
                禁用
              </PopOver>
            );
          }
        },
      },
    ];
    const state = reactive({
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: props.activeId,
      selected: null,
      form: {
        leaseType: null,
        type: null,
        keyword: null,
      },
      pagination: {
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
      leaseType: replaceObjectKeys(rentAttr, {
        name: "label",
        value: "value",
      }),
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          selectedRows.forEach((item) => {
            const index = state.selectedRows.findIndex((s) => s.id === item.id);
            if (index === -1) {
              state.selectedRows.push(item);
            }
          });
        },
        getCheckboxProps: (record) => ({
          disabled: !record.enabled || !record.leaseType,
          name: record.name,
        }),
      };
    });
    watch(modalVisible, (n) => {
      if (n) {
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
    const getData = () => {
      const params = {
        keyword: state.form.keyword,
        type: state.form.type,
        leaseType: state.form.leaseType,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
      };
      proxy.$api.getLeasePage( params).then((res) => {
        state.dataSource = res.records;
        state.pagination.total = res.total;
        getFilter();
      });
    };

    const close = (data) => {
      if (data === "ok") {
        getFilter();
        emit("close", state.selected);
      } else {
        emit("close");
      }
    };
    const changePage = (e) => {
      state.pagination.current = e.current;
      state.pagination.pageSize = e.pageSize;
      getData();
    };
    const reset = () => {
      state.form = {
        keyword: null,
        leaseType: null,
        type: null,
      };
      getData();
    };
    return {
      ...toRefs(state),
      modalVisible,
      columns,
      rowSelection,
      close,
      getData,
      changePage,
      reset,
    };
  },
});
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}
</style>
