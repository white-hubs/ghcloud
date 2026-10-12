<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="1000px"
    title="选择商家"
    @cancel="close"
    @ok="close('ok')"
  >
    <a-form layout="inline" :model="form" class="modal-form">
      <a-form-item label="认证状态">
        <a-select placeholder="认证状态" v-model:value="form.status" allowClear>
          <a-select-option
            v-for="item in AuthenticationStatus"
            :value="item.value"
            :key="item.value"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-input
          v-model:value.trim="form.keyword"
          placeholder="商家名称"
          allowClear
          :maxlength="20"
        />
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
      size="middle"
      :scroll="{ y: 450 }"
      @change="changePage"
    >
    </a-table>
  </a-modal>
</template>

<script lang='jsx'>
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
import {
  businessRole,
  natureOperation,
  AuthenticationStatus,
} from "@/utils/enumerate";
export default defineComponent({
  props: {
    visible: {
      default: false,
      type: Boolean,
    },
    activeId: {
      default: "",
      type: String,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const columns = [
      {
        title: "商家名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "联系人姓名",
        dataIndex: "liaison",
        key: "liaison",
      },
      {
        title: "联系人手机号",
        dataIndex: "phone",
        key: "phone",
      },
      {
        mark: "status",
        dataIndex: "status",
        key: "status",
        title: "认证状态",
        slots: {
          customRender: "status",
        },
        // width: 90,
        ellipsis: true,
        customRender: ({ text, index }) => {
          if (text === "AUDITED") {
            return <g-table-dot content="待审核" status="audit" />;
          } else if (text === "CERTIFIED") {
            return <g-table-dot content="已认证" />;
          } else if (text === "FAILED") {
            return <g-table-dot content="不通过" status="delete" />;
          } else {
            return <g-table-dot content="未认证" status="audit" />;
          }
        },
      },
    ];
    const state = reactive({
      dataSource: [],
      selectedRowKeys: [props.activeId],
      selected: null,
      natureOperation: natureOperation,
      AuthenticationStatus: AuthenticationStatus,
      businessRole: businessRole,
      form: {
        keyword: null,
        bizType: null,
        type: null,
        status: null,
      },
      pagination: {
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
        type: "radio",
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.selected = selectedRows[0];
        },
      };
    });
    watch(modalVisible, (n) => {
      if (n) {
        getData();
      }
    });
    const getData = () => {
      const params = {
        keyword: state.form.keyword,
        type: state.form.type,
        status: state.form.status,
        bizType: state.form.bizType,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
      };
      proxy.$api.merchant( params).then((res) => {
        state.dataSource = res.records;
        state.pagination.total = res.total;
        state.dataSource.forEach((item) => {
          if (item.id === props.activeId) {
            state.selected = item;
          }
        });
      });
    };
    const close = (data) => {
      if (data === "ok") {
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
        bizType: null,
        type: null,
        status: null,
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
