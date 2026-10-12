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
                      <div
                        class="icon-img flex-center"
                        :style="{ background: '#E6FFFB' }"
                      >
                        <icon-font
                          type="icon-jianceshebei1"
                          :style="{ 'font-size': '40px', color: '#13C2C2' }"
                        />
                      </div>
                      <a-statistic
                        title="监测设备正常数"
                        :value="deviceStatusNum('ONLINE') || 0"
                      ></a-statistic>
                    </div>
                    <div class="line"></div>
                    <div class="total-item flex-center">
                      <div
                        class="icon-img flex-center"
                        :style="{ background: '#FFEEEE' }"
                      >
                        <icon-font
                          type="icon-baojing"
                          :style="{ 'font-size': '40px', color: '#F53F3F' }"
                        />
                      </div>
                      <a-statistic title="监测报警数" :value="baseInfo.alarmNum || 0">
                        <template #suffix>
                          <span class="name">环比</span>
                          <arrow-up-outlined
                            v-if="baseInfo.ringRatio > 0"
                            style="color: #3f8600; font-size: 16px"
                          />
                          <arrow-down-outlined
                            v-if="baseInfo.ringRatio < 0"
                            style="color: #f53f3f; font-size: 16px"
                          />
                          <span class="prop">
                            {{ baseInfo.ringRatio + "%" }}
                          </span>
                        </template>
                      </a-statistic>
                    </div>
                  </div>
                  <div class="chart-box">
                    <pie-chart
                      :data="leaveAlarm.data"
                      :nameData="leaveAlarm.nameData"
                      :baseInfo="leaveAlarm.baseInfo"
                    ></pie-chart>
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
                <template #extra>
                  <span class="description" v-if="alarm.topTimeSlot">
                    <span class="blue">{{ alarm.topTimeSlot }}</span>
                    时间段是事件高发期需要加强管理
                  </span>
                </template>
                <curve-chart :xData="alarm.xData" :series="alarm.series"></curve-chart>
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
                <div class="card-body-box flex-column" v-if="alarmEvent.xData.length > 0">
                  <div class="description top-description">
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
                    <line-chart
                      :xData="alarmEvent.xData"
                      :series="alarmEvent.series"
                    ></line-chart>
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
                <div class="card-body-box flex-column" v-if="areaAlarm.xData.length > 0">
                  <div class="description top-description">
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
                    <line-chart
                      :xData="areaAlarm.xData"
                      :series="areaAlarm.series"
                    ></line-chart>
                  </div>
                </div>
                <a-empty v-else></a-empty>
              </a-card>
            </div>
            <div class="item-box item-box5">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1, padding: '8px 16px' }"
                title="报警处理分析"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <div class="card-body-box flex-column">
                  <div class="top-statistic flex-start">
                    <div class="left-statistic flex-start">
                      <div class="left-statistic-item flex-center">
                        <div
                          class="icon-img flex-center"
                          :style="{ background: '#E6FFFB' }"
                        >
                          <icon-font
                            type="icon-baojing"
                            :style="{ 'font-size': '40px', color: '#13C2C2' }"
                          />
                        </div>
                        <span class="title">已处理报警数</span>
                        <span class="value">
                          {{ handelAlarm.alarmHandlerTotalNum }}
                        </span>
                      </div>
                      <div class="left-statistic-item flex-center">
                        <div
                          class="icon-img flex-center"
                          :style="{ background: '#FFF6EB' }"
                        >
                          <icon-font
                            type="icon-baojing"
                            :style="{ 'font-size': '40px', color: '#FBA33F' }"
                          />
                        </div>
                        <span class="title">待处理报警数</span>
                        <span class="value">
                          {{ handelAlarm.alarmUnresolvedHandlerTotalNum }}
                        </span>
                      </div>
                    </div>
                    <div
                      class="right-statistic description"
                      v-if="handelAlarm.alarmHandlerTopThreeUserNames"
                    >
                      <span class="blue">
                        {{ handelAlarm.alarmHandlerTopThreeUserNames }}
                      </span>
                      等{{`${KEYWORD_ALIAS.staff}`}}处理的报警数量最多
                    </div>
                  </div>
                  <div class="chart-statistic flex-start">
                    <div class="flex-column chart-statistic-item">
                      <div class="chart-header flex-between">
                        <div class="title">处理报警数排名top10</div>
                      </div>
                      <div class="chart-box">
                        <transverse-line-chart
                          v-if="handelAlarm.sequence.series[0].data.length > 0"
                          :yData="handelAlarm.sequence.xData"
                          :series="handelAlarm.sequence.series"
                          :title="'count'"
                        ></transverse-line-chart>

                        <a-empty v-else></a-empty>
                      </div>
                    </div>
                    <div class="flex-column chart-statistic-item">
                      <div class="chart-header flex-between">
                        <div class="title">处理报警数排名倒数Last10</div>
                      </div>
                      <div class="chart-box">
                        <transverse-line-chart
                          v-if="handelAlarm.reverse.series[0].data.length > 0"
                          :yData="handelAlarm.reverse.xData"
                          :series="handelAlarm.reverse.series"
                          :title="'count'"
                        ></transverse-line-chart>
                        <a-empty v-else></a-empty>
                      </div>
                    </div>
                  </div>
                </div>
              </a-card>
            </div>
            <div class="item-box item-box6">
              <a-card
                class="flex-column"
                :bodyStyle="{ flex: 1, padding: '8px 16px' }"
                title="报警处理效率分析"
                :bordered="false"
                :headStyle="{
                  padding: '0 16px',
                  'border-bottom': 'none',
                  color: '#1D2129',
                }"
              >
                <div class="card-body-box flex-between">
                  <div class="statistic-item flex-column">
                    <div class="top-statistic description grid">
                      <div class="grid-item flex-start">
                        <div class="label">一级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('one_level', 'highEfficiencyUserName')
                          "
                        >
                          <span class="blue">
                            {{
                              userHandlerAlarmLevel("one_level", "highEfficiencyUserName")
                            }}
                          </span>
                          <span>处理一级报警事件效率最高</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                      <div class="grid-item flex-start">
                        <div class="label">二级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('two_level', 'highEfficiencyUserName')
                          "
                        >
                          <span class="blue">
                            {{
                              userHandlerAlarmLevel("two_level", "highEfficiencyUserName")
                            }}
                          </span>
                          <span>处理二级报警事件效率最高</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                      <div class="grid-item flex-start">
                        <div class="label">三级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('three_level', 'highEfficiencyUserName')
                          "
                        >
                          <span class="blue">
                            {{
                              userHandlerAlarmLevel(
                                "three_level",
                                "highEfficiencyUserName"
                              )
                            }}
                          </span>
                          <span>处理三级报警事件效率最高</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                      <div class="grid-item flex-start">
                        <div class="label">四级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('four_level', 'highEfficiencyUserName')
                          "
                        >
                          <span class="blue">
                            {{
                              userHandlerAlarmLevel(
                                "four_level",
                                "highEfficiencyUserName"
                              )
                            }}
                          </span>
                          <span>处理四级报警事件效率最高</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                    </div>
                    <div class="chart-header flex-between">
                      <div class="title">处理报警效率排名Top10</div>
                      <a-select
                        size="small"
                        style="width: 140px"
                        :options="alarmLeaveList"
                        :getPopupContainer="
                          (triggerNode) => {
                            return triggerNode.parentNode;
                          }
                        "
                        v-model:value="topAlarmLevelId"
                        @change="changeTopAlarmLevelId"
                      ></a-select>
                    </div>
                    <div class="chart-box">
                      <transverse-line-chart
                        v-if="userHandlerAlarmTop.series[0].data.length > 0"
                        :yData="userHandlerAlarmTop.xData"
                        :series="userHandlerAlarmTop.series"
                        :title="'min'"
                      ></transverse-line-chart>
                      <a-empty v-else></a-empty>
                    </div>
                  </div>
                  <div class="statistic-item flex-column">
                    <div class="top-statistic description grid">
                      <div class="grid-item flex-start">
                        <div class="label">一级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('one_level', 'lowEfficiencyUserName')
                          "
                        >
                          <span class="blue">
                            {{
                              userHandlerAlarmLevel("one_level", "lowEfficiencyUserName")
                            }}
                          </span>
                          <span>处理一级报警事件效率最低</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                      <div class="grid-item flex-start">
                        <div class="label">二级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('two_level', 'lowEfficiencyUserName')
                          "
                        >
                          <span>
                            {{
                              userHandlerAlarmLevel("two_level", "lowEfficiencyUserName")
                            }}
                          </span>
                          <span>处理二级报警事件效率最低</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                      <div class="grid-item flex-start">
                        <div class="label">三级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('three_level', 'lowEfficiencyUserName')
                          "
                        >
                          <span>
                            {{
                              userHandlerAlarmLevel(
                                "three_level",
                                "lowEfficiencyUserName"
                              )
                            }}
                          </span>
                          <span>处理三级报警事件效率最低</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                      <div class="grid-item flex-start">
                        <div class="label">四级报警</div>
                        <div
                          v-if="
                            userHandlerAlarmLevel('four_level', 'lowEfficiencyUserName')
                          "
                        >
                          <span>
                            {{
                              userHandlerAlarmLevel("four_level", "lowEfficiencyUserName")
                            }}
                          </span>
                          <span>处理四级报警事件效率最低</span>
                        </div>
                        <div v-else>暂无统计</div>
                      </div>
                    </div>
                    <div class="chart-header flex-between">
                      <div class="title">处理报警效率倒数排名Last10</div>
                      <a-select
                        size="small"
                        style="width: 140px"
                        :options="alarmLeaveList"
                        :getPopupContainer="
                          (triggerNode) => {
                            return triggerNode.parentNode;
                          }
                        "
                        v-model:value="lastTopAlarmLevelId"
                        @change="changeLastTopAlarmLevelId"
                      ></a-select>
                    </div>
                    <div class="chart-box">
                      <transverse-line-chart
                        v-if="userHandlerAlarmLastTop.series[0].data.length > 0"
                        :yData="userHandlerAlarmLastTop.xData"
                        :series="userHandlerAlarmLastTop.series"
                      ></transverse-line-chart>
                      <a-empty v-else></a-empty>
                    </div>
                  </div>
                </div>
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
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons-vue";
import { replaceObjectKeys } from "@pansy/utils";
import _ from "lodash";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useStore } from "vuex";
import curveChart from "../components/echart/curveChart.vue";
import LineChart from "../components/echart/lineChart.vue";
import pieChart from "../components/echart/pieChart.vue";
import transverseLineChart from "../components/echart/transverseLineChart.vue";
import timeRadioGroup from "./components/timeRadioGroup.vue";
import { usePageName } from "@ghcloud/cube-utils"
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'


export default defineComponent({
  components: {
    ArrowUpOutlined,
    ArrowDownOutlined,
    timeRadioGroup,
    pieChart,
    curveChart,
    LineChart,
    transverseLineChart,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const applicationCode = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      period: "",
      dateType: "",
      alarmLeaveList: [],
      topAlarmLevelId: "",
      lastTopAlarmLevelId: "",
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
        topTimeSlot: "",
        xData: [],
        series: [],
      },
      alarmEvent: {
        xData: [],
        series: [],
        alarmTopThreeEventNames: "",
        alarmTopEventName: "",
        alarmTopNum: 0,
      },
      areaAlarm: {
        xData: [],
        series: [],
        alarmTopThreeAreaNames: "",
        alarmTopAreaName: "",
        alarmTopNum: 0,
      },
      handelAlarm: {
        alarmHandlerTotalNum: 0,
        alarmUnresolvedHandlerTotalNum: 0,
        alarmHandlerTopThreeUserNames: "",
        sequence: {
          xData: [],
          series: [
            {
              data: [],
            },
          ],
        },
        reverse: {
          xData: [],
          series: [{ data: [] }],
        },
      },
      alarmLevelHandler: [],
      userHandlerAlarmTop: {
        xData: [],
        series: [{ data: [] }],
      },
      userHandlerAlarmLastTop: {
        xData: [],
        series: [{ data: [] }],
      },
      patrol: {
        mostAbnormalPatrolNum: "",
        mostAbnormalPatrolName: "",
        countNum: 0,
        xData: [],
        series: [],
      },
    });
    const userHandlerAlarmLevel = computed(() => (code, type) => {
      let currentItem = state.alarmLevelHandler.find((item) => item.code === code);
      if (currentItem) {
        return currentItem[type];
      } else {
        return "--";
      }
    });
    const deviceStatusNum = computed(() => (type) => {
      let number = state.deviceNum.statusListVos.find((item) => item.name == type);
      if (number) {
        return number.num;
      } else {
        return 0;
      }
    });
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
    });
    onMounted(async () => {
      getAlarmLeaveList();
    });
    const changeDate = (type) => {
      state.dateType = type;
      alarmTotalStatistic(type);
      getAlarmLevelStatistic(type);
      alarmTrendAnalysis(type);
      alarmEventAnalysis(type);
      alarmAreaAnalysis(type);
      alarmHandelEfficiencyAnalysis(type);
      alarmHandelAreaAnalysis(type);
      getDeviceStatusNumber();
      if (state.topAlarmLevelId) {
        userHandlerTopAnalysis(type);
      }
      if (state.lastTopAlarmLevelId) {
        userHandlerLastTopAnalysis(type);
      }
    };
    const changeTopAlarmLevelId = () => {
      userHandlerTopAnalysis(state.dateType);
    };
    const changeLastTopAlarmLevelId = () => {
      userHandlerLastTopAnalysis(state.dateType);
    };
    // 获取报警等级
    const getAlarmLeaveList = () => {
      proxy.$api.getAlarmLevels().then((res) => {
        state.alarmLeaveList = replaceObjectKeys(res, {
          name: "label",
          id: "value",
          code: "code",
        });
        if (res instanceof Array && res.length) {
          state.topAlarmLevelId = _.cloneDeep(res[0].id);
          state.lastTopAlarmLevelId = _.cloneDeep(res[0].id);
          userHandlerTopAnalysis(state.dateType);
          userHandlerLastTopAnalysis(state.dateType);
        }
      });
    };
    // 基本信息
    const alarmTotalStatistic = (type) => {
      proxy.$api
        .alarmTotalStatistic({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.baseInfo = res;
        });
    };
    // 获取设备正常数
    const getDeviceStatusNumber = () => {
      proxy.$api
        .getDeviceStatusNumber({ applicationCode: applicationCode.value })
        .then((res) => {
          state.deviceNum = res;
        });
    };
    // 报警级别占比
    const getAlarmLevelStatistic = (type) => {
      proxy.$api
        .alarmLevelStatistic({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.leaveAlarm.data = res.map((item) => {
            return {
              name: item.name,
              value: item.alarmNum,
            };
          });
          state.leaveAlarm.nameData = res.map((item) => item.name);
          // 总数
          let sum = 0;
          if (res.length) {
            state.leaveAlarm.total = res.reduce(function (pre, curr) {
              return (sum = pre.alarmNum + curr.alarmNum);
            });
          }
          // 其他信息
          state.leaveAlarm.baseInfo = res.map((item) => {
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
        .alarmTrendAnalysis({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.alarm.topTimeSlot = res.topTimeSlot;
          state.alarm.xData = res.alarmTrendStatisticsVOS.map((item) => item.period);
          state.alarm.series = [
            {
              data: res.alarmTrendStatisticsVOS.map((item) => item.alarmNum),
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
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.alarmEvent.xData = res.alarmCurrencyStatisticsVOS.map(
            (item) => item.name
          );
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
          applicationCode: applicationCode.value,
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
    // 报警处理分析
    const alarmHandelAreaAnalysis = (type) => {
      proxy.$api
        .alarmHandelAreaAnalysis({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.handelAlarm.alarmHandlerTotalNum = res.alarmHandlerTotalNum;
          state.handelAlarm.alarmUnresolvedHandlerTotalNum =
            res.alarmUnresolvedHandlerTotalNum;
          state.handelAlarm.alarmHandlerTopThreeUserNames =
            res.alarmHandlerTopThreeUserNames;
          let topTenUserHandlerStatisticsVOS = res.topTenUserHandlerStatisticsVOS.sort(
            compare("alarmHandlerTotalNum")
          );
          state.handelAlarm.sequence.xData = topTenUserHandlerStatisticsVOS.map(
            (item) => item.name
          );
          state.handelAlarm.sequence.series = [
            {
              data: topTenUserHandlerStatisticsVOS.map(
                (item) => item.alarmHandlerTotalNum
              ),
              color: "#1890FF",
            },
          ];
          let lastTopTenUserHandlerStatisticsVOS = res.lastTopTenUserHandlerStatisticsVOS.sort(
            compare_ASC("alarmHandlerTotalNum")
          );
          state.handelAlarm.reverse.xData = lastTopTenUserHandlerStatisticsVOS.map(
            (item) => item.name
          );
          state.handelAlarm.reverse.series = [
            {
              data: lastTopTenUserHandlerStatisticsVOS.map(
                (item) => item.alarmHandlerTotalNum
              ),
              color: "#5654F5",
            },
          ];
        });
    };
    // 报警级别处理效率统计
    const alarmHandelEfficiencyAnalysis = (type) => {
      proxy.$api
        .alarmHandelEfficiencyAnalysis({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
        })
        .then((res) => {
          state.alarmLevelHandler = res;
        });
    };
    // 用户报警处理效率排名前10
    const userHandlerTopAnalysis = (type) => {
      proxy.$api
        .userHandlerTopAnalysis({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
          alarmLevelId: state.topAlarmLevelId,
        })
        .then((res) => {
          res = res.reverse();
          state.userHandlerAlarmTop.xData = res.map((item) => item.alarmHandlerName);
          state.userHandlerAlarmTop.series = [
            {
              data: res.map((item) => {
                return {
                  value: item.avgProcessMinutes,
                  averageProcessing: item.averageProcessing,
                };
              }),
              color: "#FBA33F",
            },
          ];
        });
    };
    // 用户报警处理效率排名倒数前10
    const userHandlerLastTopAnalysis = (type) => {
      proxy.$api
        .userHandlerLastTopAnalysis({
          applicationCode: applicationCode.value,
          period: state.period,
          type: type,
          alarmLevelId: state.lastTopAlarmLevelId,
        })
        .then((res) => {
          let data = res.sort(descendCompare("avgProcessMinutes")).reverse();
          state.userHandlerAlarmLastTop.xData = data.map((item) => item.alarmHandlerName)
          state.userHandlerAlarmLastTop.series = [
            {
              data: data.map((item) => {
                return {
                  value: item.avgProcessMinutes,
                  averageProcessing: item.averageProcessing,
                };
              }),
              color: "#FBA33F",
            },
          ];
        });
    };
    // 排序
    const compare = (key) => {
      return function (value1, value2) {
        let val1 = value1[key];
        let val2 = value2[key];
        return val1 - val2;
      };
    };
    // 降序排序
    const descendCompare = (key) => {
      return function (value1, value2) {
        let val1 = value1[key];
        let val2 = value2[key];
        return val2 - val1;
      };
    };
    //正序排序
    const compare_ASC = (key) => {
      return function (value1, value2) {
        let val1 = value1[key];
        let val2 = value2[key];
        return val2 - val1;
      };
    };
    return {
      ...toRefs(state),
      changeDate,
      userHandlerAlarmLevel,
      changeTopAlarmLevelId,
      changeLastTopAlarmLevelId,
      deviceStatusNum,
      KEYWORD_ALIAS
    };
  },
});
</script>

<style lang="less" scoped>
.statistic {
  height: 100%;
}

:deep(.layout-container) {
  background: #f0f2f5;
  padding: 0;

  .layout-header {
    background: #ffffff;
    padding: 0 16px;
  }
}

.statistic-content {
  height: 100%;
  overflow-y: auto;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-auto-flow: row dense;
  grid-gap: 16px;
  height: 2016px;

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

  .item-box5 {
    grid-column-start: 1;
    grid-column-end: 7;
    height: 586px;
  }

  .item-box6 {
    grid-column-start: 1;
    grid-column-end: 7;
    height: 626px;
  }

  .item-box7 {
    grid-column-start: 1;
    grid-column-end: 7;
    height: 370px;
  }

  .total-box {
    width: 100%;
  }

  .card-body-box {
    height: 100%;

    .statistic-item {
      width: calc(50% - 24px);
      height: 100%;

      .top-statistic {
        height: 88px;
        background: #fbfbfb;

        .grid-item {
          .label {
            line-height: 24px;
            width: 80px;
            text-align: center;
            border-radius: 4px 4px 4px 4px;
            color: #ffffff;
            font-size: 12px;
            margin-right: 16px;
          }

          &:nth-child(1) {
            .label {
              background: #ff4070;
            }
          }

          &:nth-child(2) {
            .label {
              background: #fba33f;
            }
          }

          &:nth-child(3) {
            .label {
              background: #5654f5;
            }
          }

          &:nth-child(4) {
            .label {
              background: #1890ff;
            }
          }
        }
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        font-size: 14px;
      }
    }
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

  .top-statistic {
    height: 88px;
    background: #fbfbfb;
    border-radius: 6px 6px 6px 6px;
    width: 100%;

    .left-statistic {
      flex: 1;

      &-item {
        flex: 1;

        img {
          width: 64px;
          height: 64px;
        }

        .title {
          font-size: 14px;
          color: #606266;
          margin: 18px;
        }

        .value {
          font-size: 30px;
          font-weight: 500;
          color: #fba33f;
        }

        &:first-child {
          .value {
            color: #13c2c2;
          }
        }
      }
    }

    .right-statistic {
      flex: 1;
    }
  }

  .chart-statistic {
    flex: 1;

    &-item {
      flex: 1;
      height: 100%;
    }
  }

  .chart-header {
    height: 40px;

    .title {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .chart-box {
    height: 100%;
  }
}

:deep(.ant-card) {
  width: 100%;
  height: 100%;
}
</style>
