<template lang="pug">
g-table(
  :title="`租户列表`"
  :columns="columns"
  :api="api"
  :rowKey="'code'"
  :search="searchList"
  :slots="slots"
  :btns="btns"
  :scrollX="1000"
  @slot="changeSwitch"
  :permission="permission"
  :editMode="'page'")  
  template(v-slot:btn="{record}")   
    a-space(:size="16")   
      a(@click.stop="edit(record)" v-if='record.code!==0||permission.edit') 编辑
      a(@click.stop="details(record)" ) 详情
      a(@click.stop="setApp(record)" v-if='record.code!==0||permission.edit') 应用分配
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
import { useRouter } from "vue-router";
import { tableColumns } from "@/utils/common";
import { enabled } from "@/utils/enumerate";
import _ from 'lodash'

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const permission = {
      add:true,
      edit:window.config.useAdmin,
      delete:window.config.useAdmin,
      detail:true,
      deleteSingle:window.config.useAdmin,
      tableEdit:true
    }
    const state = reactive({
      columnList: [
        "code",
        "name",
        "createTime",
        "updateTime",
        "enabled",
        "action",
      ],
      columns: null,
      searchList: [
        {
          label: "所在地区",
          value: "areaIds",
          component: "AreaCascader",
        },
        {
          label: "启用状态",
          value: "enabled",
          component: "g-select",
          options: enabled,
          field: { name: "label", value: "value" },
          placeholder: "请选择",
        },
        { label: "", value: "name", component: "a-input", placeholder: "名称" },
      ],
      api: {
        list: "getTenants",
        path: "/businessOperate",
        pathParams: [{ value: "code" }],
      },
      slots: [
        {
          component: "a-switch",
          slot: "enabled",
        },
      ],
      btns: ["add"],
    });

    onMounted(() => {
      state.columns = tableColumns("tenants", state.columnList, 210);
    });

    const edit = (record) => {
      router.push({
        path: "/businessOperate",
        query: { id: record ? record.code : "" },
      });
    };

    const details = (record) => {
      router.push({
        path: "/businessDetails",
        query: {
          code: record ? record.code : "",
          type: "detail",
          id: record ? record.code : "",
        },
      });
    };

    // 分配产品--new
    const setApp = (record) => {
      router.push({
        path: "/tenantRentConfig",
        query: {
          tenantCode: record.code || record.code === 0 ? record.code : "",
        },
      });
    };

    const changeSwitch = async (slot, record) => {
      record.username = record.mobile;
      const item = _.cloneDeep(record);
      await proxy.$api.tenants(`put`, toRaw(item));
      proxy.$message.success("操作成功");
    };

    return {
      enabled,
      ...toRefs(state),
      edit,
      details,
      setApp,
      changeSwitch,
      permission,
    };
  },
});
</script>
<style scoped lang="less">
@import url("@/styles/searchTable/index.less");
</style>
