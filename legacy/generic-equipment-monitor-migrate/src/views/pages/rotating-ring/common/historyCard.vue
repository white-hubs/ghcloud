<template>
  <div class="card list-data">
    <div class="wrap">
      <div class="history-content">
        <div style="height:300px" v-if="historyData">
          <HistoryLineChartRing
            :historyData="historyData"
            :deviceData="deviceOption"
            :id="id"
            :timeType="timeType + key"
            :unit="unit"
            :title="title"
            v-if="applicationCode !== 'ELECTRICMANAGE'"
          >
            <a-select
              v-if="showSelect"
              v-model:value="deviceValue"
              style="width: 200px; margin-left: 20px;"
              placeholder="请选择设备属性"
              :options="deviceOption"
              @change="deviceChange"
            />
          </HistoryLineChartRing>
          <HistoryLineChartE v-else :historyData="historyData" />
        </div>
        <div v-else>
          <div class="item-title">{{ title }} </div>
          <a-empty />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,nextTick,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import HistoryLineChartRing from "./historyLineChart-ring.vue";
import HistoryLineChartE from "../../components/echart/historyLineChartE.vue";
import moment from "moment";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import TimeRadioGroup from "../../statisticalAnalysis/components/timeRadioGroup.vue";
import LineChart from "./lineChart.vue";
import * as echarts from "echarts";
import { filterU, filterSame, convertSeconds, batteryfilter, groupArray, getUnit} from "@/hooks/device-info.ts";

export default defineComponent({
  components: {
    HistoryLineChartRing,
    HistoryLineChartE,
    TimeRadioGroup,
    LineChart
  },
  props: {
    deviceId: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    timeType: {
      type: String,
      default: "",
    },
    period: {
      type: String,
      default: "",
    },
    typeCode: {
      type: String,
      default: "",
    },
    showSelect: {
      type: Boolean,
      default: true,
    },
    deviceData: {
      type: Array,
      default: [],
    },
    unit: {
      type: Object,
      default: { x: '', y: '' },
    },
    filterName: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit, expose }) {

    watch(
      () => props.period,
      (n) => {
        nextTick(() => {
          if(n) {
            getTempData()
          }
        })
      },
      { immediate: true, deep: true }
    );
    const store = useStore();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const deviceId = route.query.deviceId;
    const myChart = ref()
    const applicationCode = ref("");
    const state = reactive({
      deviceOption: [],
      deviceValue: props.typeCode,
      tempXData: [],
      tempYData: [],
      tempTitles: [],
      historyData: []

    });
    const getSelectData = () => {
      if (props.deviceData && props.deviceData.length > 0) {
        state.deviceOption = props.deviceData
        state.deviceValue = state.deviceOption[0].value
        getTempData()
      }
    };
    const deviceChange = () => {
      getTempData()
    }
    const getTempData = async () => {
      const data = await getHistoryData();
      state.historyData = data
    }
    // 获取历史数据
    const getHistoryData = async (attributeCode = []) => {
      try {
        const times = props.period.split(',');
        if(!state.deviceValue) return
        const info = {
          deviceId: deviceId,
          propCodes: state.deviceValue,
          startTs: times[0] ? new Date(times[0]).getTime() : '',
          endTs: times[1] ? new Date(times[1]).getTime() : '',
        };
        if (applicationCode.value === "ELECTRICMANAGE"){
          let data = {...info};
          data.attributives = value.value;
          data.attributeCode = undefined;
          data.timeFlag = undefined;
          data.period = props.period;
          return proxy.$api.getHistorical(data)
        } else {
          return proxy.$api.gethistory(info)
        }
      } catch (error) {
        return ''
      }
    };

    onMounted(() => {
      applicationCode.value = JSON.parse(sessionStorage.getItem("GH-currentApplication")).code;
      getSelectData()
    });
    expose({
      getTempData
    })
    return {
      ...toRefs(state),
      applicationCode,
      getHistoryData,
      getTempData,
      deviceChange,
      getSelectData,
      deviceId,
      filterU, filterSame, convertSeconds, batteryfilter, groupArray, getUnit
    };
  },
});
</script>
<style scoped lang="less">
.card{
  background: #FFFFFF;
  border-radius: 4px;
  margin-top: 20px;
  .title{
    font-family: Source Han Sans, Source Han Sans;
    font-weight: bold;
    font-size: 16px;
    color: #1D2129;
    line-height: 24px;
    padding-bottom: 5px;
    border-bottom: 1px solid #E4E7EDFF;
    display: flex;
    align-items: center;
  }
}
.search-top{
  display: flex;
}
.item-title{
  line-height: 35px;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
}
</style>
