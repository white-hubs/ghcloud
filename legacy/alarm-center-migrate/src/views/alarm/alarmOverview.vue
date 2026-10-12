<template>
  <g-layout :title="pageTitle ?? '报警总览'">
    <template #content-search>
      <a-form layout="inline" :model="form">
        <a-form-item>
          <a-radio-group v-model:value="form.type" @change="changeType">
            <a-radio-button value="TODAY">今日</a-radio-button>
            <a-radio-button value="THIS_WEEK">本周</a-radio-button>
            <a-radio-button value="THIS_MONTH">本月</a-radio-button>
            <a-radio-button value="THIS_YEAR">本年</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model:value="form.rangePicker" :style="{ width: '218px' }"
            @change="changeDate"></a-range-picker>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="searchRecord">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <div class="alarm-info">
        <div class="alarm-info-up">
          <div>
            <a-card title="报警统计" style="height: 286px" size="small">
              <div class="alarm-num">
                <div class="alarm-num-left">
                  <div class="left-info">
                    <div class="left-info-icon">
                      <AlertTwoTone :style="{ fontSize: '30px' }" />
                    </div>
                    <div class="left-info-label">报警总数</div>
                  </div>
                  <div class="left-num">
                    <span>{{ alarmNum }}</span>
                    个
                  </div>
                </div>
                <div class="alarm-num-right">
                  <div>
                    <FileUnknownTwoTone />
                    待确认
                    <span>{{ ALARM_UN_CONFIRMED }}</span>
                    个
                  </div>
                  <div>
                    <FileAddTwoTone />
                    处理中
                    <span>{{ ALARM_PROGRESS_CONFIRMED }}</span>
                    个
                  </div>
                  <div>
                    <ScheduleTwoTone />
                    已挂起
                    <span>{{ ALARM_SUSPEND }}</span>
                    个
                  </div>
                  <div>
                    <ScheduleTwoTone />
                    已确认
                    <span>{{ ALARM_HANDLER }}</span>
                    个
                  </div>
                </div>
              </div>
              <div class="alarm-result">
                <div>
                  <FireTwoTone />
                  实报
                  <span>{{ ALARM_ACTUAL }}</span>
                  个
                </div>
                <div>
                  <FileExcelTwoTone />
                  误报
                  <span>{{ ALARM_IMPRACTICAL }}</span>
                  个
                </div>
              </div>
            </a-card>
          </div>
          <div>
            <a-card title="报警类型" style="height: 286px" size="small">
              <div style="height: 260px">
                <barChart :chartData="chartData" />
              </div>
            </a-card>
          </div>
        </div>
        <div class="alarm-info-down">
          <a-card title="报警趋势" size="small">
            <div style="height: 245px">
              <lineChart :dayType="form.type" :chartData="lineData" lineStyleColor="rgba(24, 141, 255, 1)"
                areaStyleColor="rgba(24, 141, 255, .2)" />
            </div>
          </a-card>
        </div>
      </div>
    </template>
  </g-layout>
</template>

<script lang="jsx">
import {
  defineComponent,
  toRefs,
  reactive,
  createVNode,
  ref,
  getCurrentInstance,
  onMounted,
} from "vue";
import {
  AlertTwoTone,
  FileUnknownTwoTone,
  ScheduleTwoTone,
  FireTwoTone,
  FileExcelTwoTone,
  FileAddTwoTone,
} from "@ant-design/icons-vue";
import { timeFormat } from "@/utils/common";
import moment from "moment";
import barChart from "./bar.vue";
import lineChart from "./line.vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    AlertTwoTone,
    FileUnknownTwoTone,
    ScheduleTwoTone,
    FireTwoTone,
    FileExcelTwoTone,
    FileAddTwoTone,
    barChart,
    lineChart,
  },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const state = reactive({
      form: {
        type: "TODAY",
        rangePicker: null,
      },
      period: null,
      alarmNum: 0,
      ALARM_HANDLER: 0,
      ALARM_UN_CONFIRMED: 0,
      ALARM_PROGRESS_CONFIRMED: 0,
      ALARM_SUSPEND: 0,
      ALARM_IMPRACTICAL: 0,
      ALARM_ACTUAL: 0,
      chartData: [],
      lineData: [],
    });
    onMounted(() => {
      changeType("TODAY");
      getData()
    });
    //日期快速选择
    const changeType = () => {
      state.form.rangePicker = null;
      state.period = null;
      switch (state.form.type) {
        case "TODAY":
          state.period = [
            moment().startOf('days').format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss')
          ].join(",");
          break;
        case "THIS_WEEK":
          state.period = [
            moment().startOf('weeks').format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss')
          ].join(",");
          break;
        case "THIS_MONTH":
          state.period = [
            moment().startOf('months').format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss')
          ].join(",");
          break;
        case "THIS_YEAR":
          state.period = [
            moment().startOf('years').format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss')
          ].join(",");
          break;
        default:
          break;
      }
    };
    //时期范围选择
    const changeDate = () => {
      if (state.form.rangePicker) {
        state.form.type = null;
        state.period = [
          timeFormat(state.form.rangePicker[0], false),
          timeFormat(state.form.rangePicker[1], false),
        ].join(",");
      }
    };
    //获取数据
    const getData = async () => {
      const data = await proxy.$api.getAlarmStatistics({
        period: state.period,
      });
      state.alarmNum = data.alarmNum;

      data.alarmResultStatisticsVOS.forEach(item => {
        // 误报
        if (item.alarmHandlerResult === "ALARM_IMPRACTICAL") {
          state.ALARM_IMPRACTICAL = item.alarmNum;
        }
        // 实报
        if (item.alarmHandlerResult === "ALARM_ACTUAL") {
          state.ALARM_ACTUAL = item.alarmNum;
        }
      });
      data.alarmStatusStatisticsVOS.forEach(item => {
        // 已处理
        if (item.alarmStatus === "ALARM_HANDLER") {
          state.ALARM_HANDLER = item.alarmNum;
        }
        // 待确认
        if (item.alarmStatus === "ALARM_UN_CONFIRMED") {
          state.ALARM_UN_CONFIRMED = item.alarmNum;
        }
        // 处理中
        if (item.alarmStatus === "ALARM_PROGRESS_CONFIRMED") {
          state.ALARM_PROGRESS_CONFIRMED = item.alarmNum;
        }
        // 已挂起
        if (item.alarmStatus == "ALARM_SUSPEND") {
          state.ALARM_SUSPEND = item.alarmNum;
        }
      });
      const data2 = await proxy.$api.getAlarmStatisticsTypeRank({
        period: state.period,
        type: state.form.type,
      });
      state.chartData = data2;

      const data3 = await proxy.$api.getAlarmStatisticsTrend({
        period: state.period,
        type: state.form.type,
      });
      state.lineData = [];
      data3.forEach(item => {
        state.lineData.push({
          value: item.alarmNum,
          name: item.period,
        });
      });
    };
    //点击查询
    const searchRecord = () => {
      getData();
    };
    //点击重置
    const reset = () => {
      state.form.type = "TODAY";
      state.form.rangePicker = null;
      changeType("TODAY");
      getData()
    };
    return {
      ...toRefs(state),
      searchRecord,
      reset,
      getData,
      changeType,
      changeDate,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>
.alarm-info {
  .alarm-info-up {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    >div {
      width: 49%;
    }
  }

  .alarm-num {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 130px;

    >div {
      flex: 1;

      &.alarm-num-left {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        border-right: 1px solid #f0f0f0;

        .left-info {
          margin-right: 20px;

          .left-info-icon {
            text-align: center;
          }
        }

        .left-num {
          >span {
            font-size: 26px;
            margin-right: 2px;
          }
        }
      }

      &.alarm-num-right {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        grid-gap: 16px;

        >div {
          // text-align: center;
          padding-left: 16px;

          >span {
            font-size: 20px;
            margin: 0 5px;
          }
        }
      }
    }
  }

  .alarm-result {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 130px;
    border-top: 1px solid #f0f0f0;
    margin-top: 5px;

    >div {
      display: flex;
      align-items: center;
      justify-content: center;

      >span {
        font-size: 20px;
        margin: 0 5px;
      }
    }
  }
}
</style>
