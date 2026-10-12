<template>
  <div>
    <SubPanelTemplate title="视频监控" class="monitor">
      <div class="body">
        <div class="group">
          <video class="camera" muted controls autoplay loop src="https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/8f47c5301397757900067377319/v.f100830.mp4"></video>
          <video class="camera" muted controls autoplay loop src="https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/076881ff1397757899908022992/v.f100830.mp4"></video>
          <video class="camera" muted controls autoplay loop src="https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/5d2febd41397757900056698391/v.f100830.mp4"></video>
          <video class="camera" muted controls autoplay loop src="https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/9c172c5b1397757899982090126/v.f100830.mp4"></video>
        </div>

      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件top5" class="alarm-event">
      <div class="body" style="min-height: 250px">
        <EventAlarmItem v-for="(item, index) in alarmRank.list" :sort="index + 1" :name="item.name"
          :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡逻异常数统计">
      <div class="body" style="min-height: 200px; position: relative"
        :style="{ top: tableList.length <= 0 ? '-40px' : '0px' }">
        <RollTable :column="column" :data="tableList">
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import tableData from "./rollTable";
import { AlarmAreaTop } from "@/api/models/alarm";
import { storeMenu } from "@/piniaStore/menu";
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
const alarmRank = reactive({
  list: [
    {
      name:'演示报警',
      alarmNum:20,
      linkRatio:10,
      ratio:40,
    },
    {
      name:'安防报警',
      alarmNum:18,
      linkRatio:10,
      ratio:38,
    },
    {
      name:'防盗报警',
      alarmNum:8,
      linkRatio:10,
      ratio:30,
    },
    {
      name:'外来报警',
      alarmNum:5,
      linkRatio:10,
      ratio:30,
    },

    {
      name:'消防报警',
      alarmNum:2,
      linkRatio:10,
      ratio:12,
    },
  ],
});
let tableList = reactive([
  {
    time:'2025-01-01 12:00:00',
    patrol:'1号楼',
    reportPerson:'刘洋',
  },
  {
    time:'2025-01-02 12:00:00',
    patrol:'2号楼',
    reportPerson:'王强',
  },
  {
    time:'2025-01-03 12:00:00',
    patrol:'1号楼',
    reportPerson:'杨帆',
  },
  {
    time:'2025-01-03 12:00:00',
    patrol:'3号楼',
    reportPerson:'周杰',
  },
  {
    time:'2025-01-05 12:00:00',
    patrol:'5号楼',
    reportPerson:'李晓明',
  },
  {
    time:'2025-01-06 12:00:00',
    patrol:'5号楼',
    reportPerson:'刘志强',
  },
  {
    time:'2025-01-06 12:00:00',
    patrol:'2号楼',
    reportPerson:'赵海波',
  },
]);

// 报警事件
async function changeEventTime() {

}
// 巡逻异常
async function changeUnusualTime() {
 
}
// 获取视频列表
async function getVideo() {
 
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
