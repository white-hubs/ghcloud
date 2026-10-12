<template>
  <SubPanelTemplate title="今日气体使用概览" class="visiting-data">
    <div class="item" v-for="item in yData" :key="item.label">
      <RoundDataPic :img="item.img" />
      <a-statistic :title="item.label">
        <template #formatter>
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
          <span class="unit">m³</span>
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
            <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio.toFixed(2) + "%" }}</div>
          </div>
        </template>
      </a-statistic>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, onMounted } from "vue";

import { todayGasUsage } from "@/api/device";
import RoundDataPic from "@/components/businessPanel/medical-gas/components/round-data-pic.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { getAssetsImage } from "@/utils/getImage";

const { globalState } = useStateStore();
const imgList = ["gas0.png", "gas1.png", "gas2.png", "gas3.png", "gas4.png", "gas5.png"];
const yData = ref<{ label: string; value: number; ratio: number; img: string }[]>([]);

const getGasUsage = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
  };
  const res = await todayGasUsage(params);
  yData.value = res.map((item: any, index: number) => {
    return {
      label: item.name,
      value: item.num,
      ratio: item.ratio,
      img: getAssetsImage(imgList[index] ? imgList[index] : imgList[0]),
    };
  });
};

onMounted(() => {
  getGasUsage();
});
</script>

<style lang="less" scoped>
.visiting-data {
  height: 400px;
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 15px 0;
    .item {
      width: 50%;
      height: 60px;
      margin-top: 30px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 20px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #d0deee;
          font-size: 12px;
          margin: 0;
        }
      }
    }
  }
}
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}
.unit {
  display: inline-block;
  font-size: 12px;
  margin-left: 2px;
}
.downtriangle {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #d2fff3;
  margin: 0 3px;
  transform: rotate(180deg);
}

.uptriangle {
  border-bottom: 8px solid #ffcece;
  transform: rotate(0deg);
}

.down {
  color: #2ae8bd;
  font-family: Roboto-Regular, Roboto;
}

.up {
  color: #f14545;
  font-family: Roboto-Regular, Roboto;
}
</style>
