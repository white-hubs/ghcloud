<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    :api="api"
    :btns="btns"
    :search="search"
    :columns="columns"
    tableCode="broadcastCenterRecord"
    scrollX="0"
  ></g-table>
</template>

<script lang="jsx">
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

import {
defineComponent,
getCurrentInstance,
reactive, ref, toRefs
} from "vue";
// import gTable from '../../../../bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue'

export default defineComponent({
  // components:{gTable},
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "getbroadcastplayPage",
        deleteSingle: "",
      },
      btns: [],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入名称搜索",
        },
      ],
      columns: [
        {
          dataIndex: "index",
          title: "序号",
          slots: {
            customRender: "",
          },
          align: "center",
          width:50,
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "broadcastTime",
          title: "广播时间",
          width:100,
          customRender: ({text}) => {
            return moment(new Date(text)).format("YYYY-MM-DD HH:mm:ss") 
          }
        },
        {
          dataIndex: "broadcastTemplateName",
          title: "模板名称",
          width:100,
        },
        {
          dataIndex: "broadcastPlayContent",
          title: "广播内容",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "broadcastPlayNum",
          title: "广播次数",
          align: "center",
          width:80,
        },
        {
          dataIndex: "broadcastPlayDevices",
          title: "广播终端",
          width:100,
        },
        {
          dataIndex: "operatorByName",
          title: "操作人",
          width:80,
        },
        {
          dataIndex: "operatorByDeptName",
          title: "操作人部门",
          width:80,
        },
      ],
    });

    return {
      ...toRefs(state),
      tableRef,
    };
  },
});
</script>
