<template>
  <div class="overView">
    <g-layout-no-footer :title="pageTitle">
      <template #header-btn>
        <time-radio-group v-model:value="period" @change="changeDate"></time-radio-group>
      </template>

      <template #content-table>
        <div class="grid-container">
          <div class="item-box statistic flex-center" style="height: 121px">
            <div class="icon-img flex-center" :style="{ background: '#FFF1E1' }">
              <icon-font type="icon-xunluo1" :style="{ 'font-size': '40px', color: '#FBA33F' }" />
            </div>
            <a-statistic title="巡逻异常数" :value="abnormalPatrol.totalNum || 0">
              <template #suffix>
                <span class="name">环比</span>
                <arrow-up-outlined v-if="abnormalPatrol.ringRatio > 0" style="color: #3f8600; font-size: 16px" />
                <arrow-down-outlined v-if="abnormalPatrol.ringRatio < 0" style="color: #f53f3f; font-size: 16px" />
                <span class="prop">{{ abnormalPatrol.ringRatio + "%" }}</span>
              </template>
            </a-statistic>
          </div>
          <div class="item-box statistic flex-center" style="height: 121px; width: 66%">
            <div class="left flex-center">
              <div class="icon-img flex-center" :style="{ background: '#FFEEEE' }">
                <icon-font type="icon-baojing" :style="{ 'font-size': '40px', color: '#F53F3F' }" />
              </div>
              <a-statistic title="报警总数" :value="alarmStatistic.alarmNum || 0">

                <template #suffix>
                  <span class="name">环比</span>
                  <arrow-up-outlined v-if="alarmStatistic.ringRatio > 0" style="color: #3f8600; font-size: 16px" />
                  <arrow-down-outlined v-if="alarmStatistic.ringRatio < 0" style="color: #f53f3f; font-size: 16px" />
                  <span class="prop">{{ alarmStatistic.ringRatio + "%" }}</span>
                </template>
              </a-statistic>
            </div>
            <div class="right flex-between">
              <div class="a-statistic">
                <div class="title flex-center">
                  <icon-font type="icon-danxuanxuanzhong" :style="{ 'font-size': '18px', color: '#1890FF' }" />
                  <span>待接收</span>
                </div>
                <div class="value">
                  {{ alarmStatusNum("ALARM_UN_CONFIRMED") }}
                </div>
              </div>
              <div class="a-statistic">
                <div class="title flex-center">
                  <icon-font type="icon-danxuanxuanzhong" :style="{ 'font-size': '18px', color: '#FBA33F' }" />
                  <span>已挂起</span>
                </div>
                <div class="value">{{ alarmStatusNum("ALARM_SUSPEND") }}</div>
              </div>
              <div class="a-statistic">
                <div class="title flex-center">
                  <icon-font type="icon-danxuanxuanzhong" :style="{ 'font-size': '18px', color: '#3662EC' }" />
                  <span>处理中</span>
                </div>
                <div class="value">
                  {{ alarmStatusNum("ALARM_PROGRESS_CONFIRMED") }}
                </div>
              </div>
              <div class="a-statistic">
                <div class="title flex-center">
                  <icon-font type="icon-danxuanxuanzhong" :style="{ 'font-size': '18px', color: '#00BA8B' }" />
                  <span>已处理</span>
                </div>
                <div class="value">{{ alarmStatusNum("ALARM_HANDLER") }}</div>
              </div>
            </div>
          </div>
          <div class="item-box">
            <a-card class="flex-column" :bodyStyle="{ flex: 1 }" title="报警级别占比" :bordered="false" :headStyle="{
                padding: '0 16px',
                'border-bottom': 'none',
                color: '#1D2129',
              }">
              <pie-chart :data="leaveAlarm.data" :nameData="leaveAlarm.nameData"
                :baseInfo="leaveAlarm.baseInfo"></pie-chart>
            </a-card>
          </div>
          <div class="item-box" style="width: 66%">
            <a-card class="flex-column" :bodyStyle="{ flex: 1 }" title="巡逻路线异常分布情况" :bordered="false" :headStyle="{
                padding: '0 16px',
                'border-bottom': 'none',
                color: '#1D2129',
              }">
              <!-- {{patrolLine.series.length}} -->
              <a-empty v-if="patrolLine.series[0].data.length===0"></a-empty>
              <line-chart v-else :xData="patrolLine.xData" :series="patrolLine.series"></line-chart>
            </a-card>
          </div>
          <div class="item-box">
            <a-card class="flex-column" :bodyStyle="{ flex: 1 }" title="区域报警占比" :bordered="false" :headStyle="{
                padding: '0 16px',
                'border-bottom': 'none',
                color: '#1D2129',
              }">
              <pie-chart :data="areaAlarm.data" :nameData="areaAlarm.nameData"
                :baseInfo="areaAlarm.baseInfo"></pie-chart>
            </a-card>
          </div>
          <div class="item-box" style="width: 66%">
            <a-card class="flex-column" :bodyStyle="{ flex: 1 }" title="报警趋势分析" :bordered="false" :headStyle="{
                padding: '0 16px',
                'border-bottom': 'none',
                color: '#1D2129',
              }">

              <a-empty v-if="alarmEvent.series[0].data.length===0"></a-empty>
              <curve-chart v-else :dayType="dayType" :xData="alarmEvent.xData"
                :series="alarmEvent.series"></curve-chart>
            </a-card>
          </div>
        </div>
      </template>
    </g-layout-no-footer>
  </div>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  createFromIconfontCN,
} from "@ant-design/icons-vue";
import timeRadioGroup from "./statisticalAnalysis/components/timeRadioGroup.vue";
import PieChart from "./components/echart/pieChart.vue";
import lineChart from "./components/echart/lineChart.vue";
import curveChart from "./components/echart/curveChart.vue";
import { leaveAalrmColor } from "@/utils/enumerate";
import { colorRgb } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { usePageName } from "@ghcloud/cube-utils"
const IconFont = createFromIconfontCN({
  scriptUrl: "/resource/v1/security-monitor-migrate/security-monitor-migrate-iconFont.js",
});
export default defineComponent({
  components: {
    timeRadioGroup,
    IconFont,
    ArrowUpOutlined,
    ArrowDownOutlined,
    PieChart,
    lineChart,
    curveChart,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      dayType: "TODAY",
      period: "",
      abnormalPatrol: {},
      alarmStatistic: {},
      alarmStatusGroup: [],
      leaveAlarm: {
        data: [],
        nameData: [],
        baseInfo: [],
      },
      patrolLine: {
        xData: [],
        series: [
          { data: [] }
        ],
      },
      areaAlarm: {
        data: [],
        nameData: [],
        baseInfo: [],
      },
      alarmEvent: {
        xData: [],
        series: [
          { data: [] }
        ],
      },
    });
    const alarmStatusNum = computed(() => key => {
      let cur = state.alarmStatusGroup.find(item => item.alarmStatus === key);
      if (cur) {
        return cur.alarmNum;
      } else {
        return 0;
      }
    });
    const changeDate = type => {
      state.dayType = type;
      getAlarmLevelStatistic(type);
      patrolAbnormalGroup(type);
      alarmAreaStatistic(type);
      alarmEventStatistic(type);
      abnormalPatrolLineStatistic(type);
      alarmTotalStatistic(type);
      alarmStatusGroupStatistics(type);
    };
    // 巡逻异常统计
    const abnormalPatrolLineStatistic = type => {
      proxy.$api
        .abnormalPatrolLineStatistic({ period: state.period, type: type })
        .then(res => {
          state.abnormalPatrol = res;
        });
    };
    // 报警总览
    const alarmTotalStatistic = type => {
      proxy.$api
        .alarmTotalStatistic({
          period: state.period,
          type: type,
          applicationCode: "SECURITY_MONITORING",
        })
        .then(res => {
          state.alarmStatistic = res;
        });
    };
    // 报警状态分组统计
    const alarmStatusGroupStatistics = type => {
      proxy.$api
        .alarmStatusGroupStatistics({
          period: state.period,
          type: type,
          applicationCode: "SECURITY_MONITORING",
        })
        .then(res => {
          state.alarmStatusGroup = res;
        });
    };
    // 报警级别占比
    const getAlarmLevelStatistic = type => {
      proxy.$api
        .alarmLevelStatistic({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then(res => {
          state.leaveAlarm.data = res.map(item => {
            return {
              name: item.name,
              value: item.alarmNum,
              barWidth: "20", //设置柱宽度
            };
          });
          state.leaveAlarm.nameData = res.map(item => item.name);
          state.leaveAlarm.baseInfo = res.map(item => {
            return {
              name: item.name,
              value: item.alarmNum,
              ratio: item.ratio,
              color: leaveAalrmColor[item.code],
            };
          });
        });
    };
    // 巡逻路线异常分布情况
    const patrolAbnormalGroup = type => {
      proxy.$api
        .patrolAbnormalGroup({ period: state.period, type: type })
        .then(res => {
          state.patrolLine.xData = res.map(item => item.name);
          state.patrolLine.series = [
            {
              data: res.map(item => item.totalNum),
              color: "#3662EC",
            },
          ];
        });
    };
    // 按区域报警统计
    const alarmAreaStatistic = type => {
      proxy.$api
        .alarmAreaStatistic({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then(res => {
          state.areaAlarm.data = res.map(item => {
            return {
              name: item.name,
              value: item.totalNum,
            };
          });
          state.areaAlarm.nameData = res.map(item => item.name);
          state.areaAlarm.baseInfo = res.map((item, index) => {
            return {
              name: item.name,
              value: item.alarmNum,
              ratio: item.ratio,
              color: colorRgb(),
            };
          });
        });
    };
    // 报警趋势统计
    const alarmEventStatistic = type => {
      proxy.$api
        .alarmEventtrend({
          applicationCode: "SECURITY_MONITORING",
          period: state.period,
          type: type,
        })
        .then(res => {
          state.alarmEvent.xData = res.map(item => item.period);
          state.alarmEvent.series = [
            {
              data: res.map(item => item.alarmNum),
              color: "#40A3FF",
              areaColor: ["rgba(16, 128, 255, 0)", "rgba(17, 126, 255, 0.16)"],
            },
          ];
        });
    };
    return {
      ...toRefs(state),
      changeDate,
      alarmStatusNum,
    };
  },
});
</script>

<style lang="less" scoped>
.overView {
  height: 100%;
  background-color: #ffffff;

  .grid-container {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    grid-row-gap: 16px;
    grid-column-gap: 1%;

    .item-box {
      width: 33%;
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

    .item-box {
      background: #ffffff;
      border-radius: 6px;
      display: flex;

      &.statistic {
        padding: 16px 0;

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

        .left {
          height: 100%;
          flex: 1;
        }

        .right {
          height: 100%;
          flex: 2;

          .a-statistic {
            width: 25%;
            text-align: center;

            .title {
              color: rgba(0, 0, 0, 0.45);
              font-size: 14px;

              span {
                margin-right: 6px;
              }
            }

            .value {
              color: rgba(0, 0, 0, 0.85);
              font-size: 24px;
            }
          }
        }
      }
    }
  }
}

:deep(.layout-container) {
  background: #f0f2f5;
  padding: 0;

  .layout-header {
    background: #ffffff;
    padding: 0 16px;
  }

  .layout-content {
    background: #ffffff;
  }
}

:deep(.ant-card) {
  width: 100%;
}

:deep(.content-table) {
  overflow: overlay !important;
}

.overView {
  :deep(.ant-card-head-title) {
    font-weight: 500;
    font-family: "PingFang SC-Medium";
  }
}
</style>
