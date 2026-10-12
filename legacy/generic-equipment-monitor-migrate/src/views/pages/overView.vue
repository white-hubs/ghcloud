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
            <div class="item-box statistic statistic-top" style="height: 121px">
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
                  <span style="color: #fba33f">在线</span>
                </div>
                <div class="value" style="font-size: 24px">
                  {{ abnormalPatrol.ONLINE || 0 }}
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
            <div
              class="item-box statistic flex-center"
              style="width: 66%; height: 121px"
            >
              <div class="left flex-center">
                <div
                  class="icon-img flex-center"
                  :style="{ background: '#FFEEEE' }"
                  style="margin-left: 10px"
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
                    <span>待接收</span>
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
              <div
                style="width: 320px; display: flex; align-items: center"
                v-if="title === '电气'"
              >
                <img
                  :src="img.dPng"
                  alt=""
                  style="width: 50px; height: 50px"
                />
                <div style="margin-left: 15px">
                  <div
                    style="font-size: 14px; font-weight: 400; color: #8c8c8c"
                  >
                    用电量
                  </div>
                  <div
                    style="font-size: 24px; font-weight: 700; color: #262626"
                  >
                    {{ electricityConsumption }}KW-h
                  </div>
                </div>
              </div>
            </div>
            <div class="item-box">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1 }"
                :title="title + '报警级别分布图'"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <template #extra>
                  <g-select
                    :options="areaOption"
                    v-if="areaOption.length > 1"
                    :field="{ value: 'value', label: 'label' }"
                    v-model:value="leaveAlarmArea"
                    :allowClear="false"
                    @changeCheck="getAlarmLevelStatistic(timeType)"
                  ></g-select>
                </template>
                
                <pie-chart
                  :data="leaveAlarm.data"
                  :nameData="leaveAlarm.nameData"
                  :baseInfo="leaveAlarm.baseInfo"
                ></pie-chart>
              </a-card>
            </div>
            <div class="item-box" style="width: 66%">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1 }"
                :title="title + '报警数量分布图'"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <template #extra>
                  <g-select
                    :options="areaOption"
                    v-if="areaOption.length > 1"
                    :field="{ value: 'value', label: 'label' }"
                    v-model:value="AlarmEventArea"
                    :allowClear="false"
                    @changeCheck="getAlarmEventStatistic(timeType)"
                  ></g-select>
                </template>
             
                <a-empty v-if="alarmEvent.series[0].data.length===0"></a-empty>
                <line-chart
                v-else
                  :xData="alarmEvent.xData"
                  :series="alarmEvent.series"
                ></line-chart>
              </a-card>
            </div>
          </div>
          <div class="item-box-bottom" style="width: 100%; margin-top: 16px">
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
import { leaveAalrmColor } from "@/utils/enumerate";
import { applicationCodeGroud } from "@/utils/enumerate.js";
import {
ArrowDownOutlined, ArrowUpOutlined
} from "@ant-design/icons-vue";
import {
computed,
defineComponent,
getCurrentInstance,
onBeforeMount,
reactive, ref, toRefs
} from "vue";
import { useStore } from "vuex";
import curveChart from "./components/echart/curveChart.vue";
import lineChart from "./components/echart/lineChart.vue";
import PieChart from "./components/echart/pieChart.vue";
import timeRadioGroup from "./statisticalAnalysis/components/timeRadioGroup.vue";
const dPng = '/resource/v1/generic-equipment-monitor-migrate/d.png'
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
    const store = useStore();
    const applicationCode = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      title: "",
      period: "",
      abnormalPatrol: {
        NORMAL: 0,
        OFFLINE: 0,
        total: 0,
      },
      alarmStatistic: {},
      alarmStatusGroup: [],
      leaveAlarm: {
        data: [],
        nameData: [],
        baseInfo: [],
      },
      alarmEvent: {
        series: [{data:[]}],
        xData: [],
      },
      leaveAlarmArea: null,
      AlarmEventArea: null,
      areaOption: [{ label: "全部", value: null }],
      timeType: "TODAY",
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
    const tableDataArea = ref([]);
    const tableDataDevice = ref([]);
    const alarmStatusNum = computed(() => key => {
      let cur = state.alarmStatusGroup.find(item => item.alarmStatus === key);
      if (cur) {
        return cur.alarmNum;
      } else {
        return 0;
      }
    });
    onBeforeMount(() => {
      const application = JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      applicationCode.value = application.code;
      getAreaData();
    });
    const changeDate = type => {
      getAlarmLevelStatistic(type);
      alarmTotalStatistic(type);
      alarmStatusGroupStatistics(type);
      getAlarmAreaTop(type);
      getAlarmeviceTop(type);
      getAlarmEventStatistic(type);
      getDeviceData();
      getpowerConsumption(type);
    };
    let electricityConsumption = ref();
    const getpowerConsumption = type => {
      proxy.$api
        .powerConsumption({
          period: state.period,
          type: type,
          applicationCode: applicationCode.value,
        })
        .then(res => {
          electricityConsumption.value = res;
        });
    };
    getpowerConsumption("TODAY");
    // 获取设备监测数据
    const getDeviceData = () => {
      proxy.$api
        .getComStatusList({ applicationCode: applicationCode.value })
        .then(res => {
          state.abnormalPatrol = res;
          res.statusListVos.forEach(item => {
            if (item.name == "ONLINE") {
              state.abnormalPatrol.ONLINE = item.num;
            }
            if (item.name == "ONLINE") {
              state.abnormalPatrol.NORMAL = item.num;
            }
            if (item.name == "OFFLINE") {
              state.abnormalPatrol.OFFLINE = item.num;
            }
          });
        });
    };

    // 报警设备TOP10
    const getAlarmeviceTop = type => {
      proxy.$api
        .alarmdevicetopten({
          period: state.period,
          type: type,
          applicationCode: applicationCode.value,
        })
        .then(res => {
          tableDataDevice.value = res.map(data=>{
            data.ratio=data.ratio+'%'
            return data
          });
        });
    };

    // 排名报警区域前十
    const getAlarmAreaTop = type => {
      proxy.$api
        .alarmAreaStatistic({
          period: state.period,
          type: type,
          applicationCode: applicationCode.value,
        })
        .then(res => {
          tableDataArea.value = res.sort((a, b) => b.totalNum - a.totalNum);
        });
    };

    // 报警总览
    const alarmTotalStatistic = type => {
      proxy.$api
        .alarmTotalStatistic({
          period: state.period,
          type: type,
          applicationCode: applicationCode.value,
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
          applicationCode: applicationCode.value,
        })
        .then(res => {
          state.alarmStatusGroup = res;
        });
    };
    // 报警级别占比
    const getAlarmLevelStatistic = type => {
      proxy.$api
        .alarmLevelStatistic({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
          area: state.leaveAlarmArea,
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
    // 报警数量分布图
    const getAlarmEventStatistic = type => {
      proxy.$api
        .alarmEventStatistic({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
          area: state.AlarmEventArea,
        })
        .then(res => {
          state.alarmEvent.xData = res.map(item => item.name);
          state.alarmEvent.series = [
            {
              data: res.map(item => item.totalNum),
              color: "#3662EC",
            },
          ];
        });
    };
    //获取区域数据
    const getAreaData = () => {
      proxy.$api
        .getAreaByLevel({
          level: 2,
        })
        .then(res => {
          let data = res.map(e => {
            return {
              label: e.name,
              value: e.sequence,
            };
          });
          state.areaOption = [...state.areaOption, ...data];
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
      getDeviceData,
      electricityConsumption,
      getAlarmLevelStatistic,
      getAlarmEventStatistic,
      img: {
        dPng
      },
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
  display: flex;
  flex-wrap: wrap;
  grid-row-gap: 16px;
  grid-column-gap: 1%;
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
    width: 33%;
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
:deep(.content-table) {
  overflow: overlay !important;
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
