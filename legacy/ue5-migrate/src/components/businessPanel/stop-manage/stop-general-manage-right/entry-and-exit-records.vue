<template>
  <div></div>
  <SubPanelTemplate title="今日出入统计">
    <OperateDays :value="parkingLotTotal" title="出入车流总数" :unit="'辆'">
      </OperateDays>
      <div class="parkingLot">
        <circlePie :percent="circlePieData.percent" :selectedColor="circlePieData.selectedColor"
          :blgColor="circlePieData.blgColor">
          <div class="backgroundBox">
            <img :src="getAssetsImage('vehicle.png')" />
          </div>
        </circlePie>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
  </SubPanelTemplate> 
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import { getAssetsImage } from "../../../../utils/getImage";
import circlePie from "@/components/businessPanel/public/charts/circlePie/circlePie.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { getCarNum } from '@/api/park-management'

const circlePieData = reactive({
  percent: 8,
  selectedColor: "#2989FF",
  blgColor: "#19F8F7",
});

let parkingLotTotal = ref(0);

let dataList = ref([]);


onMounted(async() => {
 const res = await getCarNum()
  parkingLotTotal.value = res.inNum+res.outNum
  dataList.value = [
    {
      title:'今日入场',
      value:res.inNum
    },
    {
      title:'今日出场',
      value:res.outNum
    },
  ]
})
</script>
<style lang="less" scoped>
.chart {
  height: 220px;
}
.deviceList{
  flex-direction: column;
}
.parkingLot {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
  .backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
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
}
</style>