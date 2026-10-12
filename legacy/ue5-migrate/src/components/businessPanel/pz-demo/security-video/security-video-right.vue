<template>
  <div>
    <SubPanelTemplates title="视频监控" class="monitor">
      <template #bar>
        <div class="right-bar" @click="changeVideo" :class="[cameraListTotal.length - 1 === 0 ? 'forbidden' : '']">
          <div>切换</div>
          <img :src="getAssetsImage('changingOver.png')" alt="" />
        </div>
      </template>
      <div class="body">
        <div class="group" v-show="cameraList.length > 0">
          <div class="camera" v-for="(item, index) in cameraList" :key="item.id+index" @click="clickCamera(item)">
            <video class="video" :src="item.url" controls autoplay muted loop></video>
          </div>
        </div>
        <div class="group" v-show="cameraList.length <= 0">
          <noData></noData>
        </div>
      </div>
    </SubPanelTemplates>
    <SubPanelTemplate title="监控设备统计" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTimeTypeS" @search="changeDates"></DateInlineForm>
      </template>
      <DeviceStatistics imgPath="business-icon/triage-queue/7.png" :statistic="deviceStatisticsData"></DeviceStatistics>
      <PatrolContent :patrol="patrolData"></PatrolContent>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡逻异常数统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="unusualTime" @search="changeUnusualTime"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 200px; position: relative"
        :style="{ top: tableList.length <= 0 ? '-40px' : '0px' }">
        <RollTable :key="falg" :column="column" :data="tableList" @click-row="handelClickRow">
          <template #photos="{ record }">
            <a-image-preview-group>
              <a-image v-for="item in record.photos.url" :width="30" :height="30" :src="item"></a-image>
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
import SubPanelTemplates from "../../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import PatrolContent from "../../electronicPatrol-new/components/patrol-content.vue";
import RollTable from "../../public/rollTable/index.vue";
import bus from "@/utils/bus";
import { AlarmAreaTop } from "@/api/models/alarm";
import usrCommon from "../../../hooks/useCommon";
import { getAssetsImage } from "@/utils/getImage";
import { useStateStore } from "@/pages/state/use-state-store";
interface AlarmHandlType {
  list: AlarmAreaTop[];
}
const patrolData = ref([
  {
    title:'包含巡更路线',
    value:20
  },
  {
    title:'涉及巡更点',
    value:21
  },
  {
    title:'巡更覆盖率',
    value:22
  },
])
const alarmTimeTypeS = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const deviceStatisticsData = reactive({
  title: "巡更任务",
  total: 0,
  itemize: [
    {
      name: "待接收",
      label: "执行中",
      value: 0,
      offline: 0,
      key: "OFFLINE",
    },
    {
      name: "已结束",
      label: "异常结束",
      value: 0,
      offline: 0,
      key: "OFFLINE",
    },
  ],
});
interface cameraObj {
  name: string;
  token: string;
  session?: string;
  serverIp: string;
  code?: string;
}
const num = ref(0);
let timer: any = reactive(null);

let cameraList = ref<any[]>([
  {
        "id": 1,
        "name": "视频1",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/8f47c5301397757900067377319/v.f100830.mp4"
  },
  {
        "id": 2,
        "name": "视频2",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/076881ff1397757899908022992/v.f100830.mp4"
  },
  {
        "id": 3,
        "name": "视频3",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/5d2febd41397757900056698391/v.f100830.mp4"
  },
  {
        "id": 4,
        "name": "视频4",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/9c172c5b1397757899982090126/v.f100830.mp4"
  },
]);
const cameraListTotal = ref([]);
const alarmRank = reactive<AlarmHandlType>({
  list: [],
});
let falg = ref<number>(0);
let tableList = reactive([]);
const {
  getEventTop,
  unusualTime,
  getremakerList,
} = usrCommon();
const { globalState } = useStateStore()

// 报警事件
async function changeEventTime() {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: [],
    type: '',
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
  // let params = {
  //   areaId: globalState.business.currentAreaId,
  // }
  // let data = await videoListDevices(params)
  // cameraList.value = data.filter(e=>{
  //   if (e.thirdPartyId.includes('TFXGNVR') ) {
  //     return e
  //   }
  // }).splice(0,4)
}
const changeDates=()=>{

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
  () => globalState.business.currentAreaId,
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
const column  = [
        {
            title:"上报时间",
            dataIndex:"time",
            width:120
        },
        {
            title:"巡逻点",
            dataIndex:"patrol",
        },
        {
            title:"上报人",
            dataIndex:"reportPerson",
            width:60
        },
    ];
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
      width: 130px;
      height: 90px;
      margin-top: 10px;
      .video{
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
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
