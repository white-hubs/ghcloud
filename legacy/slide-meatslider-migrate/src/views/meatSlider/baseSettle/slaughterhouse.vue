<template lang="pug">
g-table(
  title="屠宰场信息"
  editMode="page"
  :api="api"
  tableCode="SLAUGHTER_HOUSE"
  :search="search"
  :scrollX="850"
  :columns="columns"
)
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
import { DownOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, onMounted } from "vue";

export default defineComponent({
  components: {
    DownOutlined,
  },
  setup() {
    // 数据
    const state = reactive({
      columnList: [
        "slaughterhouseName",
        "abbr",
        "code",
        "address",
        "remark",
        "action",
      ],
      columns: [
        {
          mark: "slaughterhouseName",
          dataIndex: "name",
          key: "name",
          title: "屠宰场全称",
          slots: {
            customRender: "name",
          },
          // width: 105,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "abbr",
          dataIndex: "abbr",
          key: "abbr",
          title: "屠宰场简称",
          slots: {
            customRender: "abbr",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 105,
          ellipsis: true,
        }, {
          mark: "code",
          dataIndex: "code",
          key: "code",
          title: "屠宰场代码",
          slots: {
            customRender: "code",
          },
          // width: 105,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "address",
          dataIndex: "address",
          key: "address",
          title: "屠宰场地址",
          slots: {
            customRender: "address",
          },
          ellipsis: true,
          // width: 105,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "remark",
          dataIndex: "remark",
          key: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        }
      ],
      api: {
        list: "getAbattoir",
        deleteSingle: "abattoirId",
        path: "/slaughterhouseOperate",
      },
      btns: ["add", "edit", "deleteSingle"],
      search: [{ label: "", value: "keyword", placeholder: "屠宰场名称" }],
    });

    onMounted(() => {
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;

.justify-between {
  width: 100%;
  align-content: center;
}
</style>
