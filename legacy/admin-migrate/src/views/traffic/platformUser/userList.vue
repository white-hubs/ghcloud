<template lang="pug">
g-table(
  ref="tableRef"
  title="用户列表"
  :columns="columns"
  :permission="permission"
  :api="api"
  :rowKey="'id'"
  :modal="modal"
  :btns="btns"
  :rules="rules"
  :search="search"
  :slots="slots"
  :beforeSave="beforeSave"
  :beforeGet="beforeGet"
  @slot="changeSwitch")         
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  toRaw,
  onMounted,
} from "vue";
import { tableColumns } from "@/utils/common";
import { enabled, gender } from "@/utils/enumerate";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const permission = {
      add:true,
      edit:true,
      delete:window.config.useAdmin,
      detail:window.config.useAdmin,
      deleteSingle:window.config.useAdmin,
      tableEdit:window.config.useAdmin
    }
    const state = reactive({
      columnList: [
        "id",
        "name",
        "gender",
        "mobile",
        "createTime",
        "lastLoginTime",
        "enabled",
        "action",
      ],
      columns: null,
      slots: [{ slot: "enabled", component: "a-switch" }],
      rules: {
        name: [{ required: true, message: "请输入姓名" }],
        mobile: [
          { required: true, message: "请输入手机号" },
          {
            pattern: new RegExp(/^1[3|4|5|7|8|9][0-9]{9}$/, "g"),
            message: "请输入正确的电话",
          },
        ],
      },
      btns: ["edit", "add"],
      modal: [
        { label: "姓名", value: "name", placeholder: "请输入姓名" },
        { label: "手机号", value: "mobile", placeholder: "请输入手机号" },
        {
          label: "性别",
          value: "gender",
          component: "a-radio-group",

          options: [
            { value: "NONE", label: "保密" },
            { value: "MALE", label: "男" },
            { value: "FEMALE", label: "女" },
          ],
          defaultValue: "NONE",
        },
        {
          label: "状态",
          value: "enabled",
          component: "a-switch",

          defaultValue: true,
        },
      ],
      api: {
        list: "getUserList",
        add: "userOperate",
        edit: "userOperate",
        detail: "record",
      },
      search: [
        {
          label: "性别",
          value: "gender",
          component: "g-select",
          options: gender,
          field: { value: "value", name: "label" },
          placeholder: "请选择",
        },
        {
          label: "启用状态",
          value: "enabled",
          component: "g-select",
          placeholder: "请选择",
          options: enabled,
          field: { value: "value", name: "label" },
        },
        {
          label: "类型",
          value: "isAdmin",
          component: "g-select",
          placeholder: "请选择",
          options: [
            {
              value: true,
              name: "管理员",
            },
            {
              value: false,
              name: "普通员工",
            }
          ],
          field: { value: "value", name: "label" },
          defaultValue: true,
        },
        { label: "", value: "keyword", placeholder: "姓名" },
      ],
    });

    onMounted(() => {
      state.columns = tableColumns("userList", state.columnList, 120);
    });

    const changeSwitch = async (slot, record) => {
      record.username = record.mobile;
      const item = _.cloneDeep(record);
      await proxy.$api.userOperate(`put`, toRaw(item));
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    const beforeSave = (record) => {
      Object.assign(record, { username: record.mobile });
      return record;
    };

    const beforeGet = (params) => {
      return params;
    };

    return {
      tableRef,
      ...toRefs(state),
      changeSwitch,
      beforeSave,
      beforeGet,
      permission
    };
  },
});
</script>
<style scoped lang="less">
@import url("@/styles/searchTable/index.less");
</style>
  