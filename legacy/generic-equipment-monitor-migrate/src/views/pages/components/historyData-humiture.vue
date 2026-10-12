<template>
  <div class="search-top">
    <TimeRadioGroup v-model:value="period" @change="changeDate"></TimeRadioGroup>
    <a-button style="margin-left: 10px;" type="primary" @click="handleSearch">查询</a-button>
  </div>
  <historyCard
    title="历史温度数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'temp'"
    :showSelect="false"
    :deviceData="[{value: 'temp', label: '温度' }]"
    unit="{ x: '', y: '单位：℃' }"
    id="chart_1"
    ref="chart1Ref"
  />
  <historyCard
    title="历史湿度数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'hum'"
    :showSelect="false"
    :deviceData="[{value: 'hum', label: '湿度' }]"
    unit="{ x: '', y: '单位：℃' }"
    id="chart_2"
    ref="chart2Ref"
  />
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,nextTick,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import TimeRadioGroup from "../statisticalAnalysis/components/timeRadioGroup.vue";
import historyCard from "../rotating-ring/common/historyCard.vue";
import HistoryLineChartRing from "../rotating-ring/common/historyLineChart-ring.vue";
import moment from "moment";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  components: {
    TimeRadioGroup,
    historyCard,
    HistoryLineChartRing
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
    const changeDate = async (type) => {
      state.timeType = type
    };
    const chart1Ref = ref()
    const chart2Ref = ref()
    const handleSearch = () => {
      if (chart1Ref.value) chart1Ref.value.getTempData()
      if (chart2Ref.value) chart2Ref.value.getTempData()
    };
    return {
      chart1Ref,
      chart2Ref,
      ...toRefs(state),
      changeDate,
      handleSearch,
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
