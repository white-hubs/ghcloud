<template>
  <div>
    <!-- 能碳概览 -->
    <div class="visiting-data">
      <SubPanelTemplate title="能碳概览" zoomable zoom-title="能碳概览详情" :zoom-width="600">
        <template #extra>
          <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime" data-no-zoom></DateInlineForm>
        </template>
        <div class="item" v-for="item in visitingData" :key="item.title" data-no-zoom>
          <a-statistic :title="item.title">
            <template #formatter>
              <count-to :startVal="0" :endVal="item.value" :duration="1000" separator=""></count-to>
              <div class="ringRatio">
                <span>环比</span>
                <!-- uptriangle 向上三角根据Prop改变 -->
                <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
                <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
              </div>
            </template>
          </a-statistic>
        </div>
        <template #zoom-content>
          <div class="zoom-visiting-data">
            <div class="zoom-item" v-for="item in visitingData" :key="item.title">
              <a-statistic :title="item.title">
                <template #formatter>
                  <count-to :startVal="0" :endVal="item.value" :duration="1000" separator=""></count-to>
                  <div class="zoom-ringRatio">
                    <span>环比</span>
                    <div :class="['zoom-downtriangle', item.ratio > 0 && 'zoom-uptriangle']"></div>
                    <div :class="[item.ratio > 0 ? 'zoom-up' : 'zoom-down']">{{ item.ratio + "%" }}</div>
                  </div>
                </template>
              </a-statistic>
            </div>
          </div>
        </template>
      </SubPanelTemplate>
    </div>

    <!-- 综合能耗趋势 -->
    <SubPanelTemplate title="综合能耗趋势" zoomable zoom-title="综合能耗趋势详情">
      <template #extra>
        <DateInlineForm
          :timeList="timeList"
          v-model:modelValue="energyConsumption"
          @search="changeHandleEnergyConsumptionTime"
          data-no-zoom
        >
        </DateInlineForm>
      </template>
      <div class="chart" data-no-zoom>
        <LineChart
          :x-data="receptionTrendsChartData.xData"
          :series="receptionTrendsChartData.yData"
          :showLegend="false"
          gridTop="4"
          :unit="{ x: '', y: '' }"
        />
      </div>
      <template #zoom-content>
        <div class="zoom-chart-container">
          <LineChart
            :x-data="receptionTrendsChartData.xData"
            :series="receptionTrendsChartData.yData"
            :showLegend="false"
            gridTop="10"
            :unit="{ x: '', y: '' }"
            :height="380"
          />
        </div>
      </template>
    </SubPanelTemplate>

    <!-- 碳排量趋势图 -->
    <SubPanelTemplate title="碳排量趋势图" zoomable zoom-title="碳排量趋势图详情">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="carbonTime" @search="changeCarbonTime" data-no-zoom> </DateInlineForm>
      </template>
      <div class="chart" data-no-zoom>
        <LineChart
          :x-data="carbonEmissionsData.xData"
          :series="carbonEmissionsData.yData"
          :showLegend="false"
          gridTop="4"
          :unit="{ x: '', y: '' }"
        />
      </div>
      <template #zoom-content>
        <div class="zoom-chart-container">
          <LineChart
            :x-data="carbonEmissionsData.xData"
            :series="carbonEmissionsData.yData"
            :showLegend="false"
            gridTop="10"
            :unit="{ x: '', y: '' }"
            :height="380"
          />
        </div>
      </template>
    </SubPanelTemplate>

    <!-- 报警记录 -->
    <SubPanelTemplate title="报警记录" zoomable zoom-title="报警记录详情">
      <template #extra>
        <DateInlineForm v-model:modelValue="takeNotes" @search="changeTakeNotes" data-no-zoom></DateInlineForm>
      </template>
      <div class="body" data-no-zoom>
        <OperateDays title="报警总数" :value="alarmCon.count" class="body-num"></OperateDays>
        <div class="pie-chart">
          <Pie :data="alarmsNumber" :x-data="pieData" />
          <TipsCount v-for="(item, index) in pieData" :status="String(index)" :count="item.value" />
        </div>
        <div class="footer">
          <RollTable :column="column" :data="listData" @click-row="handelClickRow">
            <template #alarmStatus="{ record }">
              <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
              <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
              <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
            </template>
          </RollTable>
        </div>
      </div>
      <template #zoom-content>
        <div class="zoom-alarm-body">
          <OperateDays title="报警总数" :value="alarmCon.count" class="zoom-body-num"></OperateDays>
          <div class="zoom-pie-chart">
            <Pie :data="alarmsNumber" :x-data="pieData" class="zoom-pie" />
            <div class="zoom-tips-wrapper">
              <TipsCount v-for="(item, index) in pieData" :status="String(index)" :count="item.value" class="zoom-tips" />
            </div>
          </div>
          <div class="zoom-footer">
            <RollTable :column="column" :data="listData" @click-row="handelClickRow" class="zoom-roll-table">
              <template #alarmStatus="{ record }">
                <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
                <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
                <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
              </template>
            </RollTable>
          </div>
        </div>
      </template>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import DateInlineForm from "../public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import Pie from "../public/pie.vue";
import RollTable from "../public/rollTable/index.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import TipsCount from "../public/tipsCount.vue";
import { ModelValueItf } from "../public/types";
import { dcStatTrend, statCategoryAll, statTimeCategory } from "@/api/energy";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import useCommon from "@/components/hooks/useCommon";
import { useStateStore } from "@/pages/state/use-state-store";
import bus from "@/utils/bus";
import { getAssetsImage } from "@/utils/getImage";

const workOrderTime = ref<ModelValueItf>();
const energyConsumption = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [""],
});
const carbonTime = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [""],
});
let alarmsNumber = ref<number>(0);
const timeList = [
  { label: "本周", value: "THIS_WEEK" },
  { label: "本月", value: "THIS_MONTH" },
  { label: "今年", value: "THIS_YEAR" },
];
const pieData = ref([]);
const listData = ref([]);
const alarmCon = ref({
  count: 0,
  ratio: 10,
});
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const { takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
const { globalState } = useStateStore();

// 群控组实时数据
const visitingData = ref([
  { title: "综合能耗tce", value: 0, img: getAssetsImage("overView43.png"), ratio: 0 },
  { title: "碳排量kg CO₂e", value: 0, img: getAssetsImage("overView12.png"), ratio: 0 },
]);
const carbonEmissionsData = reactive({
  xData: [],
  yData: [{ data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" }],
});
const receptionTrendsChartData = reactive({
  xData: [],
  yData: [{ data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" }],
});
// 综合能耗趋势
const changeHandleEnergyConsumptionTime = async () => {
  const params = {
    period: energyConsumption.value.dateRange.join(","),
    type: energyConsumption.value.timeType,
  };
  let res = await dcStatTrend(params);
  receptionTrendsChartData.xData = res.map((item) => item.time);
  receptionTrendsChartData.yData[0].data = res.map((item) => item.value);
};
const changeCarbonTime = async () => {
  const params = {
    period: carbonTime.value.dateRange.join(","),
    type: carbonTime.value.timeType,
    instrumentType: "electricity_meter",
  };
  const res = await statTimeCategory(params);
  carbonEmissionsData.xData = res.map((item) => item.time);
  carbonEmissionsData.yData[0].data = res.map((item) => item.value);
};
// 能碳概览
const changeHandleworkOrderTime = async () => {
  const params = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
  };
  let res = await statCategoryAll(params);
  res.forEach((item) => {
    if (item.instrumentType === "carbon") {
      visitingData.value[1].value = item.value;
      visitingData.value[1].ratio = item.qoqValueRate || 0;
    } else if (item.instrumentType === "zh") {
      visitingData.value[0].value = item.value;
      visitingData.value[0].ratio = item.qoqValueRate || 0;
    }
  });
};

// 报警记录
async function changeTakeNotes() {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let data = await getAlarmTakeNotes(param);
  alarmCon.value = await getAlarmsNumber(param);
  listData.value = data.listData;
  alarmsNumber.value = data.alarmsNumber;
  pieData.value = data.pieData?.filter((item) => !item.name.includes("超时"));
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
</script>
<style lang="less" scoped>
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 50%;
      height: 60px;
      margin-top: 10px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 20px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #d0deee;
          font-size: 12px;
          margin: 0;
        }
      }

      .ringRatio {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #d0deee;
      }

      .downtriangle {
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #d2fff3;
        margin: 0 3px;
        transform: rotate(180deg);
      }

      .uptriangle {
        border-bottom: 8px solid #ffcece;
        transform: rotate(0deg);
      }

      .down {
        color: #2ae8bd;
        font-family: Roboto-Regular, Roboto;
      }

      .up {
        color: #f14545;
        font-family: Roboto-Regular, Roboto;
      }
    }
  }
}

.pie-chart {
  display: flex;
  height: 100px;
  justify-content: center;

  > div {
    width: 100px;
    align-items: center;
    margin-left: 10px;
  }
}

// 放大弹窗内的样式
.zoom-visiting-data {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 30px;

  .zoom-item {
    width: 48%;
    height: 100px;
    margin-top: 20px;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 30px;
    background: rgba(20, 29, 42, 0.4);
    border: 1px solid rgba(156, 176, 204, 0.14);
    border-radius: 4px;

    :deep(.ant-statistic) {
      display: inline-flex;
      flex-flow: column-reverse;

      .ant-statistic-content {
        height: 45px;

        .ant-statistic-content-value {
          color: #fff;
          font-size: 36px;
          font-weight: 400;
          position: relative;
          top: -35px;
        }
      }

      .ant-statistic-title {
        color: #d0deee;
        font-size: 16px;
        margin: 0;
      }
    }
  }
}

.zoom-ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
}

.zoom-downtriangle {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #d2fff3;
  margin: 0 5px;
  transform: rotate(180deg);
}

.zoom-uptriangle {
  border-bottom: 10px solid #ffcece;
  transform: rotate(0deg);
}

.zoom-down {
  color: #2ae8bd;
  font-family: Roboto-Regular, Roboto;
  font-size: 16px;
}

.zoom-up {
  color: #f14545;
  font-family: Roboto-Regular, Roboto;
  font-size: 16px;
}

.zoom-chart-container {
  padding: 20px;
  height: 400px;
}

.zoom-alarm-body {
  padding: 20px;
  min-height: 500px;

  .zoom-body-num {
    margin-bottom: 20px;
  }
}

.zoom-pie-chart {
  display: flex;
  height: 180px;
  justify-content: center;
  margin: 20px 0;

  .zoom-pie {
    width: 180px;
    height: 180px;
  }

  .zoom-tips-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 20px;

    .zoom-tips {
      margin: 5px 0;
      font-size: 16px;
    }
  }
}

.zoom-footer {
  margin-top: 20px;

  .zoom-roll-table {
    font-size: 16px;
  }
}
</style>
