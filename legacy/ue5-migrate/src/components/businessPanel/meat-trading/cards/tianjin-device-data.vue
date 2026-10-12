<template>
  <SubPanelTemplate title="设备数据">
    <div class="device-data-list">
      <div class="device-data-box" :class="index % 2 == 0 ? 'bgColor' : ''" v-for="(item, index) in deviceData" :key="item.name">
        <div class="device-left">{{ item.type }}</div>
        <div class="device-centre">
          <span>总数:{{ item.num }}</span>
          <span>
            <img :src="getAssetsImage('overView51.png')" alt="" />
            {{ item.onLineNum }}
          </span>
          <span>
            <img :src="getAssetsImage('overView50.png')" alt="" />
            {{ item.offLineNum }}
          </span>
        </div>
        <!-- <div class="device-right">详情</div> -->
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { classification } from "@/api/device";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { getAssetsImage } from "@/utils/getImage";

const { globalState } = useStateStore();
const deviceData = ref<any>();

const getDeviceData = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  };
  let data = await classification(params);
  deviceData.value = data;
};

onMounted(() => {
  getDeviceData();
});
</script>

<style scoped lang="less">
.device-data-list {
  height: 250px;
  overflow-y: scroll;

  .device-data-box {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    color: #fff;
    font-size: 12px;

    .device-left {
      width: 80px;
      text-align: left;
      border-right: 1px solid #fff;
    }

    .device-centre {
      padding: 0 40px 0 20px;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      img {
        width: 15px;
        height: 15px;
        margin-right: 4px;
      }
    }

    .device-right {
      width: 50px;
      color: #58fab6;
      cursor: pointer;
    }
  }
}

.bgColor {
  background: rgba(171, 177, 189, 0.12);
}
</style>
