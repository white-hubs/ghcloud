<template>
  <div class="search-top">
    <TimeRadioGroup v-model:value="period" @change="changeDate"></TimeRadioGroup>
    <a-button style="margin-left: 10px;" type="primary" @click="handleSearch">查询</a-button>
  </div>
  <historyCard
    title="历史电池温度数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'bat_temp'"
    :showSelect="false"
    :deviceData="[{value: 'bat_temp', label: '电池温度' }]"
    unit="{ x: '', y: '单位：℃' }"
    id="chart_1"
    ref="chart1Ref"
  />
  <historyCard
    title="历史电压数据"
    :period="period"
    :timeType="timeType"
    v-show="!loading"
    :showSelect="true"
    :deviceData="batUList"
    unit="{ x: '', y: '单位：V' }"
    id="chart_2"
    ref="chart2Ref"
  />
  <historyCard
    title="历史UPS负载数据"
    :period="period"
    :timeType="timeType"
    :typeCode="'out1_load_p'"
    :showSelect="false"
    :deviceData="[{value: 'out1_load_p', label: 'UPS负载' }]"
    unit="{ x: '', y: '单位：%' }"
    id="chart_3"
    ref="chart3Ref"
  />
  <historyCard
    title="历史UPS输出功率数据"
    :period="period"
    :timeType="timeType"
    :showSelect="false"
    :deviceData="[{value: 'out1_fr', label: '输出功率' }]"
    unit="{ x: '', y: '单位：W' }"
    id="chart_4"
    ref="chart4Ref"
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
import { filterU, filterI, filterSame, convertSeconds, batteryfilter, groupArray, getUnit} from "@/hooks/device-info.ts";

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
      timeType: '',
      batUList: [],
      batIList: [],
      loading: true,
      batUUnit: '',
      batIUnit: '',
    });
    onMounted( async () => {
      state.loading = true
      await getDeviceAttribute()
    })
    const getDeviceAttribute = () => {
      proxy.$api
          .getDeviceAttribute({ id: deviceId, withPropertySpec: true })
          .then((res) => {
            const list = res.productPropVoList
            state.batUList = [...filterU(list).inv, filterU(list).outv ]
            state.batUList = state.batUList.map((item) => {
              return {
                label: item.propName,
                value: item.propCode,
                unitName: item.unitName
              }
            });
            state.batIList = [...filterI(list).inv, filterI(list).outv ]
            state.batIList = state.batIList.map((item) => {
              return {
                label: item.propName,
                value: item.propCode,
                unitName: item.unitName
              }
            });
            state.batUUnit = state.batUList[0].unitName;
            state.batIUnit = state.batIList[0].unitName;
            state.loading = false
          }).catch(() => {
            state.loading = false
          });
    }
    const changeDate = (type) => {
      state.timeType = type
    };
    const chart1Ref = ref()
    const chart2Ref = ref()
    const chart3Ref = ref()
    const chart4Ref = ref()
    const handleSearch = () => {
      if (chart1Ref.value) chart1Ref.value.getTempData()
      if (chart2Ref.value) chart2Ref.value.getTempData()
      if (chart3Ref.value) chart3Ref.value.getTempData()
      if (chart4Ref.value) chart4Ref.value.getTempData()
    };
    return {
      chart1Ref,
      chart2Ref,
      chart3Ref,
      chart4Ref,
      ...toRefs(state),
      changeDate,
      getDeviceAttribute,
      handleSearch,
      deviceId,
      filterU, filterI, filterSame, convertSeconds, batteryfilter, groupArray, getUnit
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
  }
}
.search-top{
  display: flex;
}
</style>
