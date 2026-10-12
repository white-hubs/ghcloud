<template>
  <div class="panel">
    <SubPanelTemplate title="报警统计">
        <template #extra>
          <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmStatistics" />
        </template>
      <div class="rate-pie-chart">
        <RatePie :value="alarmProportion.handle" title="报警处理占比" color="#5AD0EA" class="rate-pie" />
        <RatePie :value="alarmProportion.really" title="报警真实占比" class="rate-pie" />
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
    <SubPanelTemplate title="报警事件top5">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="eventInfo"
        @search="alarmEventTop"
        ></DateInlineForm>
      </template>
      <div class="body" v-show="alarmTop.arr.length > 0" style="min-height: 250px">
        <EventAlarmItem
          v-for="(item, index) in alarmTop.arr"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" v-show="alarmTop.arr.length <= 0" style="min-height: 150px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RatePie from "../public/charts/ratePie/ratePie.vue";
import { ModelValueItf } from '../public/types'
import { alarmStatistics, statisticsLevel, statisticsTrend } from "@/api/alarm";
import { getAssetsImage } from "../../../utils/getImage";
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
import { VideoType } from '@/api/models/vmonitor'
import EventAlarmItem from "../public/eventAlarmItem.vue";
import usrCommon from "../../hooks/useCommon";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import noData from "../public/noData.vue";
import bus from "@/utils/bus";

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const timeFrame = ref<ModelValueItf>();
const eventInfo = ref<ModelValueItf>();
const alarmTop = reactive({ arr: [] });
const alarmProportion = ref({
  handle: 0,
  really: 0,
});
const {
  videoList,getEventTop
} = usrCommon();
let cameraList = ref<VideoType[]>([]);
const cameraListTotal = ref([]);
const num = ref(0);
// 获取处理占比和真实占比
const  getAlarmStatistics =  async ()=>{
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
  };
  let res: any = await alarmStatistics(params);
  if (res.alarmNum && res.alarmNum !== 0) {
    alarmProportion.value.really =
      Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
    alarmProportion.value.handle =
      Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
  } else {
    alarmProportion.value.really = 0;
    alarmProportion.value.handle = 0;
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
// 获取视频列表
async function getVideo() {
  cameraListTotal.value = await videoList();
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = cameraListTotal.value[num.value];
  }
}
// 报警事件Top5
const alarmEventTop = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  let res = await getEventTop(param);
  alarmTop.arr = res;
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
onMounted(()=>{
  getVideo()
})
</script>
<style lang="less" scoped>
.rate-pie-chart {
  width: 100%;
  padding-top: 8px;
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  justify-content: space-between;
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
cursor: pointer;
  img {
    width: 14px;
    height: 14px;
  }
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

.body-num {
  margin-bottom: 10px;
}

.body {
  margin-top: 16px;
}
</style>