<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="1000px"
    title="人员列表"
    @cancel="close"
    @ok="close('ok')"
  >
    <a-form layout="inline" :model="form" class="modal-form">
      <a-form-item label="所属部门" name="organizationId">
        <g-select url="deptList" v-model:value="form.organizationId" placeholder="请选择部门" style="width:200px"></g-select>
      </a-form-item>
      <a-form-item label="">
        <a-input
          v-model:value.trim="form.keyword"
          placeholder="请输入人员姓名"
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
import {
  businessRole,
  natureOperation,
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
        title: "姓名",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "联系人手机号",
        dataIndex: "mobile",
        key: "mobile",
      },
      {
          title: "性别",
          dataIndex: "gender",
          key: "gender",
          slots:{
              customRender:"gender"
          },
          customRender:({text}) =>{
            const genderValues = {
              MALE: '男',
              FEMALE: '女',
              NONE: '保密'
            }
            return text ? genderValues[text] : '--';
          }
      },
      {
          title: "状态",
          dataIndex: "enabled",
          key: "enabled",
          customRender:({text}) =>{
              return text?"启用":"禁用"
          }
      },
    ];
    const state = reactive({
      dataSource: [],
      selectedRowKeys: [props.activeId],
      selected: null,
      natureOperation: natureOperation,
      businessRole: businessRole,
      form: {
        keyword: null,
        organizationId: null,
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
        state.selectedRowKeys = [props.activeId]
        getData();
      }
    });
    const getData = () => {
      const params = {
        keyword: state.form.keyword,
        organizationId: state.form.organizationId,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
      };
      proxy.$api.tenantUsers( params).then((res) => {
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
