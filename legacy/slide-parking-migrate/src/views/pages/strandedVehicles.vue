<template>
  <g-table
    title="滞留车辆"
    :columns="columns"
    :search="search"
    :btns="btns"
    :api="api"
    ref="tableRef"
  ></g-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      columns: [
        {
          dataIndex: "vehicleNo",
          title: "车牌号码",
        },
        {
          dataIndex: "accessTime",
          title: "入场时间",
        },
        {
          dataIndex: "channelName",
          title: "位置",
        },
        {
          dataIndex: "imageBase",
          title: "图片",
          slots: {
            customRender: "imageBase",
          },
          customRender: ({ text }) => {
            return <a-image width="50" src={text} />;
          },
        },
      ],

      api: { list: "getStrandedVehicles" },// 滞留车辆列表
      btns: [],
      search: [
        {
          label: "",
          value: "vehicleNo",
          placeholder: "请输入车牌号码查询",
        },
        {
          label: "入场时间",
          value: "accessTime",
          defaultDate: "period",
          component: "a-range-picker",
        },
      ],
    });
    // const getData = () => {
    //   proxy.$api.getStrandedVehicles().then(res => {
    //   });
    // };
    onMounted(() => {
      // getData();
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
// 面包屑
/deep/ .layout-header {
  padding: 0 15px;
  background-color: #fff;
}
// 搜索
/deep/ .content-search {
  padding-left: 16px;
  background-color: #fff;
}
// 表格
/deep/ .content-table {
  padding: 0 16px;
  background-color: #fff;
}
// 分页
/deep/ .layout-footer {
  height: 56px !important;
  padding-left: 16px;
  margin-bottom: 16px;
  background-color: #fff;
}
</style>
