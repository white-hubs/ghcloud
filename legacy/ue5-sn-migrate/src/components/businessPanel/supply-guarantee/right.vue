<template>
  <div class="panel">
    <SubPanelTemplate title="海吉星基地" class="base-table">
      <RollTable :column="base.column" :data="base.tableData"></RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="保供产品" class="product-table">
      <RollTable :column="product.column" :data="product.tableData"></RollTable>
    </SubPanelTemplate>
  </div>
</template>
<script setup lang="ts">
import moment from "moment";
import { reactive } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
const base = reactive({
  column: [
    {
      title: "市场",
      dataIndex: "name",
    },
    {
      title: "日供应量",
      dataIndex: "supply",
    },
  ],
  tableData: [
    {
      name: "福田海吉星",
      supply: "200",
    },
    {
      name: "西安海吉星",
      supply: "150",
    },
    {
      name: "南宁海吉星",
      supply: "550",
    },
    {
      name: "柳州海吉星",
      supply: "300",
    },
    {
      name: "长沙海吉星",
      supply: "500",
    },
    {
      name: "吉林海吉星",
      supply: "200",
    },
    {
      name: "沈阳海吉星",
      supply: "300",
    },
    {
      name: "上海海吉星",
      supply: "600",
    },
    {
      name: "天津海吉星",
      supply: "200",
    },
    {
      name: "韩国墅海吉星",
      supply: "300",
    },
    {
      name: "安庆海吉星",
      supply: "350",
    },
  ],
});
const product = reactive({
  column: [
    {
      title: "保供时间",
      dataIndex: "date",
    },
    {
      title: "产品名称",
      dataIndex: "name",
    },
    {
      title: "供应量",
      dataIndex: "count",
    },
    {
      title: "基地",
      dataIndex: "baseNum",
    },
  ],
  tableData: [
    {
      date: moment().format("YYYY-MM-DD"),
      name: "白菜",
      count: "30(吨)",
      baseNum: "7(个)",
    },
    {
      date: moment().format("YYYY-MM-DD"),
      name: "白萝卜",
      count: "5(吨)",
      baseNum: "1(个)",
    },
    {
      date: moment().format("YYYY-MM-DD"),
      name: "冬瓜",
      count: "12(吨)",
      baseNum: "4(个)",
    },
    {
      date: moment().format("YYYY-MM-DD"),
      name: "西红柿",
      count: "30(吨)",
      baseNum: "7(个)",
    },
    {
      date: moment().format("YYYY-MM-DD"),
      name: "莲花白",
      count: "40(吨)",
      baseNum: "9(个)",
    },
    {
      date: moment().format("YYYY-MM-DD"),
      name: "空心菜",
      count: "15(吨)",
      baseNum: "5(个)",
    },
    {
      date: moment().format("YYYY-MM-DD"),
      name: "黄瓜",
      count: "15(吨)",
      baseNum: "6(个)",
    },
  ],
});
</script>
<style lang="less" scoped>
.panel {
  height: 100%;
  .base-table {
    height: 60%;
  }
  .product-table {
    height: 40%;
  }
}
</style>
