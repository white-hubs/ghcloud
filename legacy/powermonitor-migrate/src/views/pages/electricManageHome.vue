<template>
  <div class="statistic">
    <g-layout-no-footer :title="pageTitle">
      <template #header-btn>
        <time-radio-group
          v-model:value="period"
          @change="changeDate"
        ></time-radio-group>
      </template>
      <template #content-table>
        <div>
          <div class="grid-container">
            <div class="item-box statistic statistic-top">
              <div
                class="icon-img flex-center"
                :style="{ background: '#FFF1E1' }"
              >
                <icon-font
                  type="icon-xunluo1"
                  :style="{ 'font-size': '40px', color: '#FBA33F' }"
                />
              </div>
              <a-statistic
                title="监测设备数"
                :value="abnormalPatrol.total || 0"
              ></a-statistic>
              <div class="a-statistic">
                <div class="title flex-center">
                  <icon-font
                    type="icon-danxuanxuanzhong"
                    :style="{ 'font-size': '18px', color: '#00BA8B' }"
                  />
                  <span style="color: #fba33f">运行</span>
                </div>
                <div class="value" style="font-size: 24px">
                  {{ abnormalPatrol.NORMAL || 0 }}
                </div>
              </div>
              <div class="a-statistic">
                <div class="title flex-center">
                  <icon-font
                    type="icon-danxuanxuanzhong"
                    :style="{ 'font-size': '18px', color: '#FBA33F' }"
                  />
                  <span style="color: #fba33f">离线</span>
                </div>
                <div class="value" style="font-size: 24px">
                  {{ abnormalPatrol.OFFLINE || 0 }}
                </div>
              </div>
            </div>
            <div class="item-box statistic statistic-top flex-center">
              <div class="left flex-center">
                <div
                  class="icon-img flex-center"
                  :style="{ background: '#FFEEEE' }"
                >
                  <icon-font
                    type="icon-baojing"
                    :style="{ 'font-size': '40px', color: '#F53F3F' }"
                  />
                </div>
                <a-statistic
                  title="报警总数"
                  :value="alarmStatistic.alarmNum || 0"
                >
                  <template #suffix>
                    <span class="name">环比</span>
                    <arrow-up-outlined
                      v-if="alarmStatistic.ringRatio > 0"
                      style="color: #3f8600; font-size: 16px"
                    />
                    <arrow-down-outlined
                      v-if="alarmStatistic.ringRatio < 0"
                      style="color: #f53f3f; font-size: 16px"
                    />
                    <span class="prop">
                      {{ alarmStatistic.ringRatio + "%" }}
                    </span>
                  </template>
                </a-statistic>
              </div>
              <div class="right flex-between">
                <div class="a-statistic">
                  <div class="title flex-center">
                    <icon-font
                      type="icon-danxuanxuanzhong"
                      :style="{ 'font-size': '18px', color: '#1890FF' }"
                    />
                    <span>待确认</span>
                  </div>
                  <div class="value">
                    {{ alarmStatusNum("ALARM_UN_CONFIRMED") }}
                  </div>
                </div>
                <div class="a-statistic">
                  <div class="title flex-center">
                    <icon-font
                      type="icon-danxuanxuanzhong"
                      :style="{ 'font-size': '18px', color: '#FBA33F' }"
                    />
                    <span>已挂起</span>
                  </div>
                  <div class="value">{{ alarmStatusNum("ALARM_SUSPEND") }}</div>
                </div>
                <div class="a-statistic">
                  <div class="title flex-center">
                    <icon-font
                      type="icon-danxuanxuanzhong"
                      :style="{ 'font-size': '18px', color: '#3662EC' }"
                    />
                    <span>处理中</span>
                  </div>
                  <div class="value">
                    {{ alarmStatusNum("ALARM_PROGRESS_CONFIRMED") }}
                  </div>
                </div>
                <div class="a-statistic">
                  <div class="title flex-center">
                    <icon-font
                      type="icon-danxuanxuanzhong"
                      :style="{ 'font-size': '18px', color: '#00BA8B' }"
                    />
                    <span>已处理</span>
                  </div>
                  <div class="value">{{ alarmStatusNum("ALARM_HANDLER") }}</div>
                </div>
              </div>
            </div>
            <div class="item-box">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1 }"
                title="电气报警级别分布图"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <pie-chart
                  :data="leaveAlarm.data"
                  :nameData="leaveAlarm.nameData"
                  :baseInfo="leaveAlarm.baseInfo"
                ></pie-chart>
              </a-card>
            </div>
            <div class="item-box">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1 }"
                title="电气报警数量分布图"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <line-chart
                  :xData="patrolLine.xData"
                  :series="patrolLine.series"
                ></line-chart>
              </a-card>
            </div>
          </div>
          <div class="item-box-bottom" style="width: 100%">
            <div class="item-box-bottom-left">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1 }"
                title="报警区域TOP10"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <a-table
                  ref="tableRef"
                  :columns="columnsArea"
                  :data-source="tableDataArea"
                  :pagination="false"
                  size="small"
                  :scroll="{ y: 280 }"
                >
                  <template #pm="{ index }">
                    <div class="table-item1" v-if="index == 0">
                      {{ index + 1 }}
                    </div>
                    <div class="table-item2" v-if="index == 1">
                      {{ index + 1 }}
                    </div>
                    <div class="table-item3" v-if="index == 2">
                      {{ index + 1 }}
                    </div>
                    <div
                      class="table-item4"
                      v-if="index !== 0 && index !== 1 && index !== 2"
                    >
                      {{ index + 1 }}
                    </div>
                  </template>
                </a-table>
              </a-card>
            </div>
            <div class="item-box-bottom-right">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1 }"
                title="报警设备TOP10"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <a-table
                  ref="tableRef"
                  :columns="columnsDevice"
                  :data-source="tableDataDevice"
                  :pagination="false"
                  size="small"
                  :scroll="{ y: 280 }"
                >
                  <template #pm="{ index }">
                    <div class="table-item1" v-if="index == 0">
                      {{ index + 1 }}
                    </div>
                    <div class="table-item2" v-if="index == 1">
                      {{ index + 1 }}
                    </div>
                    <div class="table-item3" v-if="index == 2">
                      {{ index + 1 }}
                    </div>
                    <div
                      class="table-item4"
                      v-if="index !== 0 && index !== 1 && index !== 2"
                    >
                      {{ index + 1 }}
                    </div>
                  </template>
                </a-table>
              </a-card>
            </div>
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
  reactive,
  toRefs,
  ref,
} from "vue";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons-vue";
import timeRadioGroup from "./components/timeRadioGroup.vue";
import PieChart from "./components/echart/pieChart.vue";
import lineChart from "./components/echart/lineChart.vue";
import curveChart from "./components/echart/curveChart.vue";
import { leaveAalrmColor } from "@/utils/enumerate";
import { colorRgb } from "@/utils/common";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: {
    timeRadioGroup,
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
      period: "",
      abnormalPatrol: { NORMAL: 0, OFFLINE: 0, total: 0 },
      alarmStatistic: {},
      alarmStatusGroup: [],
      leaveAlarm: {
        data: [],
        nameData: [],
        baseInfo: [],
      },
      patrolLine: {
        xData: [],
        series: [],
      },
      areaAlarm: {
        data: [],
        nameData: [],
        baseInfo: [],
      },
      alarmEvent: {
        xData: [],
        series: [],
      },
    });
    const columnsArea = ref([
      {
        title: "排名",
        dataIndex: "pm",
        key: "pm",
        slots: { customRender: "pm" },
      },
      {
        title: "区域名称",
        dataIndex: "name",
        key: "name",
        slots: { customRender: "name" },
      },
      {
        title: "数量",
        dataIndex: "totalNum",
        key: "totalNum",
      },
      {
        title: "占比",
        dataIndex: "ratio",
        key: "ratio",
      },
    ]);
    const columnsDevice = ref([
      {
        title: "排名",
        dataIndex: "pm",
        key: "pm",
        slots: { customRender: "pm" },
      },
      {
        title: "设备名称",
        dataIndex: "name",
        key: "name",
        slots: { customRender: "name" },
      },
      {
        title: "数量",
        dataIndex: "totalNum",
        key: "totalNum",
      },
      {
        title: "占比",
        dataIndex: "ratio",
        key: "ratio",
      },
    ]);
    const tableDataArea = ref([
      {
        key: "1",
        name: "2号门门禁名称",
        pm: 1,
        totalNum: 10,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        totalNum: 20,
      },
    ]);
    const tableDataDevice = ref([
      {
        key: "1",
        name: "2号门门禁名称",
        pm: 1,
        count: 10,
        totalNum: 1,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
        totalNum: 1,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
        totalNum: 1,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
        totalNum: 1,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
        totalNum: 1,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
        totalNum: 1,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
        totalNum: 1,
      },
    ]);
    const alarmStatusNum = computed(() => key => {
      let cur = state.alarmStatusGroup.find(item => item.alarmStatus === key);
      if (cur) {
        return cur.alarmNum;
      } else {
        return 0;
      }
    });
    const changeDate = type => {
      getAlarmLevelStatistic(type);
      alarmAreaStatistic(type);
      alarmEventStatistic(type);
      alarmTotalStatistic(type);
      alarmStatusGroupStatistics(type);
      getAlarmAreaTop();
      getAlarmeviceTop();
      getDeviceData();
      patrolAbnormalGroup(type);
    };
    // 获取设备监测数据
    const getDeviceData = () => {
      proxy.$api
        .getComStatusList({
          applicationCode: "ELECTRICAL",
        })
        .then(res => {
          state.abnormalPatrol = res;
          res.statusListVos.forEach(item => {
            if (item.name == "NORMAL") {
              state.abnormalPatrol.NORMAL = item.num;
            }
            if (item.name == "OFFLINE") {
              state.abnormalPatrol.OFFLINE = item.num;
            }
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
    // 排名报警区域前十
    const getAlarmeviceTop = () => {
      proxy.$api
        .alarmdevicetopten({
          period: state.period,
          applicationCode: "ELECTRICAL",
        })
        .then(res => {
          tableDataDevice.value = res;
        });
    };

    // 排名报警区域前十
    const getAlarmAreaTop = () => {
      proxy.$api
        .alarmAreaStatistic({
          period: state.period,
          applicationCode: "ELECTRICAL",
        })
        .then(res => {
          tableDataArea.value = res;
        });
    };

    // 报警总览
    const alarmTotalStatistic = type => {
      proxy.$api
        .alarmTotalStatistic({
          period: state.period,
          type: type,
          applicationCode: "ELECTRICAL",
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
          applicationCode: "ELECTRICAL",
        })
        .then(res => {
          state.alarmStatusGroup = res;
        });
    };
    // 报警级别占比
    const getAlarmLevelStatistic = type => {
      proxy.$api
        .alarmLevelStatistic({
          applicationCode: "ELECTRICAL",
          period: state.period,
          type: type,
        })
        .then(res => {
          state.leaveAlarm.data = res.map(item => {
            return {
              name: item.name,
              value: item.alarmNum,
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

    // 按区域报警统计
    const alarmAreaStatistic = type => {
      proxy.$api
        .alarmAreaStatistic({
          applicationCode: "ELECTRICAL",
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
    // 报警事件统计
    const alarmEventStatistic = type => {
      proxy.$api
        .alarmEventStatistic({
          applicationCode: "ELECTRICAL",
          period: state.period,
          type: type,
        })
        .then(res => {
          state.alarmEvent.xData = res.map(item => item.name);
          state.alarmEvent.series = [
            {
              data: res.map(item => item.totalNum),
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
      columnsArea,
      columnsDevice,
      tableDataArea,
      tableDataDevice,
    };
  },
});
</script>

<style lang="less" scoped>
.statistic {
  height: 100%;
}
.statistic-top {
  padding-left: 60px;
  padding-right: 20px;
  height: 80px;
  justify-content: space-around;
  display: flex;
  align-items: center;
}
:deep(.layout-container) {
  background: #f0f2f5;
  padding: 0;
  .layout-header {
    background: #ffffff;
    padding: 0 16px;
  }
}
:deep(.ant-statistic) {
  line-height: 22px !important;
}
:deep(.ant-card-head-title) {
  font-weight: bold;
}
:deep(.ant-card-body) {
  padding: 4px 10px !important;
}
:deep(.ant-table-row) {
  height: 40px !important;
}
.grid-container {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 0.2fr 3fr 0fr;
  grid-row-gap: 16px;
  grid-column-gap: 16px;
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
    padding: 0px 0px;
    &.statistic {
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
:deep(.ant-card) {
  width: 100%;
}
.item-box-bottom {
  display: flex;
  justify-content: space-between;
  height: 470px;
  .item-box-bottom-left {
    width: 49%;
    background-color: #fff;
  }
  .item-box-bottom-right {
    width: 50%;
    margin-left: 16px;
    background-color: #fff;
  }
}
.table-item1 {
  width: 25px;
  height: 25px;
  color: #fff;
  background-color: #ff4070;
  border: 1px solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.table-item2 {
  width: 25px;
  height: 25px;
  color: #fff;
  background-color: #fba33f;
  border: 1px solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.table-item3 {
  width: 25px;
  height: 25px;
  color: #fff;
  background-color: #3662ec;
  border: 1px solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.table-item4 {
  width: 25px;
  height: 25px;
  color: #fff;
  background-color: #dcdcdc;
  border: 1px solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
