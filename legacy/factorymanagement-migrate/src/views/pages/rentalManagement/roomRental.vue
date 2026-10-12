<template>
  <g-table
    ref="tableRef"
    title="房间租赁"
    :columns="columns"
    :search="search"
    :api="api"
    :btns="btns"
    :editMode="'page'"
    :rowSelection="true"
  >
    <template v-slot:batch="{ record }">
      <a-popconfirm
        title="删除当前选中？"
        @confirm="deleteBatch(record)"
        :disabled="!record.length"
      >
        <a-button :disabled="!record.length" type="primary" danger>
          批量删除
        </a-button>
      </a-popconfirm>
    </template>
  </g-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import moment from "moment";

export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          title: "签订时间",
          dataIndex: "signTime",
          key: "signTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "roomNames",
          title: "租赁房间",
        },
        {
          dataIndex: "enterpriseName",
          title: "租赁企业",
        },

        {
          title: "结束时间",
          dataIndex: "endTime",
          key: "endTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "getRentalPaging", //实时出入记录
        deleteSingle: "deleteRental", //单个删除
        delete: "", //批量删除
        path: "/roomRentalAdd", //企业走访-新增
      },
      btns: ["add", "detail", "edit", "deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入房间名称搜索",
        },
        {
          label: "签订时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "signTimePeriod",
          placeholder: ["开始日期", "结束日期"],
        },
        // {
        //   label: "结束时间",
        //   value: "date",
        //   component: "a-range-picker",
        //   defaultDate: "endTimePeriod",
        // },
      ],
    });
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const deleteBatch = record => {
      proxy.$api.batchDeleteRental(record).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    onMounted(function(){});
    return {
      ...toRefs(state),
      deleteBatch,
      tableRef,
    };
  },
});
</script>

<style lang="less" scoped>
.access-record-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  .act-left {
    position: relative;
    width: 390px;
    // height: 280px;
    // background-color: aquamarine;
    box-sizing: border-box;
    margin-right: 16px;
    li {
      display: flex;
      align-items: center;
      height: 140px;
      background-color: #fff;
      &:first-child {
        margin-bottom: 16px;
      }
      .car-num {
        font-size: 32px;
        font-family: DIN Alternate-Bold, DIN Alternate;
        font-weight: bold;
        color: #333333;
        line-height: 28px;
      }
      .enter-bg {
        width: 64px;
        height: 64px;
        line-height: 64px;
        text-align: center;
        background: #fff7e6;
        border-radius: 12px;
        opacity: 1;
        margin: 0 16px;
      }
      .out-bg {
        width: 64px;
        height: 64px;
        line-height: 64px;
        text-align: center;
        background: #e9fff9;
        border-radius: 12px;
        opacity: 1;
        margin: 0 16px;
      }
      .icon-ruchangcheliang {
        font-size: 36px;
        color: #fa8c16;
      }
      .icon-chuchangcheliang {
        font-size: 36px;
        color: #00ba8b;
      }
      .enter-big {
        position: absolute;
        top: 3px;
        right: -8px;
        font-size: 120px;
        color: rgba(250, 140, 22, 0.05);
      }
      .out-big {
        position: absolute;
        bottom: -52px;
        right: -8px;
        font-size: 120px;
        color: rgba(0, 186, 139, 0.05);
      }
    }
  }
  .act-right {
    flex: 1;
    height: 296px;
    box-sizing: border-box;
    background-color: #fff;
    padding-top: 10px;
  }
}
h2 {
  margin: 0;
  margin-top: 16px;
  padding: 10px 0 10px 16px;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  color: #333333;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}
// 面包屑
:deep(.layout-header) {
  padding: 0 15px;
  background-color: #fff;
}
// 搜索
:deep(.content-search) {
  padding-left: 16px;
  background-color: #fff;
}
// 表格
:deep(.content-table) {
  padding: 0 16px;
  background-color: #fff;
}
// 分页
:deep(.layout-footer) {
  height: 56px !important;
  padding-left: 16px;
  margin-bottom: 16px;
  background-color: #fff;
}
</style>
