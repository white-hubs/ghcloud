<template>
  <div class="panel">
    <SubPanelTemplates title="视频监控" class="monitor">
      <template #bar>
        <div
          class="right-bar"
          @click="changeVideo"
          :class="[cameraListTotal.length - 1 === 0 ? 'forbidden' : '']"
        >
          <div>切换</div>
          <img :src="getAssetsImage('changingOver.png')" alt="" />
        </div>
      </template>
      <div class="body">
        <div class="group" v-show="cameraList.length > 0">
          <div
            class="camera"
            v-for="(item, index) in cameraList"
            :key="item.id+index"
            @click="clickCamera(item)"
          >
            <H5Video :cameraItem="item" :idStr="item.token + index"></H5Video>
          </div>
        </div>
        <div class="group" v-show="cameraList.length <= 0">
          <noData></noData>
        </div>
      </div>
    </SubPanelTemplates>
    <SubPanelTemplate title="报警事件top5" class="alarm-event">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="eventTime"
          @search="changeEventTime"
        ></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px" >
        <EventAlarmItem
          v-for="(item, index) in alarmRank.list"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡逻异常数统计">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="unusualTime"
          @search="changeUnusualTime"
        ></DateInlineForm>
      </template>
      <div
        class="body"
        style="min-height: 200px; position: relative"
        :style="{ top: tableList.length <= 0 ? '-40px' : '0px' }"
      >
        <RollTable
          :key="falg"
          :column="column"
          :data="tableList"
          @click-row="handelClickRow"
        >
          <template #photos="{ record }">
            <a-image-preview-group>
              <a-image
                v-for="item in record.photos.url"
                :width="30"
                :height="30"
                :src="item"
              ></a-image>
            </a-image-preview-group>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import SubPanelTemplates from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import QuickTimeRange from "@/components/businessPanel/public/quick-time-range.vue";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import RollTable from "../public/rollTable/index.vue";
import tableData from "./rollTable";
import bus from "@/utils/bus";
import { AlarmAreaTop } from "@/api/models/alarm";
import usrCommon from "../../hooks/useCommon";
import { ModelValueItf } from "../public/types";
import { VideoType } from "@/api/models/vmonitor";
import { getAssetsImage } from "@/utils/getImage";
import { storeMenu } from "@/piniaStore/menu";
import { videoListDevices } from '@/api/vmonitor'
const piniaStoreMenu = storeMenu();
interface AlarmHandlType {
  list: AlarmAreaTop[];
}
interface cameraObj {
  name: string;
  token: string;
  session?: string;
  serverIp: string;
  code?: string;
}
const num = ref(0);
let timer: any = reactive(null);

let cameraList = ref<any[]>([]);
const cameraListTotal = ref([]);
const alarmRank = reactive<AlarmHandlType>({
  list: [],
});
let falg = ref<number>(0);
let tableList = reactive([]);
const {
  piniaStoreArea,
  eventTime,
  getEventTop,
  unusualTime,
  videoList,
  getremakerList,
} = usrCommon();

// 报警事件
async function changeEventTime() {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    type: eventTime.value.timeType,
  };
  alarmRank.list = await getEventTop(param);
}
// 巡逻异常
async function changeUnusualTime() {
  let param = {
    period: unusualTime.value.dateRange.join(","),
    pageNumber: 1,
    pageSize: 50,
  };
  tableList = await getremakerList(param);
  falg.value++;
}
// 获取视频列表
async function getVideo() {
  // cameraListTotal.value = await videoList();
  // if (cameraListTotal.value.length !== 0) {
  //   cameraList.value = cameraListTotal.value[num.value];
  // }
  let params = {
    areaId: piniaStoreArea.currentAreaId,
  }
  let data = await videoListDevices(params)
  cameraList.value = data.filter(e=>{
    if (e.thirdPartyId.includes('TFXGNVR') ) {
      return e
    }
  }).splice(0,4)
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
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const { column } = tableData();
function init() {
  getVideo();
  changeEventTime();
  changeUnusualTime();
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
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 140px;
  display: flex;
}

.body {
  // :deep(.ant-image){
  //    width: 120px;
  //    height: 120px;
  //    .ant-image-img{
  //       width: 100%;
  //       height: 100%;
  //    }
  // }
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

.alarm-event {
  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.extra {
  font-family: Roboto-Regular, Roboto;
  font-weight: 400;
  margin-left: 8px;

  span {
    color: #e7f0ff;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .radio {
    font-size: 12px;
  }

  .up {
    color: #f14545;
  }

  .down {
    color: #2ae8bd;
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
  cursor: pointer;
  
  img {
    width: 14px;
    height: 14px;
  }
}
.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
