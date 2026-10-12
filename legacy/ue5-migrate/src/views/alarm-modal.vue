<template>
  <div v-if="visible" class="alarmDetail-wrap">
    <div class="alarm_box">
      <div class="modal" :class="getclass(alarmArr[currentAlarmIndex].alarmLevelCode)">
        <div class="alarmDetail-modal-header">
          <div class="header-title">
            <span>{{ alarmArr[currentAlarmIndex].alarmTypeName }}</span>
            <a-tag :color="getclass(alarmArr[currentAlarmIndex].alarmLevelCode)" style="margin-left: 10px">
              {{ alarmArr[currentAlarmIndex].alarmLevelName }}
            </a-tag>
          </div>
          <div class="header-close" @click="handleClose(false)">
            <CloseOutlined />
          </div>
        </div>
        <div class="alarm_name" :style="`background-image: url(${getImg(
          alarmArr[currentAlarmIndex].alarmLevelCode
        )}`">
          <div>
            {{ alarmArr[currentAlarmIndex].alarmEventName }}
          </div>
          <div class="alarm_time">
            {{ alarmArr[currentAlarmIndex].alarmTime }}
          </div>
        </div>
        <a-tooltip placement="topLeft" :title="getSJ(alarmArr[currentAlarmIndex])" arrow-point-at-center>
          <div class="alarm_describe">
            【{{ alarmArr[currentAlarmIndex].alarmTargetName }}】 在【{{
            alarmArr[currentAlarmIndex].areaName
            }}】发生 【{{ alarmArr[currentAlarmIndex].alarmEventName }}】报警事件
          </div>
        </a-tooltip>
        <div class="alarm-content">
          <a-tabs v-model:activeKey="activeKey" v-if="alarmArr[currentAlarmIndex].videoArr.length > 0">
            <a-tab-pane v-for="v in alarmArr[currentAlarmIndex].videoArr" :key="v.deviceId" :tab="v.deviceName">
              <div class="alarm-video-container">
                <H5Video :camera-item="v" :id-str="'alarm_modal_' + v.token"></H5Video>
              </div>
            </a-tab-pane>
          </a-tabs>
          <div
            v-else-if="['ELECTRICMANAGE','FIRECONTROL','ROTATINGMANAGE'].includes(alarmArr[currentAlarmIndex].alarmTypeCode)">
            <div class="alarm-chart-container">
              <AlarmChartComponent :alarmInfo="alarmArr[currentAlarmIndex]"
                :id="alarmArr[currentAlarmIndex].businessKey"></AlarmChartComponent>
            </div>
          </div>
          <div v-else style="justify-content: center;display: flex;">
            <img :src="alarmModalPng" />
          </div>
        </div>
        <div class="modal-footer">
          <a-space :size="16">
            <span>{{ currentAlarmIndex + 1 }}/{{ alarmArr.length }}</span>
            <a-button :disabled="currentAlarmIndex === 0" size="small" @click="handlePre">上一条</a-button>
            <a-button :disabled="currentAlarmIndex === alarmArr.length - 1" size="small"
              @click="handleNext">下一条</a-button>
            <a-button size="small" type="primary" @click="handleClose(true)">查看</a-button>
            <a-button size="small" type="primary" @click="handleClose(false)">关闭</a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { CloseOutlined } from "@ant-design/icons-vue";
import { EventVideo } from "@/api/models/linkage";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import { getAssetsImage } from "@/utils/getImage";
const alarmModalPng = '/resource/v1/ue5-migrate/views/alarm-empty.png'
import AlarmChartComponent from "@/components/alarm-chart-components/index.vue";

interface AlarmData {
  alarmLevelCode: string;
  alarmLevelName: string;
  alarmTypeName: string;
  alarmTargetCode: string;
  alarmTargetName: string;
  alarmTargetTypeName: string;
  alarmTime: string;
  area: string;
  areaName: string;
  alarmEventName: string;
  alarmStatus: string;
  alarmStatusNameg: string;
  videoArr: EventVideo[];
  alarmTypeCode: string;
  businessKey:string;
}
interface Props {
  visible: boolean;
  alarmArr: AlarmData[];
}
const emit = defineEmits(["closeAlarmModal"]);
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  alarmArr: () => [],
});
const currentAlarmIndex = ref<number>(0);
const activeKey = ref<string | null>(props.alarmArr[0]?.videoArr[0]?.deviceId ?? null);
const getclass = computed(() => (level) => {
  let levelClass = "blue";
  switch (level) {
    case "one_level":
      levelClass = "red";
      break;
    case "two_level":
      levelClass = "yellow";
      break;
    case "three_level":
      levelClass = "orange";
      break;
    case "four_level":
      levelClass = "blue";
      break;
    default:
      levelClass = "blue";
      break;
  }
  return levelClass;
});
const getImg = computed(() => (level) => {
  let url = getAssetsImage("lan.png");
  switch (level) {
    case "one_level":
      url = getAssetsImage("hong.png");
      break;
    case "two_level":
      url = getAssetsImage("cheng.png");
      break;
    case "three_level":
      url = getAssetsImage("huang.png");
      break;
    case "four_level":
      url = getAssetsImage("lan.png");
      break;
    default:
      url = getAssetsImage("lan.png");
      break;
  }
  return url;
});
const getSJ = (data) => {
  return ` 【${data.alarmTargetName} 在【
          ${data.areaName}
        】发生 【
          ${data.alarmEventName}
        】报警事件`;
};
const handlePre = () => {
  if (currentAlarmIndex.value > 0) {
    currentAlarmIndex.value--;
    if (props.alarmArr[0].videoArr.length) {
      activeKey.value = props.alarmArr[currentAlarmIndex.value].videoArr[0].deviceId;
    }
  }
};
const handleNext = () => {
  if (currentAlarmIndex.value < props.alarmArr.length - 1) {
    currentAlarmIndex.value++;
    if (props.alarmArr[0].videoArr.length) {
      activeKey.value = props.alarmArr[currentAlarmIndex.value].videoArr[0].deviceId;
    }
  }
};
const handleClose = (isCheck=false) => {
  emit("closeAlarmModal",isCheck);
};
watch(
  () => [...props.alarmArr],
  (newVal) => {
    if (props.alarmArr.length && props.alarmArr[0].videoArr.length) {
      activeKey.value = props.alarmArr[0].videoArr[0].deviceId;
    }
  }
);
</script>
<style lang="less" scoped>
.alarmDetail-wrap {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;

  .alarm_box {
    width: 500px;
    height: 548px;
    background: rgba(25, 35, 56, 0.7);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;

    .modal {
      padding: 0 10px;
      height: 100%;
    }
  }

  .red {
    background: linear-gradient(180deg,
        rgba(255, 59, 52, 0.3) 0%,
        rgba(8, 13, 23, 0) 100%);

    border-image: linear-gradient(180deg,
        rgba(255, 59.00000028312206, 52.000000700354576, 1),
        rgba(255, 59.00000028312206, 52.000000700354576, 0)) 1 1;
  }

  .yellow {
    background: linear-gradient(180deg,
        rgba(255, 110, 52, 0.3) 9%,
        rgba(8, 13, 23, 0) 100%);
    border-image: linear-gradient(180deg,
        rgba(255, 110.00000104308128, 52.000000700354576, 1),
        rgba(255, 110.00000104308128, 52.000000700354576, 0)) 1 1;
  }

  .orange {
    border-image: linear-gradient(180deg,
        rgba(255, 194.00000363588333, 52.000000700354576, 1),
        rgba(255, 194.00000363588333, 52.000000700354576, 0)) 1 1;
    background: linear-gradient(180deg,
        rgba(255, 194, 52, 0.3) 0%,
        rgba(8, 13, 23, 0) 100%);
  }

  .blue {
    background: linear-gradient(180deg,
        rgba(24, 144, 255, 0.3) 0%,
        rgba(8, 13, 23, 0) 100%);
    border-image: linear-gradient(180deg,
        rgba(24.000000469386578, 144.00000661611557, 255, 1),
        rgba(255, 59.00000028312206, 52.000000700354576, 0)) 1 1;
  }

  .alarmDetail-modal-header {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    align-items: center;
    height: 40px;
    line-height: 40px;
    // padding: 0 16px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .header-title {
      color: #fff;
    }

    .header-close {
      width: 24px;
      height: 24px;

      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 12px;
      }
    }
  }

  .alarm_name {
    margin-top: 10px;
    color: #fff;
    text-align: center;
    font-size: 18px;

    .alarm_time {
      font-size: 12px;
    }
  }

  .alarm_describe {
    height: 57px;
    background: rgba(0, 0, 0, 0.3);
    line-height: 57px;
    padding: 0 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
    background: rgba(0, 0, 0, 0.3);
  }

  .alarm-content {
    height: calc(100% - 210px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  :deep(.ant-tabs) {
    color: #fff;
  }

  .modal-footer {
    color: #fff;
    margin: 12px;
    text-align: center;
  }
}
</style>
