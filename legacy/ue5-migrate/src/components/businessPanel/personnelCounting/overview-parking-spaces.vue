<template>
  <SubPanelTemplate title="车位总览">
    <OperateDays :value="parkingLotTotal.total" title="车位总数" :unit="'个'"> </OperateDays>
    <div class="parkingLot">
      <circlePie :percent="circlePieData.percent" :selectedColor="circlePieData.selectedColor" :blgColor="circlePieData.blgColor">
        <div class="backgroundBox">
          <img :src="getAssetsImage('vehicle.png')" />
        </div>
      </circlePie>
      <deviceModule :data-list="dataList"></deviceModule>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { getAssetsImage } from "../../../utils/getImage";
import { GetParkingOverview } from "@/api/models/park-management";
import circlePie from "@/components/businessPanel/public/charts/circlePie/circlePie.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { parkingData } from "@/utils/requestData/parkingSpaceManage";

let dataList = ref([]);
let parkingLotTotal = reactive<GetParkingOverview>({
  empty: 0,
  total: 0,
  used: 0,
});
const circlePieData = reactive({
  percent: 0,
  selectedColor: "#2989FF",
  blgColor: "#19F8F7",
});
// 获取车位信息
const parkingLotInfo = async () => {
  let res = await parkingData();
  parkingLotTotal = res.parkingLotTotal;
  circlePieData.percent = res.circlePieData;
  dataList.value = res.dataList;
};
onMounted(() => {
  parkingLotInfo();
});
</script>
<style lang="less" scoped>
.parkingLot {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow:
    inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
    inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 36px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
