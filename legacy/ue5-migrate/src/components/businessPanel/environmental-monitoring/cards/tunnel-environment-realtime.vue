<template>
  <SubPanelTemplate title="隧道环境指标实时监测">
    <div class="environment-box">
      <div class="environment-item" v-for="item in environmentIndex">
        <div class="environment-item-title">{{ item.label }}</div>
        <div class="environment-item-list">
          <div class="environment-item-data" v-for="data in item.data">
            <div class="environment-item-data-label">{{ data.name }}</div>
            <div class="environment-item-box">
              <div class="environment-item-value">{{ data.value ? data.value + data.unit : "" }}</div>
              <div class="environment-item-sustain">{{ data.sustain ? `持续${data.sustain}min` : "" }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { environmentalIndicators } from "@/api/securitymanagement";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const environmentIndex = ref([
  {
    label: "CO浓度",
    data: [
      {
        name: "实时平均",
        value: "",
        unit: "ppm",
      },
      {
        name: "今日最高",
        value: "",
        unit: "ppm",
        sustain: "",
      },
    ],
  },
  {
    label: "能见度",
    data: [
      {
        name: "实时平均",
        value: "",
        unit: "ppm",
      },
      {
        name: "今日最低",
        value: "",
        unit: "ppm",
        sustain: "",
      },
    ],
  },
  {
    label: "亮度",
    data: [
      {
        name: "实时平均",
        value: "150",
        unit: "lux",
      },
      {
        name: "今日最低",
        value: "100",
        unit: "lux",
        sustain: "",
      },
    ],
  },
  {
    label: "风速",
    data: [
      {
        name: "实时平均",
        value: "",
        unit: "m/s",
      },
      {
        name: "今日最高",
        value: "",
        unit: "m/s",
        sustain: "",
      },
    ],
  },
]);

const getEnvironmentalIndicators = async () => {
  const res = await environmentalIndicators();
  environmentIndex.value[0].data[0].value = res.co;
  environmentIndex.value[0].data[1].value = res.coMax;
  environmentIndex.value[0].data[1].sustain = res.coTime;

  environmentIndex.value[1].data[0].value = res.visibility;
  environmentIndex.value[1].data[1].value = res.visibilityMin;
  environmentIndex.value[1].data[1].sustain = res.visibilityTime;

  environmentIndex.value[2].data[0].value = res.brightness;
  environmentIndex.value[2].data[1].value = res.brightnessMin;
  environmentIndex.value[2].data[1].sustain = res.brightnessTime;

  environmentIndex.value[3].data[0].value = res.windSpeed;
  environmentIndex.value[3].data[1].value = res.windSpeedMax;
  environmentIndex.value[3].data[1].sustain = res.windSpeedTime;
};

onMounted(() => {
  getEnvironmentalIndicators();
});
</script>

<style lang="less" scoped>
.environment-box {
  color: #fff;

  .environment-item {
    .environment-item-title {
      font-size: 14px;
    }

    .environment-item-list {
      display: flex;
      justify-content: space-between;
    }

    .environment-item-data {
      width: 150px;
      height: 50px;
      background: rgba(142, 172, 206, 0.1);
      margin-bottom: 8px;
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .environment-item-data-label {
        font-size: 14px;
      }

      .environment-item-box {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        align-items: center;

        .environment-item-value {
          font-weight: bold;
        }
      }
    }
  }
}
</style>
