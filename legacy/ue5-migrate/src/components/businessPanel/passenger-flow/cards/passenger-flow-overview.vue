<template>
  <SubPanelTemplate title="客流总览">
    <div class="passenger-flow">
      <div class="passenger-flow-box" v-for="(item, index) in passenger" :key="item.title">
        <div class="passenger-flow-title">{{ item.title }}</div>
        <div class="passenger-flow-value">
          <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
          <div class="ringRatio" v-show="index !== 0">
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', (item.ratio as number) > 0 && 'uptriangle']"></div>
            <div :class="[(item.ratio as number) > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { passengerFlowStatistics } from "@/api/passenger-flow";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();

//实时人数===========================================================================
const passenger = ref([
  {
    title: "实时人数",
    value: 0,
  },
  {
    title: "进馆",
    value: 0,
    ratio: 0,
  },
  {
    title: "出馆",
    value: 0,
    ratio: 0,
  },
]);

const getPassengerFlowStatistics = async () => {
  const date = [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",");
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: date,
  };
  const res = await passengerFlowStatistics(params);
  passenger.value[0].value = res.inMuseum;
  passenger.value[1].value = res.inCount;
  passenger.value[2].value = res.outCount;
};

onMounted(() => {
  getPassengerFlowStatistics();
});
</script>

<style lang="less" scoped>
.passenger-flow {
  .passenger-flow-box {
    color: #fff;
    background-color: rgba(0, 0, 0, 0.15);
    padding: 10px;
    margin: 5px;
  }

  .passenger-flow-box:nth-of-type(1) {
    display: flex;
    justify-content: flex-start;
    font-size: 20px;
    .passenger-flow-title {
      width: 50%;
      font-size: 16px;
    }
  }

  .passenger-flow-box:nth-of-type(2),
  .passenger-flow-box:nth-of-type(3) {
    .passenger-flow-title {
      font-size: 12px;
    }

    .passenger-flow-value {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
    }

    .ringRatio {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;

      span {
        font-size: 12px;
        color: #d0deee;
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
    }
    display: inline-block;
    width: calc(50% - 10px);
  }
}
</style>
