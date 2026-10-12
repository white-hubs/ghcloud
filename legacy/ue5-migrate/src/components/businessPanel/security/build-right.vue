<template>
  <div >
    <SubPanelTemplates title="视频监控" class="monitor">
      <template #bar>
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
    </SubPanelTemplates>
    <SubPanelTemplate title="报警记录" class="alarm-record">
      <template #extra>
        <a @click="handelClickAlarmNum">查看更多</a>
      </template>
      <div class="header">
        <DateInlineForm v-model:modelValue="takeNotes" @search="changeTakeNotes"></DateInlineForm>
      </div>
      <div class="chart">
        <Pie :data="alarmsNumber" :x-data="pieData" />
        <TipsCount v-for="(item, index) in pieData" :status="String(index)" :count="item.value||0" />
      </div>
      <div class="footer">
        <RollTable :showLength="10" :key="falg" :column="column" :data="listData" @click-row="handelClickRow">
          <template #alarmStatus="{ record }">
            <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
            <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
            <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>
<script lang="ts" setup>
import SubPanelTemplates from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import H5Video from "../public/H5Video.vue";
import bus from "@/utils/bus";
import Pie from "@/components/businessPanel/public/pie.vue";
import TipsCount from "../public/tipsCount.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import RollTable from "../public/rollTable/index.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import useCommon from "../../hooks/useCommon";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { VideoType } from "@/api/models/vmonitor";
import { getAssetsImage } from "@/utils/getImage";
import { storeMenu } from "@/piniaStore/menu";
import { getstatus } from '@/api/alarm'
import { useStateStore } from "@/pages/state/use-state-store";
let cameraList = ref<VideoType[]>([]);
const cameraListTotal = ref([]);
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
let pieData = reactive([]);
let listData = reactive([]);
let alarmsNumber = ref<number>(0);
const num = ref(0);
let timer: any = reactive(null);
let falg = ref<number>(0);
const alarmModalShow = ref<boolean>(false);
const alarmParameter = reactive<Record<string, any>>({
  dateRange: [],
});
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const { takeNotes, getAlarmTakeNotes, videoList } = useCommon();
const { globalState } = useStateStore()

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
// 报警记录
async function changeTakeNotes() {
  alarmParameter.dateRange = takeNotes.value.dateRange;
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    alarmStatusEnum:'',
    pageSize: 100,
    pageNumber: 1,
  };
  let data = await getAlarmTakeNotes(param);
  let res= await getstatus(param)
  listData = data.listData;
  alarmsNumber.value = data.alarmsNumber;
  pieData = data.pieData;
  pieData = [
    {
        "value": res.alarmStatusStatistics[0].alarmNum,
        itemStyle:{
          color:'#F14545',
        },
        "name": "未处理数"
    },
    {
        "value": res.alarmStatusStatistics[3].alarmNum,
        itemStyle:{
          color:'#00f27b',
        },
        "name": "超时报警数"
    }
]
  falg.value++;
}
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
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const handelClickAlarmNum = () => {
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
function init() {
  changeTakeNotes();
  getVideo();
}
onMounted(() => {
  getVideo();
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
      width: 168px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-record {
  a {
    color: #74b2ff;
    font-size: 14px;
  }

  .chart {
    display: flex;
    height: 100px;
    justify-content: center;

    >div {
      width: 100px;
      align-items: center;
      margin-left: 10px;
    }
  }

  .footer>div {
    width: 100%;
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

.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
