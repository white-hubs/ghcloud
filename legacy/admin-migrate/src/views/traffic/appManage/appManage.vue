<template lang="pug">  
g-table(
  title="应用列表"
  :columns="columns"
  :api="api"
  :scrollX="null"
  editMode="page"
  :search="search"
  :permission="permission"
)
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { tableColumns } from "@/utils/common";


export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const permission = {
      add:window.config.useAdmin,
      edit:true,
      delete:window.config.useAdmin,
      detail:true,
      deleteSingle:window.config.useAdmin,
      tableEdit:window.config.useAdmin
    }
    const state = reactive({
      columnList: [
        "id",
        "name",
        "productLineName",
        "enabled",
        "createTime",
        "updateTime",
        "action",
      ],
      columns: null,
      api: {
        list: "appList",
        path: "/addApp",
      },
      search: [
        { label: "", value: "keyword", placeholder: `应用名称/企业租户` },
      ],
    });

    const edit = (record) => {
      router.push({
        path: "/enterpriseLease",
        query: {
          tenantId: record.id ? record.id : "",
        },
      });
    };

    const addMenu = (record) => {
      router.push({
        path: "/addAppMenu",
        query: {
          id: record.id ? record.id : "",
        },
      });
    };

    onMounted(() => {
      state.columns = tableColumns("appList", state.columnList);
    });

    return {
      ...toRefs(state),
      edit,
      addMenu,
      permission,
    };
  },
});
</script>
