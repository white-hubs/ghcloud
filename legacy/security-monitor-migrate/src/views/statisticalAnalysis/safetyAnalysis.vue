<template>
  <div class="statistic">
    <g-layout-no-footer :title="pageTitle">
      <template #header-btn>
        <time-radio-group v-model:value="period" @change="changeDate"></time-radio-group>
      </template>
      <template #content-table>
        <div class="statistic-content">
          <div class="grid-container">
            <div class="item-box item-box1">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1, padding: '8px 16px' }"
                title="基本信息"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <div class="card-body-box flex-column">
                  <div class="total-box flex-start">
                    <div class="total-item flex-center">
                      <div class="icon-img flex-center" :style="{ background: '#E6FFFB' }">
                        <icon-font type="icon-jianceshebei1" :style="{ 'font-size': '40px', color: '#13C2C2' }" />
                      </div>
                      <a-statistic title="监测设备正常数" :value="deviceStatusNum('ONLINE') || 0"></a-statistic>
                    </div>
                    <div class="line"></div>
                    <div class="total-item flex-center">
                      <div class="icon-img flex-center" :style="{ background: '#FFEEEE' }">
                        <icon-font type="icon-baojing" :style="{ 'font-size': '40px', color: '#F53F3F' }" />
                      </div>
                      <a-statistic title="监测报警数" :value="baseInfo.alarmNum || 0">
                        <template #suffix>
                          <span class="name">环比</span>
                          <arrow-up-outlined v-if="baseInfo.ringRatio > 0" style="color: #3f8600; font-size: 16px" />
                          <arrow-down-outlined v-if="baseInfo.ringRatio < 0" style="color: #f53f3f; font-size: 16px" />
                          <span class="prop">
                            {{ baseInfo.ringRatio + "%" }}
                          </span>
                        </template>
                      </a-statistic>
                    </div>
                  </div>
                  <div class="chart-box">
                    <pie-chart :data="leaveAlarm.data" :nameData="leaveAlarm.nameData" :baseInfo="leaveAlarm.baseInfo"></pie-chart>
                  </div>
                </div>
              </a-card>
            </div>
            <div class="item-box item-box2">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1, padding: '8px 16px' }"
                title="报警分析"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <curve-chart :xData="alarm.xData" :series="alarm.series" x-axis-preformatted></curve-chart>
              </a-card>
            </div>
            <div class="item-box item-box3">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1, padding: '8px 16px' }"
                title="报警事件分析"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <div class="card-body-box flex-column" v-if="alarmEvent.series[0].data.length > 0">
                  <div class="description top-description" v-if="alarmEvent.alarmTopNum">
                    <span class="blue">
                      {{ alarmEvent.alarmTopThreeEventNames }}
                    </span>
                    报警事件高发,
                    <span class="blue">{{ alarmEvent.alarmTopEventName }}</span>
                    报警事件已发生
                    <span class="value">{{ alarmEvent.alarmTopNum }}</span>
                    次
                  </div>
                  <div class="chart-box">
                    <line-chart :xData="alarmEvent.xData" :series="alarmEvent.series"></line-chart>
                  </div>
                </div>
                <a-empty v-else></a-empty>
              </a-card>
            </div>
            <div class="item-box item-box4">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1, padding: '8px 16px' }"
                title="报警区域分析"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <div class="card-body-box flex-column" v-if="areaAlarm.series[0].data.length > 0">
                  <div class="description top-description" v-if="areaAlarm.alarmTopNum">
                    <span class="blue">
                      {{ areaAlarm.alarmTopThreeAreaNames }}
                    </span>
                    报警事件高发,
                    <span class="blue">{{ areaAlarm.alarmTopAreaName }}</span>
                    报警事件已发生
                    <span class="value">{{ areaAlarm.alarmTopNum }}</span>
                    次
                  </div>
                  <div class="chart-box">
                    <line-chart :xData="areaAlarm.xData" :series="areaAlarm.series"></line-chart>
                  </div>
                </div>
                <a-empty v-else></a-empty>
              </a-card>
            </div>
          </div>
        </div>
      </template>
    </g-layout-no-footer>
  </div>
</template>

<script lang="jsx">
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons-vue";
import Moment from "moment";
import { computed, defineComponent, getCurrentInstance, reactive, toRefs } from "vue";

import { usePageName } from "@ghcloud/cube-utils";

import curveChart from "../components/echart/curveChart.vue";
import LineChart from "../components/echart/lineChart.vue";
import pieChart from "../components/echart/pieChart.vue";
import timeRadioGroup from "./components/timeRadioGroup.vue";
import { leaveAalrmColor } from "@/utils/enumerate";

const weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const trendTypes = {
  TODAY: "TODAY",
  THIS_WEEK: "THIS_WEEK",
  THIS_MONTH: "MONTH",
  THIS_YEAR: "YEAR",
};
const alarmLevelOrder = {
  one_level: 1,
  two_level: 2,
  three_level: 3,
  four_level: 4,
  一级: 1,
  二级: 2,
  三级: 3,
  四级: 4,
};

const sortAlarmLevels = (levels) =>
  [...levels].sort(
    (left, right) =>
      (alarmLevelOrder[left.code] ?? alarmLevelOrder[left.name] ?? 99) - (alarmLevelOrder[right.code] ?? alarmLevelOrder[right.name] ?? 99),
  );

const formatWeekPeriod = (period, datePeriod) => {
  const fullDate = Moment(period, ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss"], true);
  if (fullDate.isValid()) {
    return weekLabels[fullDate.isoWeekday() - 1];
  }

  const dayOfMonth = Number(period);
  const [begin, end] = datePeriod.split(",");
  const current = Moment(begin).startOf("day");
  const endDate = Moment(end).endOf("day");

  while (current.isSameOrBefore(endDate, "day")) {
    if (current.date() === dayOfMonth) {
      return weekLabels[current.isoWeekday() - 1];
    }
    current.add(1, "day");
  }

  return period;
};

const formatTrendPeriod = (period, type, datePeriod) => {
  if (type === "TODAY") {
    return `${period}时`;
  }
  if (type === "THIS_WEEK") {
    return formatWeekPeriod(period, datePeriod);
  }
  if (type === "THIS_MONTH") {
    return `${period}日`;
  }
  if (type === "THIS_YEAR") {
    return `${period}月`;
  }
  return period;
};

export default defineComponent({
  components: {
    ArrowUpOutlined,
    ArrowDownOutlined,
    timeRadioGroup,
    pieChart,
    curveChart,
    LineChart,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      period: "",
      baseInfo: {},
      deviceNum: {
        total: 0,
        statusListVos: [],
      },
      leaveAlarm: {
        data: [],
        nameData: [],
        baseInfo: [],
        total: 0,
      },
      alarm: {
        xData: [],
        series: [],
      },
      alarmEvent: {
        xData: [],
        series: [{ data: [] }],
        alarmTopThreeEventNames: "",
        alarmTopEventName: "",
        alarmTopNum: 0,
      },
      areaAlarm: {
        xData: [],
        series: [{ data: [] }],
        alarmTopThreeAreaNames: "",
        alarmTopAreaName: "",
        alarmTopNum: 0,
      },
    });
    const deviceStatusNum = computed(() => (type) => {
      let number = state.deviceNum.statusListVos.find((item) => item.name == type);
      if (number) {
        return number.num;
      } else {
        return 0;
      }
    });
    const changeDate = (type) => {
      alarmTotalStatistic(type);
      getAlarmLevelStatistic(type);
      alarmTrendAnalysis(type);
      alarmEventAnalysis(type);
      alarmAreaAnalysis(type);
      getDeviceStatusNumber();
    };
    // 基本信息
    const alarmTotalStatistic = (type) => {
      proxy.$api
        .alarmTotalStatistic({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.baseInfo = res;
        });
    };
    // 获取设备正常数
    const getDeviceStatusNumber = () => {
      proxy.$api.getDeviceStatusNumber({ applicationCode: "SECURITY_MONITORING" }).then((res) => {
        state.deviceNum = res;
      });
    };
    // 报警级别占比
    const getAlarmLevelStatistic = (type) => {
      proxy.$api
        .alarmLevelStatistic({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then((res) => {
          const sortedAlarmLevels = sortAlarmLevels(res);
          state.leaveAlarm.data = sortedAlarmLevels.map((item) => {
            return {
              name: item.name,
              value: item.alarmNum,
            };
          });
          state.leaveAlarm.nameData = sortedAlarmLevels.map((item) => item.name);
          // 总数
          let sum = 0;
          if (sortedAlarmLevels.length) {
            state.leaveAlarm.total = sortedAlarmLevels.reduce(function (pre, curr) {
              return (sum = pre.alarmNum + curr.alarmNum);
            });
          }
          // 其他信息
          state.leaveAlarm.baseInfo = sortedAlarmLevels.map((item) => {
            return {
              name: item.name,
              value: item.alarmNum,
              ratio: item.ratio,
              color: leaveAalrmColor[item.code],
            };
          });
        });
    };
    // 报警趋势分析
    const alarmTrendAnalysis = (type) => {
      proxy.$api
        .alarmEventtrend({
          period: state.period,
          type: trendTypes[type] || type,
        })
        .then((res) => {
          state.alarm.xData = res.map((item) => formatTrendPeriod(item.period, type, state.period));
          state.alarm.series = [
            {
              data: res.map((item) => item.alarmNum),
              color: "#40A3FF",
              areaColor: ["rgba(16, 128, 255, 0)", "rgba(17, 126, 255, 0.16)"],
            },
          ];
        });
    };
    // 报警事件分析
    const alarmEventAnalysis = (type) => {
      proxy.$api
        .alarmEventAnalysis({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.alarmEvent.xData = res.alarmCurrencyStatisticsVOS.map((item) => item.name);
          state.alarmEvent.series = [
            {
              data: res.alarmCurrencyStatisticsVOS.map((item) => item.totalNum),
              color: "#FBA33F",
            },
          ];
          state.alarmEvent.alarmTopThreeEventNames = res.alarmTopThreeEventNames;
          state.alarmEvent.alarmTopEventName = res.alarmTopEventName;
          state.alarmEvent.alarmTopNum = res.alarmTopNum;
        });
    };
    // 报警区域报警分析
    const alarmAreaAnalysis = (type) => {
      proxy.$api
        .alarmAreaAnalysis({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.areaAlarm.xData = res.alarmCurrencyStatisticsVOS.map((item) => item.name);
          state.areaAlarm.series = [
            {
              data: res.alarmCurrencyStatisticsVOS.map((item) => item.totalNum),
              color: "#3662EC",
            },
          ];
          state.areaAlarm.alarmTopThreeAreaNames = res.alarmTopThreeAreaNames;
          state.areaAlarm.alarmTopAreaName = res.alarmTopAreaName;
          state.areaAlarm.alarmTopNum = res.alarmTopNum;
        });
    };
    return {
      ...toRefs(state),
      changeDate,
      deviceStatusNum,
    };
  },
});
</script>

<style lang="less" scoped>
.statistic {
  height: 100%;
}
:deep(.layout-container) {
  .layout-header {
    background: #ffffff;
    padding: 0 16px;
  }
}
.statistic-content {
  height: 100%;
  overflow-y: auto;
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-auto-flow: row dense;
    grid-gap: 16px;
    height: 756px;
    .item-box1 {
      grid-column-start: 1;
      grid-column-end: 3;
      height: 370px;
    }
    .item-box2 {
      grid-column-start: 3;
      grid-column-end: 7;
      height: 370px;
    }
    .item-box3 {
      grid-column-start: 1;
      grid-column-end: 4;
      height: 370px;
    }
    .item-box4 {
      grid-column-start: 4;
      grid-column-end: 7;
      height: 370px;
    }
    .total-box {
      width: 100%;
    }
    .card-body-box {
      height: 100%;
    }
    .icon-img {
      width: 60px;
      height: 60px;
      margin-right: 20px;
      border-radius: 12px 12px 12px 12px;
      i {
        font-size: 24px;
      }
    }
    .total-item {
      flex: 1;
      .name {
        font-size: 12px;
        color: #8c8c8c;
        margin: 0 4px;
      }
      .prop {
        font-size: 12px;
        color: #333333;
        margin: 0 4px;
      }
    }
    .line {
      width: 2px;
      height: 32px;
      opacity: 0.2;
      border: 1px solid #000000;
    }
    .chart-box {
      flex: 1;
    }
    .description {
      font-size: 16px;
      font-weight: 500;
      &.top-description {
        text-align: center;
      }
      .blue {
        color: #1890ff;
      }
      .value {
        font-size: 18px;
        color: #fba33f;
      }
    }
    .chart-box {
      height: 100%;
    }
  }
}

:deep(.ant-card) {
  width: 100%;
  height: 100%;
}
.statistic {
  :deep(.ant-card-head-title) {
    font-weight: 500;
    font-family: "PingFang SC-Medium";
  }
}
</style>
