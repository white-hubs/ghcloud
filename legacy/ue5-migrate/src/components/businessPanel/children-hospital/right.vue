<template>
  <div >
    <SubPanelTemplate title="人员通行趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="generalTime" @search="changeHandlegeneralTime">
        </DateInlineForm>
      </template>
      <!-- <OperateDays :value="1719" title="设备总数" class="body-num" /> -->
      <div class="flex-between">
        <div class="statistic-item flex-center" @click="openEvent(item)" v-for="item in alarmSituationStatistic">
          <div class="left">
            <img :src="getAssetsImage(item.img)" />
          </div>
          <div class="right">
            <count-to :startVal="0" :endVal="item.value" :duration="4000" class="scroll-number"
              :style="{ color: item.color }"></count-to>
            <div style="white-space: nowrap;">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <div class="chart">
        <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
          :color="['#2989FF', '#FF6E23']"></stackedLine>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常事件Top5">
      <template #extra>
        <DateInlineForm v-model:modelValue="receiveOverviewTime" @search="changeHandleReceiveOverviewTime">
        </DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px" >
        <EventAlarmItem v-for="(item, index) in alarmRank" :key="item.id" :sort="index + 1" :name="item.name"
          :linkRatio="item.ringRatio" :count="item.value" :ratio="item.ratio + '%'" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="视频监控" class="monitor">
      <template #extra>
        <div class="right-bar" @click="changeVideo" :class="[cameraListTotal.length - 1 === 0 ? 'forbidden' : '']">
          <div>切换</div>
          <img :src="getAssetsImage('changingOver.png')" alt="" />
        </div>
      </template>
      <div class="body">
        <div class="title">监控组</div>
        <div class="group" v-show="cameraList.length > 0">
          <div class="camera" v-for="(item, index) in cameraList" :key="index" @click="clickCamera(item)">
            <H5Video :cameraItem="item" :idStr="item.token + index"></H5Video>
          </div>
        </div>
        <div class="group" v-show="cameraList.length <= 0">
          <noData></noData>
        </div>
      </div>
    </SubPanelTemplate>
   <trafficRecords :date="generalTime.dateRange" v-if="generalFalg" :showModal="generalFalg" @close="generalFalg=false" :eventResult="eventResult"></trafficRecords>
   <videoModel :showModal="false" @close="generalFalg=false"></videoModel>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onBeforeUnmount} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { getAssetsImage } from "../../../utils/getImage";
import trafficRecords from "./components/trafficRecords.vue"
import videoModel from "./components/videoModel.vue"
import { CountTo } from "vue3-count-to";
import stackedLine from "../public/charts/stackedLine/stackedLine.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { ModelValueItf } from "../public/types";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { recordTrend } from "@/api/door";
import { VideoType } from "@/api/models/vmonitor";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import usrCommon from "../../hooks/useCommon";
import bus from "@/utils/bus";
import { alarmEvent } from '@/utils/requestData/accessControl'
import { useStateStore } from '@/pages/state/use-state-store';
const {
  videoList,
} = usrCommon();
const generalFalg = ref(false)
const eventResult = ref('')
const alarmSituationStatistic = ref<
  {
    label: string;
    value: number;
    img: string;
    color: string;
    key: string;
    alarmHandleResult: string;
  }[]
>([
  {
    label: "通行总次数",
    value: 0,
    img: "overView57.png",
    color: "#D0DEEE",
    key: "alarmNum",
    alarmHandleResult: "",
  },
  {
    label: "正常通行",
    value: 0,
    img: "overView56.png",
    color: "#F14545",
    key: "alarmActualNum",
    alarmHandleResult: "DO_PASS",
  },
  {
    label: "异常通行",
    value: 0,
    img: "overView2.png",
    color: "#FFC700",
    key: "alarmImpracticalNum",
    alarmHandleResult: "DO_REFUSE",
  },
]);
const lineData = reactive({
    title: "次",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [1, 2, 4, 5, 6, 8, 7],
            name: "正常通行",
            colors: [
                {
                    offset: 0,
                    color: "rgba(41, 137, 255, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(41, 137, 255, 0.20)",
                },
            ],
        },
        {
            data: [10, 12, 14, 5, 86, 8, 7],
            name: "异常通行",
            colors: [
                {
                    offset: 0,
                    color: "rgba(255, 110, 35, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(255, 110, 35, 0.02)",
                },
            ],
        },
    ],
});
let timer: any = reactive(null);
const receiveOverviewTime = ref<ModelValueItf>()
const generalTime = ref<ModelValueItf>()
const alarmRank = ref([]);
const num = ref(0);

const { globalState } = useStateStore();
let cameraList = ref<VideoType[]>([]);
const cameraListTotal = ref([]);
const changeHandleReceiveOverviewTime = async()=>{
  alarmRank.value = await alarmEvent(receiveOverviewTime.value.timeType);
}
// 人员通行趋势
const changeHandlegeneralTime = async()=>{
  let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        eventResult: "DO_PASS",
        dimension: generalTime.value.timeType
    }
  let res:any= await recordTrend(param)
  let time = "";
    if (generalTime.value.timeType === "TODAY") {
      time = "时";
    } else if (generalTime.value.timeType === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    lineData.xData = res.eventPass.xdata.map(item=>{
      item+=time
      return item
    })
  lineData.yData[0].data = res.eventPass.series[0].value
  lineData.yData[1].data = res.eventRefuse.series[0].value
  alarmSituationStatistic.value[0].value = res.total
  alarmSituationStatistic.value[1].value = res.eventPass.total
  alarmSituationStatistic.value[2].value = res.eventRefuse.total
}
// 获取视频列表
async function getVideo() {
  cameraListTotal.value = await videoList();
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = cameraListTotal.value[num.value];
  }
}
// 切换视频
const changeVideo = () => {
  if (num.value === cameraListTotal.value.length - 1) {
    num.value = 0;
  } else {
    num.value++;
  }
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = cameraListTotal.value[num.value];
  }
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
const init = ()=>{
  getVideo()
}
const openEvent = (item)=>{
  generalFalg.value = true
  eventResult.value = item.alarmHandleResult
}
onMounted(() => {
  init();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.statistic {
  width: 100%;
  height: 68px;
  background: rgba(0, 0, 0, 0.15);
  padding: 0 10px;
}

.statistic-item {
  flex: 1;
  color: #d0deee;
  font-size: 12px;
  cursor: pointer;

  .left {
    margin-right: 10px;

    img {
      width: 30px;
      height: 30px;
    }
  }

  .scroll-number {
    font-size: 22px;
  }
}

.chart {
  height: 180px;
}

.body-num {
  margin-bottom: 10px;
}

.body {
  margin-top: 16px;
}

.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  img {
    width: 14px;
    height: 14px;
  }
}
</style>