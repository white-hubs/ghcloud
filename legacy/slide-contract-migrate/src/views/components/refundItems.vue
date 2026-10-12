<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="1000px"
    title="选择退费项目"
    @cancel="close"
    @ok="close"
  >
    <a-form layout="inline" :model="formState" class="modal-form">
      <a-form-item label="Field A">
        <a-input
          v-model:value="formState.fieldA"
          placeholder="input placeholder"
        />
      </a-form-item>
      <a-form-item label="Field B">
        <a-input
          v-model:value="formState.fieldB"
          placeholder="input placeholder"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary">查询</a-button>
      </a-form-item>
    </a-form>
    <a-table
      rowKey="id"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :scroll="{ y: 450 }"
      size="middle"
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
  },
  setup(props, { emit }) {
    const formState = reactive({
      layout: "horizontal",
      fieldA: "",
      fieldB: "",
    });
    const columns = [
      {
        title: "档位名称",
        dataIndex: "table1",
        key: "table1",
      },
      {
        title: "档位编号",
        dataIndex: "table2",
        key: "table2",
      },
      {
        title: "收费项目",
        dataIndex: "table3",
        key: "table3",
      },
      {
        title: "计费周期",
        dataIndex: "table4",
        key: "table4",
      },
      {
        title: "周期时间",
        dataIndex: "table5",
        key: "table5",
      },
      {
        title: "金额(元)",
        dataIndex: "table5",
        key: "table5",
      },
    ];
    const state = reactive({
      dataSource: [],
      selectedRowKeys: props.activeId,
      selected: null,
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.selected = selectedRows;
        },
      };
    });
    watch(modalVisible, (n) => {
      if (n) {
        getData();
      }
    });
    const getData = () => {
      setTimeout(() => {
        state.dataSource = [
          {
            id: "iid",
            table1: "商家名称",
            table2: "联系人姓名",
            table3: "联系人手机号",
            table4: "业务角色",
            table5: "经营性质",
          },
        ];
        state.dataSource.forEach((item) => {
          if (item.id === props.activeId) {
            state.selected = item;
          }
        });
      }, 2000);
    };
    const close = () => {
      emit("close", state.selected);
    };
    return {
      ...toRefs(state),
      modalVisible,
      columns,
      rowSelection,
      formState,
      close,
      getData,
    };
  },
});
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}
</style>
