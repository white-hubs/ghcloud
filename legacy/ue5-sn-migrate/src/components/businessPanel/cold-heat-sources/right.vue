<template>
  <div class="panel">
    <SubPanelTemplate title="设备类型分布">
      <div class="chart">
          <RingChart
            :pieData="pieData"
            seriesName="设备类型统计"
            :total="eventNum"
          ></RingChart>
        </div>
        <div class="statistic">
          <div class="statistic-item" v-for="(item, index) in pieData">
            <a-statistic :value="item.value" :valueStyle="statisticStyle">
              <template #title>
                <div class="title flex-start">
                  <div class="box" :style="statisticValueStyle(index)"></div>
                  <span>{{ item.name }}</span>
                </div>
              </template>
              <template #suffix>
                <span>{{ item.ratio }}</span>
              </template>
            </a-statistic>
          </div>
        </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="产品分类报警top5">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmTypeTime"
          @search="areaAlarmStatistic"
        ></DateInlineForm>
      </template>
     <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length > 0">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index+1"
          :name="item.typeName"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
        />
      </div>
      <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率">
      <div class="equipmentInfo">
        <waterPolo
            title=""
            :value="faultRate"
            unit="%"
            bgColor="#FFAF2A"
            color="#FFAF2A"
          ></waterPolo>
          <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted,computed} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import DateInlineForm from "../public/dateInlineForm.vue";
import noData from "../public/noData.vue";
import RingChart from "../public/charts/ring/ring.vue";
import PieList from "../public/pieList.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import { statisticsDeviceTop,statisticsDeviceType } from "@/api/alarm";
import useCommon from "../../hooks/useCommon";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { AlarmRateList, ModelValueItf } from '../public/types'

const { getEquipmentNumber } = useCommon();
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const alarmTypeTime = ref<ModelValueItf>();
const pieData = ref([]);
const eventNum = ref<number>(0);
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "离线总数",
    value: 0,
  },
]);
const faultRate = ref(10);
const areaAlarmRank = ref([])
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: colors[index % colors.length],
  };
});
const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});
/**
 * 设备类型分布
 */
 const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  faultRate.value = 0
  pieData.value.length = 0;
  eventNum.value = 0
  if (JSON.stringify(res) === "{}") {
    return;
  }
  res.deviceStatusNums.forEach((item) => {
    if (item.name === "OFFLINE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
      dataList[0].value = res.deviceNum;
      dataList[1].value = item.num;
      dataList[1].label = faultRate.value;
    }
  });
  eventNum.value = res.deviceNum;
  res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      name: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colors[index],
      value: item.num,
    };
    pieData.value.push(obj);
  });
};
const changeHandleHiddenDangerTime = async()=>{}
const changeHandleAlarmTypeTime = async()=>{}
const changeHandleEquipmentFailure = async()=>{}
/**
 * 区域报警Top5
 */
 const areaAlarmStatistic = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: alarmTypeTime.value.dateRange.join(","),
    type: alarmTypeTime.value.timeType,
  };
  const res = await statisticsDeviceType(params);
  areaAlarmRank.value = res;
};
onMounted(()=>{
  equipmentStatistic()
})
</script>
<style lang="less" scoped>
 .chart {
   width: 100%;
   height: 200px;
  }
.statistic {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top:10px;

    .title {
      font-size: 12px;
      color: #d0deee;

      .box {
        margin-right: 8px;
      }
    }
}
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0 30px;
  align-items: center;
  height:300px;
}
</style>