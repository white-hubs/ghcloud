<template>
  <SubPanelTemplate :title="props.title">
    
    <div class="monitorPanelBox">
      <monitorPanel v-for="item in monitorPanelData" :key="item.name" :monitorPanelData="item" @click="handelClickAssets(item)" />
    </div>
    <div class="elevator-analysis">
      <elevator-analysis-pie style="width: 50%; height: 1.00583rem" :radius="'75'" :pieData="pieData" @clickbar="handelClickAssets">
        <div style="color: #fff; text-align: center; font-size:calc(var(--font-size-scale) * 0.072rem)">
          {{ monitorPanelData[0].value }}
        </div>
        <div style="color: #fff; text-align: center; font-size:calc(var(--font-size-scale) * 0.072rem)">{{titleName}}总数</div>
      </elevator-analysis-pie> 
      <elevatorAnalysisList :contentList="pieData" @handlecurrent="assetClickAssets" style="width: 50%;overflow-x: hidden;"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <modal-asset-table :show-modal="assetModalShow" @close="closeModal" :parameter="assetParameter"></modal-asset-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import monitorPanel from "../components/monitor-panel.vue";
import modalAssetTable from "../components/modal-asset-table.vue";
import { sourceArchiveStatistics } from '@/api/property'
const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '风险源分析'
})
const titleName = ref("风险源");
// 平湖特殊需求，不叫风险源交可巡检
const obj = {
  13587423:'可巡检项'
}
const currentEnvironment = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code
titleName.value = obj[currentEnvironment] || "风险源";
const assetModalShow = ref<boolean>(false);
// 风险源分析
const monitorPanelData = ref([
  {
    imgPath: "overView5.png",
    value: 0,
    name: `${titleName.value}总数`,
    type:'all',
    typeId:''
  },
  {
    imgPath: "overView87.png",
    value: 0,
    name: `已到期${titleName.value}`,
    type:'risk',
    typeId:''
  },
]);
// 风险源分析
async function changeHandleRiskTime() {
  const res = await sourceArchiveStatistics()
  monitorPanelData.value[0].value=res.totalNum
  monitorPanelData.value[1].value=res.expirationNum
  pieData.value=res.typeVOList.map((e,i)=>{
    return {...e, color:colors[i],value:e.totalNum,name:e.typeName.split("/").length>1?e.typeName.split("/")[1]:e.typeName }
  })
}
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const pieData = ref([]);
const assetParameter = ref<Record<string, any>>({
  status: "",
  typeCode:''
});
const handelClickAssets = (item?: any) => {
  if(item.data&&item.data.originData){
    item = item.data.originData
  }
  assetParameter.value={}
  if(item.type==="all"){
    assetParameter.value = {}
  }
  if(item.type==="risk"){
    assetParameter.value = {status:'EXPIRE'}
  }
  assetModalShow.value=true
};
const assetClickAssets = (item)=>{
  assetParameter.value = {typeCode:item.typeCode}
  assetModalShow.value=true
}
const closeModal = () => {
  assetModalShow.value = false;
};
const init = () => {
  changeHandleRiskTime()
};

onMounted(() => {
  init()
});
</script>
<style scoped lang="less">
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .alarm-analysis{
    height: auto;
  }
}

.chart {
  height: 150px;
}

:deep(.LightingBox) {
  &.round-wrap .monitorBox {
    flex-direction: column;
    width: 90px;
  }

  .monitor .monitorBox .monitorValue {
    font-size: 16px;
    font-family: D-DIN, D-DIN;
    font-weight: 700;
  }

  .monitor .monitorBox .monitorList .monitorColor {
    display: none !important;
  }

  .monitor {
    width: 180px !important;
    justify-content: space-between;
    margin-top: 15px;
  }

  .info {
    position: relative;
    justify-content: space-around;
    flex-direction: row;

    &::after {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      width: 200px;
      top: 92px;
      left: 121px;
    }

    &::before {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      top: 80px;
      left: 90px;
      width: 35px;
      transform: rotateZ(40deg);
    }
  }

  .roate {
    width: 67px !important;
    height: 67px !important;
  }

  .r1 {
    width: 90px !important;
    height: 90px !important;
  }

  .r2 {
    width: 80px !important;
    height: 80px !important;
  }

  .r3 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 100%;
  }

  .item {
    height: 110px !important;
  }

  .icon {
    width: 30px !important;
    height: 30px !important;
  }
}
</style>
