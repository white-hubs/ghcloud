<template>
  <gLayout title="照明时控" :showfooter="false">
    <template #header-btn>
      <!-- <Button type="primary">新增</Button> -->
    </template>
    <template #content-search>
      <div class="queryCondition">
        <div>选择日期:</div>
        <DatePicker placeholder="请选择日期" format="YYYY-MM-DD" :disabled-date="disabledDate"
          v-model:value="TimeControlData.period" />
        <Button type="primary" @click="queryList">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
    </template>
    <template #content-table>
      <div style="height: calc(100vh - 330px)">
        <AliasTable :columns="columns" :data-source="TimeControlListData" :scroll=" {x: 1000,y: 550}" :scrollY="500"
          :scrollX="1000" :pagination="false" applicationCode="INTELLIGENT_LIGHTING" tableCode="TIME_CONTROL"
          size="small" bordered />
        <!-- <Table
          :columns="columns"
          :data-source="TimeControlListData"
          :scroll="{ y: 550 }"
          bordered
          :pagination="false"
          @change="onLogShowSizeChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'controlTime'">
              {{ text }}
            </template>
<template v-if="column.dataIndex === 'openGate'">
              {{ text == 1 ? "开" : "关" }}
            </template>
<template v-if="column.dataIndex === 'objectType'">
              {{ text == "DEVICE_GROUP" ? "群组" : "单设备" }}
            </template>
<template v-if="column.dataIndex === 'result'">
              {{ text == "" ? "--" : text }}
            </template>
</template>
</Table> -->
      </div>
      <Pagination style="float: right; margin-bottom: 15px" show-size-changer
        v-model:current="TimeControlData.pageNumber" v-model:pageSize="TimeControlData.pageSize" :showTotal="
          (total:number) =>
            `共 ${total} 条   第${TimeControlData.pageNumber}/${Math.ceil(
              total / TimeControlData.pageSize,
            )}页`
        " :total="TimeControlData.total" @change="onShowSizeChange" />
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import {
  Button,
  DatePicker,
  Table,
  Pagination,
  TableColumnsType,
  Select,
  TablePaginationConfig,
  Popover,
} from "ant-design-vue";
import gLayout from "@/components/common/gLayout.vue";
import { GetTimeControlLogs } from "~/src/api/timeControl";
import { AliasTable } from '@ghcloud/generic-component'
import { h, reactive, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const options = ref(
  [...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) })),
);
const reset = () => {
  TimeControlData.period = dayjs(dayjs(), "YYYY-MM-DD");
  queryList();
};
const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today

  return current && current <= dayjs().subtract(1, "days").endOf("day");
};
const TimeControlData = reactive<{
  period: Dayjs;
  pageNumber: number | undefined;
  pageSize: number;
  total: number;
}>({
  period: dayjs(dayjs(), "YYYY-MM-DD"),
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});

/**获取列表 */
const TimeControlListData = ref<Array<TimeControl.TimeControlListType>>([]);

const getTimeList = async () => {
  let newTimeControlData = JSON.parse(JSON.stringify(TimeControlData));
  newTimeControlData.period = `${
    dayjs(newTimeControlData.period).format("YYYY-MM-DD ") + "00:00:00"
  },${dayjs(newTimeControlData.period).format("YYYY-MM-DD ") + "23:59:59"}`;
  GetTimeControlLogs(newTimeControlData).then(res => {
    TimeControlData.total = res.data.total;
    TimeControlListData.value = res.data.records;
  });
};
const onShowSizeChange = (current: number, pageSize: number) => {
  TimeControlData.pageNumber = current;
  TimeControlData.pageSize = pageSize;
  getTimeList();
};
getTimeList();
const onLogShowSizeChange = (pag: any) => {
  TimeControlData.pageNumber = pag.current;
  TimeControlData.pageSize = pag.pageSize;
  getTimeList();
};
const columns: TableColumnsType = [
  {
    title: "计划时间",
    dataIndex: "controlTime",
    align: "center",
    key: "controlTime",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "对象类型",
    dataIndex: "objectType",
    align: "center",
    key: "objectType",
    customRender: ({ text }) => {
      const value=text == "DEVICE_GROUP" ? "群组" : "单设备"
      return [
        h(Popover, { content: value }, { default: () => value as string || '--' })
      ]
    }
  },
  {
    title: "规则对象",
    dataIndex: "objectName",
    align: "center",
    key: "objectName",
  },
  {
    title: "开关控制",
    dataIndex: "openGate",
    align: "center",
    key: "openGate",
    customRender: ({ text }) => {
      const value=text == 1 ? "开" : "关" 
      return [
        h(Popover, { content: value }, { default: () => value as string || '--' })
      ]
    }
  },
  {
    title: "光照度（%）",
    dataIndex: "brightness",
    align: "center",
    key: "brightness",
  },
  {
    title: "执行结果",
    dataIndex: "result",
    align: "center",
    key: "result",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
];
/**查询 */
const queryList = () => {
  getTimeList();
};

const addGroupControl = () => {
  history.pushState({},'',`/portal/IntelligentLighting/timeControlHandle?type=add`)
};
</script>

<style scoped lang="less">
.queryCondition {
  width: 374px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
