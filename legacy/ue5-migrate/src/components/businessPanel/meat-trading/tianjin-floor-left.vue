<template>
  <div >
    <SubPanelTemplate title="食安信息">
      <template #extra>
        <DateInlineForm :timeList="timeList"  v-model:modelValue="spotCheckTime" @search="changespotCheckTime"></DateInlineForm>
      </template>
      <OperateDays :value="Operatevalue" title="来货报备批次总数"></OperateDays>
      <div class="chart">
        <barChart 
          :colorLsit="['#98ACCD','#D9E7FF']" 
          :data="foodSafety.yData" 
          :xData="foodSafety.xData"
          @barClick="handleBarClick"
        ></barChart>
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
  <modalUnqualifiedTable
    @close="closeUnqualifiedTable" 
    :time-type="spotCheckTime.timeType"
    :item-data="unqualifiedDataItem"
    :show-modal="showUnqualifiedTable">
  </modalUnqualifiedTable>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { meatTradeRank } from "@/api/slide-tianjin";
import { suspicion } from "@/api/slide";
import OperateDays from "../public/operateDays.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import barChart from "../public/charts/bar/barChart.vue";
import { getAssetsImage } from "@/utils/getImage";
import { ModelValueItf } from "../public/types";
import pie from "./components/pie.vue";
import quarantinetable from "./components/quarantine-table.vue";
import { setTimeType } from "@/utils/common";
import {classification} from '@/api/device'
import { useStateStore } from "@/pages/state/use-state-store";
import modalUnqualifiedTable from "./components/modal-unqualified-table.vue";
import { MeatTradeRankVO } from "@/api/models/slide";
const spotCheckTime = ref<ModelValueItf>({
        timeType: 'THIS_WEEK',
        dateRange: []
    });
const suspicionTime = ref<ModelValueItf>({
        timeType: 'THIS_WEEK',
        dateRange: []
    });
const Operatevalue = ref<number>();
const timeList = [
    { label: "今日", value: "TODAY" },
    { label: "近7天", value: "THIS_WEEK" },
    { label: "近30天", value: "THIS_MONTH" },
    { label: "近1年", value: "THIS_YEAR" }
  ]
const { globalState } = useStateStore()
const foodSafety = reactive<any>({
  yData: [
    {
      color: "#D9E7FF",
      data: [],
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
 const data = await meatTradeRank({
    type: setTimeType( spotCheckTime.value.timeType),
  });
  if(data.length){
    Operatevalue.value= data[0].totalSum || 0
  }
  const yData = [];
  const xData = [];
  data.forEach((item)=>{
    yData.push({
      metadata: item,
      value: item.notPassSum,
      pop: item.notPassSumRate
    })
    xData.push(item.meatTestingItemName)
  })
  Object.assign(foodSafety.yData[0].data, yData)
  foodSafety.xData= xData
};
const getDeviceData=async()=>{
  let params = {
            sceneType: globalState.business.currentMenu,
            areaId: globalState.business.currentAreaId
        }
  let data = await classification(params)
  deviceData.value=data
}

const showUnqualifiedTable = ref(false);
const unqualifiedDataItem = ref<MeatTradeRankVO>(
  {
    id: '',
    timeRange: '',
    startDate: '',
    endDate: '',
    meatTestingItem: '',
    meatTestingItemCode: '',
    meatTestingItemName: '',
    totalCheckNumSum: 0,
    totalSum: 0,
    notPassSum: 0,
    prevTotalCheckNumSum: 0,
    prevTotalSum: 0,
    prevNotPassSum: 0,
    checkNumSumRate: 0,
    totalSumRate: 0,
    notPassSumRate: 0,
  }
);

// 定义点击事件处理函数的类型
interface BarClickEvent {
  name: string;
  value: number;
  dataIndex: number;
  metadata: MeatTradeRankVO;
}

// 添加点击事件处理函数
const handleBarClick = (event: BarClickEvent): void => {
  unqualifiedDataItem.value = event.metadata;
  showUnqualifiedTable.value = true;
};
const closeUnqualifiedTable = ()=>{
  showUnqualifiedTable.value = false
}

onMounted(() => {
  getDeviceData()
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
