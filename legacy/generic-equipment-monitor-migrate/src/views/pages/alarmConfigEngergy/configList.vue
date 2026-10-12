<template>
  <g-table
    :title="pageTitle"
    :columns="columns"
    :btns="btns"
    :search="search"
    :api="api"
    :editMode="'page'"
    :scrollX="800"
    :slots="slots"
    @slot="changeStatus"
    ref="tableRef"
  >
    <template v-slot:switch="{ record }">
      <a class="action_btn" @click="toDetails(record)">删除</a>
    </template>
    <!-- <template v-slot:btn="{ record }">
      <a class="action_btn" @click="toDetails(record)">删除</a>
    </template> -->
  </g-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
  createVNode,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal, message } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: {},
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const tableRef = ref();
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      // 表头
      columns: [
        {
          title: "序号",
          dataIndex: "sort",
          customRender: ({ index }) => {
            //  return tableRef.value.page.pageSize * (tableRef.value.page.pageNumber-1) + index + 1;
            return index + 1;
          },
        },
        {
          title: "报警名称",
          dataIndex: "alarmName",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "报警级别",
          dataIndex: "alarmLevelName",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "报警设备数",
          dataIndex: "deviceNum",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "报警开关",
          dataIndex: "enabled",
          slots: {
            customRender: "enabled",
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      slots: [{ slot: "enabled", component: "a-switch" }],
      api: {
        // list: "alarmConfig",
        list: "alarm",
        deleteSingle: "alarmConfigId",
        path: "/alarmConfigureAdd",
        pathParams: [{ value: "status" }],
      }, //表格接口
      btns: ["add", "delete", "deleteSingle", "edit"],
      search: [
        {
          label: "报警级别",
          value: "alarmLevel",
          component: "g-select",
          placeholder: "请选择",
          url: "getAlarmLevels",
          field: {
            id: "value",
            name: "label",
          },
        },
        {
          label: "",
          value: "alarmName",
          placeholder: "报警名称",
        },
      ],
      //按钮选中转态
      btnStatus: "all",
    });
    //点击时候改变按钮
    const changeBtnStatus = (val) => {
      state.btnStatus = val;
    };

    //当点击查看详情，跳转到详情页面
    const toDetails = (id) => {
      router.push({ path: "/energyAlarmDetail", query: { id } });
    };
    const changeStatus = (slot, record) => {
      proxy.$api
        .updateStatus({ id: record.id, status: record.enabled }, "put")
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.reset();
        });
    };
    return {
      ...toRefs(state),
      toDetails,
      changeBtnStatus,
      changeStatus,
      tableRef,
    };
  },
});
</script>

<style lang="less" scoped>
.action_btn {
  margin-right: 10px;
}
.main {
  width: 248px;
}
</style>
