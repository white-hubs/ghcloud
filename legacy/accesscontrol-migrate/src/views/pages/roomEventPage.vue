<template>
  <div class="eventPage">
    <g-table
      tableCode="ROOM_EVENT"
      ref="tableRef"
      title="异常事件"
      :columns="columns"
      :btns="btns"
      :search="search"
      :api="api"
      :editMode="'page'"
    ></g-table>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
} from "vue";
import moment from "moment";

export default defineComponent({
  name: "",
  setup() {
    const data = reactive({
      columns: [
        {
          title: "时间",
          dataIndex: "eventTime",
          key: "eventTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""}
              >
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "门禁名称",
          dataIndex: "doorName",
          key: "doorName",
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
          title: "异常事件描述",
          dataIndex: "eventType",
          key: "eventType",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        list: "getAbnormalEvent",
        deleteSingle: "",
        delete: "",
        path: "",
      },
      search: [
        //企业名称搜索
        {
          label: "",
          value: "keyword",
          placeholder: "请输入门禁名称搜索",
        },
        {
          label: "时间范围",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
      ],
      btns: [],
    });
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
    });
    return {
      ...toRefs(data),
      moment,
    };
  },
});
</script>
<style scoped lang="less">
:deep(.ant-table-column-title) {
  font-weight: bold !important;
}
.eventPage {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
