<template>
  <div class="device-detection flex-start">
    <div class="scan">
      <div class="radar"></div>
      <div class="button" @click="resetFault">重新检测</div>
    </div>
    <div class="fault-info">
      <div class="fault-list">
        <div class="list-header">
          共检测<span class="total">{{ deviceFaultResut.testItemNumber }}</span
          >项，有<span class="fault">{{ deviceFaultResut.problemItemNumber }}</span
          >项有问题！
        </div>
        <div class="list-item" v-for="item in deviceFaultResut.problems">
          <WarningOutlined />
          <span>{{ item }}</span>
        </div>
      </div>
      <div class="fault-time">
        <span>检测时间：{{ deviceFaultResut.createTime }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { healthProblemsLatest } from "@/api/equipment";
import { onMounted, ref } from "vue";
import { WarningOutlined } from "@ant-design/icons-vue";
interface Props {
  deviceId: string;
}
interface FaultResult {
  createTime: string;
  healthValue: number;
  problemItemNumber: number;
  problems: string[];
  testItemNumber: number;
}
const props = withDefaults(defineProps<Props>(), {
  deviceId: "",
});
const deviceFaultResut = ref<FaultResult>({
  createTime: "",
  healthValue: 0,
  problemItemNumber: 0,
  problems: [],
  testItemNumber: 0,
});
onMounted(() => {
  deviceHealthFault();
});
const deviceHealthFault = async () => {
  const res = await healthProblemsLatest(props.deviceId);
  deviceFaultResut.value = res;
};
const resetFault = () => {
  deviceFaultResut.value = {
    createTime: "",
    healthValue: 0,
    problemItemNumber: 0,
    problems: [],
    testItemNumber: 0,
  };
  deviceHealthFault();
};
</script>

<style lang="less">
.device-detection {
  height: 100%;
  align-items: flex-start;
}
.scan {
  width: 120px;
  .button {
    cursor: pointer;
    margin: 10px auto;
    width: 76px;
    height: 26px;
    line-height: 26px;
    text-align: center;
    background: linear-gradient(
      180deg,
      rgba(0, 85, 254, 0) 0%,
      rgba(0, 85, 254, 0.47) 77%,
      #0055fe 100%
    );
    opacity: 1;
    border: 1px solid rgba(176, 203, 255, 1);
    color: #ffffff;
    font-size: 12px;
    border-radius: 10px;
  }
}
.radar {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  border: 1px solid #2989ff;
  overflow: hidden;
  position: relative;
  background: -webkit-radial-gradient(
      center,
      rgba(41, 137, 255, 0.3) 0%,
      rgba(41, 137, 255, 0) 75%
    ),
    -webkit-repeating-radial-gradient(rgba(41, 137, 255, 0) 5.8%, rgba(41, 137, 255, 0)
          18%, #2989ff 18.6%, rgba(41, 137, 255, 0) 18.9%),
    -webkit-linear-gradient(90deg, rgba(41, 137, 255, 0) 49.5%, #2989ff 50%, rgba(
            41,
            137,
            255,
            0
          )
          50.2%),
    -webkit-linear-gradient(0deg, rgba(41, 137, 255, 0) 49.5%, #2989ff 50%, rgba(
            41,
            137,
            255,
            0
          )
          50.2%);
  &::after {
    content: " ";
    display: block;
    background-image: linear-gradient(44deg, rgba(41, 137, 255, 0.3) 44%, #2989ff 100%);
    width: 50%;
    height: 50%;
    position: absolute;
    top: 0;
    left: 0;
    animation: radar-beam 5s infinite;
    /* 速度相同 */
    animation-timing-function: linear;
    transform-origin: bottom right;
    border-radius: 100% 0 0 0;
  }
}
@keyframes radar-beam {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
.fault-info {
  flex: 1;
  .list-header {
    height: 24px;
    line-height: 24px;
    padding: 0 6px;
    font-size: 14px;
    color: #ffffff;
    background: linear-gradient(
      180deg,
      rgba(161, 196, 235, 0.89) 0%,
      rgba(145, 182, 223, 0) 100%
    );
    .total {
      color: #09ebfa;
    }
    .fault {
      color: #ff2500;
    }
  }
  .list-item {
    padding-bottom: 8px;
    font-size: 12px;
    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    span {
      margin-left: 10px;
    }
  }
  .fault-time {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 10px;
  }
}
</style>
