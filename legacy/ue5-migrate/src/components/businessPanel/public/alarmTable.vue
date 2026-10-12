<template>
  <div class="alarmTable">
    <RollTable :column="column" :data="listData">
      <template #status="{ record }">
        <span :class="record.status ? 'success' : 'warn'">{{
          record.status ? "已处理" : "未处理"
        }}</span>
      </template>
    </RollTable>
  </div>
</template>

<script lang="ts" setup>
// 滚动表格组件
import { reactive } from "vue";
import RollTable from "./rollTable/index.vue";
import moment from "moment";
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "time",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "level",
  },
  {
    title: "报警事件",
    dataIndex: "event",
  },
  {
    title: "状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
]);
const listData = reactive([
  {
    level: `三级`,
    time: moment().format("YYYY-MM-DD") + ` 09:07`,
    event: "车辆违停",
    status: true,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 08:54`,
    event: "电气报警",
    status: false,
  },
  {
    level: `三级`,
    time: moment().format("YYYY-MM-DD") + ` 08:23`,
    event: "车辆违停",
    status: true,
  },
  {
    level: `三级`,
    time: moment().format("YYYY-MM-DD") + ` 08:06`,
    event: "车辆违停",
    status: true,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 07:40`,
    event: "电气报警",
    status: true,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 07:22`,
    event: "电气报警",
    status: false,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 06:34`,
    event: "电气报警",
    status: true,
  },
  {
    level: `三级`,
    time: moment().format("YYYY-MM-DD") + ` 05:40`,
    event: "车辆违停",
    status: true,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 03:35`,
    event: "电气报警",
    status: true,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 04:01`,
    event: "电气报警",
    status: true,
  },
  {
    level: `四级`,
    time: moment().format("YYYY-MM-DD") + ` 04:34`,
    event: "电气报警",
    status: true,
  },
  {
    level: `三级`,
    time: moment().format("YYYY-MM-DD") + ` 04:40`,
    event: "电气报警",
    status: true,
  },
]);
</script>

<style scoped lang="less">
.header {
  display: flex;
  justify-content: space-between;
  padding: 9px 25px 9px 15px;
  background: rgba(86, 142, 255, 0.2);
  border: 1px solid rgba(86, 142, 255, 0.302);
  position: relative;

  &::after {
    content: "";
    width: 100%;
    height: 2px;
    display: block;
    background: rgba(86, 142, 255, 0.4);
    position: absolute;
    bottom: 0px;
    left: 0;
  }

  div {
    width: 25%;
  }
}

.scroll_warp {
  margin: 0 auto;
  width: 100%;
  height: 400px;
  overflow: hidden;

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 25px 9px 15px;
    margin: 0;

    .cell {
      width: 25%;

      .warring {
        color: #ffab10;
      }

      .success {
        color: #00f27b;
      }
    }
  }

  .bg_item {
    background: rgba(171, 177, 189, 0.12);
  }
}
</style>
