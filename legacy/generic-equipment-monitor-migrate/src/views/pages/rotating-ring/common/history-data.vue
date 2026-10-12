<template>
  <div class="search-top">
    <TimeRadioGroup v-model:value="period" @change="changeDate"></TimeRadioGroup>
    <a-button type="primary" style="margin-left: 20px;" @click="search">查询</a-button>
  </div>
  <historyCard
    title="历史（电池）温度数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'bat_temp'"
    :showSelect="false"
    :deviceOption="[{value: 'bat_temp', label: '电池温度' }]"
  />
  <historyCard
    title="历史电压数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'out1_p'"
  />
  <historyCard
    title="历史UPS负载数据"
    :period="period"
    :timeType="timeType"
    :showSelect="false"
    :deviceOption="[{value: 'out1_load_p', label: 'UPS负载' }]"
  />
  <historyCard
    title="历史UPS输出功率数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'out1_p'"
  />
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,nextTick,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import HistoryLineChart from "../../components/echart/historyLineChart.vue";
import HistoryLineChartE from "../../components/echart/historyLineChartE.vue";
import moment from "moment";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import TimeRadioGroup from "../../statisticalAnalysis/components/timeRadioGroup.vue";
import LineChart from "./lineChart.vue";
import historyCard from "./historyCard.vue";

export default defineComponent({
  components: {
    HistoryLineChart,
    HistoryLineChartE,
    TimeRadioGroup,
    LineChart,
    historyCard
  },
  props: {
    deviceId: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const deviceId = route.query.deviceId;
    const state = reactive({
      historyData: [],
      period: '',
      search: {
        attributeCode: [],
        period: "",
      },
      timeType: ''
    });
    const search = () => {

    }
    const changeDate = async (type) => {
      state.timeType = type
    };
    state.titles = ['输入电压', '输出电压']
    state.xData = ["04:00", "08:00", "12:00", "16:00", "20:00", "24h"]
    state.yData = [
        {
          name: '输入电压',
          lineColor: 'rgba(24, 144, 255, 1)',
          // linearGradientColor: ["rgba(16, 128, 255, 0)", "rgba(17, 126, 255, 0.16)"],
          data: [10,20,50,20,90,80],
          // showSymbol:true,
          smooth:true,
          symbolSize: 8
        },
        {
          name: '输出电压',
          lineColor: 'rgba(38, 166, 154, 1)',
          // linearGradientColor: ["rgba(38, 166, 154, 0)", "rgba(38, 166, 154, 0.16)"],
          data: [100,120,150,220,190,130],
          // showSymbol:true,
          smooth:true,
          symbolSize: 8
        },
    ]
    return {
      ...toRefs(state),
      changeDate,
      search,
      deviceId,
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
    font-weight: 500;
    color: #1D2129;
    line-height: 24px;
    padding-bottom: 5px;
    border-bottom: 1px solid #E4E7EDFF;
  }
}
.search-top{
  display: flex;
}
</style>
