<template>
  <div class="panel">
    <SubPanelTemplate title="食安信息">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="spotCheckTime" @search="changespotCheckTime"></DateInlineForm>
      </template>
      <OperateDays :value="Operatevalue" title="来货报备批次数" @click="clickregister"></OperateDays>
      <div class="chart">
        <barChart :colorLsit="['#98ACCD', '#D9E7FF']" :data="foodSafety.yData" :xData="foodSafety.xData"></barChart>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="批次作弊嫌疑率">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="suspicionTime" @search="changesuspicionTime"></DateInlineForm>
      </template>
      <div class="chart">
        <pie :data="piedata"></pie>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备数据">

      <div class="device-data-list">
        <div class="device-data-box" :class="index % 2 == 0 ? 'bgColor' : ''" v-for="(item, index) in deviceData"
          :key="item.name">
          <div class="device-left">{{item.type}}</div>
          <div class="device-centre">
            <span>总数:{{item.num}}</span>
            <span>
              <img :src="getAssetsImage('overView51.png')" alt="" />
              {{ item.onLineNum}}
            </span>
            <span>
              <img :src="getAssetsImage('overView50.png')" alt="" />
              {{item.offLineNum}}
            </span>
          </div>
          <!-- <div class="device-right">详情</div> -->
        </div>
      </div>
    </SubPanelTemplate>
  </div>
  <quarantinetable :show-modal="register" title="检疫票" :total="Operatevalue" :seven="pratiqueFailednum"
    :type="spotCheckTime"></quarantinetable>
  <!-- <iouTable :show-modal="true" title="白条商户交易重量"></iouTable> -->
  <!-- <areaModal :show-modal="true" title="东区"></areaModal> -->
  <!-- <upsModal :show-modal="true" title="ups"></upsModal> -->
  <!-- <upsModal :show-modal="true" title="ups"></upsModal> -->
  <!-- <deviceInfoModal :show-modal="true" title="温湿设备"></deviceInfoModal> -->
  <!-- <uspTransactionModel :show-modal="true"></uspTransactionModel> -->
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { spotCheck,suspicion } from "@/api/slide";
import OperateDays from "../public/operateDays.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import barChart from "../public/charts/bar/barChart.vue";
import { getAssetsImage } from "@/utils/getImage";
import { equipmentTotal } from '@/api/equipment'
import { ModelValueItf } from "../public/types";
import pie from "./components/pie.vue";
import uspTransactionModel from "./components/uspTransactionModel.vue";
import quarantinetable from "./components/quarantine-table.vue";
import iouTable from "./components/iou-table.vue";
import areaModal from "./components/area-modal.vue";
import upsModal from "./components/ups-modal.vue";
import deviceInfoModal from "./components/device-info-modal.vue";
import { storeArea } from "@/piniaStore/area"
import { storeMenu } from "@/piniaStore/menu"
import { setTimeType } from "@/utils/common";
import {classification} from '@/api/device'
const transactionTime = ref<ModelValueItf>();
const spotCheckTime = ref<ModelValueItf>();
const suspicionTime = ref<ModelValueItf>();
const Operatevalue = ref<number>();
  const timeList = [
			{ label: "今日", value: "TODAY" },
			{ label: "近7天", value: "THIS_WEEK" },
			{ label: "近30天", value: "THIS_MONTH" },
			{ label: "近1年", value: "THIS_YEAR" }
		]
  const piniaStoreArea = storeArea();
    const piniaStoreMenu = storeMenu();
const foodSafety = reactive<any>({
  yData: [
    {
      color: "#D9E7FF",
      data: [
        
      ],
      name: "不合格数量",
      showBackground: true,
      backgroundStyle: { color: "#6C8097" },
      labelFalge: true,
    },
  ],
  xData: [],
});
const deviceData = ref<any>();
const register=ref(false)
const clickregister=()=>{
  register.value=true
}
const changesuspicionTime = () => {
  getsuspicion()
};
const changespotCheckTime = () => {
  getspotCheck()
};
const piedata=ref([])
const getsuspicion=async ()=>{
 const data=await suspicion({type:setTimeType(suspicionTime.value.timeType)})
 piedata.value=[
        {
            name: '',
            type: 'pie',
            radius: [60, 80],
            center: ['50%', '50%'],
            data: [
              {
                    value: data.suspicionNum,
                    name: `有嫌疑（${data.suspicion}%）`,
                    pop:data.qoqSuspicion,
                    itemStyle: {
                        color: '#FFAB10'
                    }
                },
                {
                    value: data.noDoubtNum,
                    name: `无嫌疑（${data.noDoubt}%）`,
                    pop:data.qoqNoDoubt,
                    itemStyle: {
                        color: '#58FAB6'
                    }
                },
            ]
        },
   
    ]


}
const pratiqueFailednum=ref()
const getspotCheck =async () => {
 const data=await spotCheck({
    type:setTimeType( spotCheckTime.value.timeType),
  });
  Operatevalue.value=data.supplyReports
  pratiqueFailednum.value=data.pratiqueFailed
  Object.assign(foodSafety.yData[0].data,[{
  value:data.pratiqueFailed,
  pop:data.qoqPratiqueFailed
  },{
  value:data.clenbuterolFailed,
  pop:data.qoqClenbuterolFailed
  },
  {
  value:data.watered,
  pop:data.qoqWatered
  }])
  foodSafety.xData=["检疫票", "瘦肉精", "含水量"]
};
const getdevice=async()=>{

  let params = {
            sceneType: piniaStoreMenu.currentMenu,
            areaId: piniaStoreArea.currentAreaId
        }
let data=await  classification(params)
deviceData.value=data
}
onMounted(() => {
  getdevice()
});
</script>
<style scoped lang="less">
.chart {
  height: 220px;
}

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
