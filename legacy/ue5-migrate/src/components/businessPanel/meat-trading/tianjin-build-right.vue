<template>
  <div >
    <SubPanelTemplate title="交易信息">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="transaction-info-box">
        <div class="transaction-info" v-for="item in transactionInfoData" :key="item.name" @click="showIot(item)">
          <div class="transaction-info-title">
            <img :src="getAssetsImage('overView49.png')" alt="">
            <span>{{ item.name }}</span>
          </div>
          <div class="transaction-info-data">
            <count-to :startVal="0" :endVal="Number(item.value)" :duration="2000" separator=""></count-to><span class="unit">{{
              item.unit }}</span>
          </div>
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', Number(item.chainRatio || 0) > 0 && 'uptriangle']"></div>
            <div :class="[Number(item.chainRatio || 0) > 0 ? 'up' : 'down']">{{ Number(item.chainRatio || 0).toFixed(2) + "%" }}</div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="供货信息">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="supplyMaterial" @search="changeSupplyMaterialTime"></DateInlineForm>
      </template>
      <div class="supply-material-box">
        <div class="supply-material-left">
          <div class="centerBox">
            <div class="supply-material-name">
              供货商户数
            </div>
            <div class="supply-material-name">
              <count-to :startVal="0" :endVal="Number(supplyInformationData.supplier || 0)" :duration="2000"
                separator=""></count-to><span class="unit">户</span>
            </div>
            <div class="ringRatio">
              <span>环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', Number(supplyInformationData.qoqSupplier || 0) > 0 && 'uptriangle']"></div>
              <div :class="[ Number(supplyInformationData.qoqSupplier || 0) > 0 ? 'up' : 'down']">{{ Number(supplyInformationData.qoqSupplier || 0).toFixed(2) + "%" }}</div>
            </div>
          </div>
        </div>
        <div class="flex-content">
          <div class="supply-material-right">
            <div class="supply-material-info">
              <div class="supply-material-data">
                <span>供货重量</span>
                <div class="ringRatio">
                  <span>环比</span>
                  <!-- uptriangle 向上三角根据Prop改变 -->
                  <div :class="['downtriangle', Number(supplyInformationData.qoqSupplyWeight || 0) > 0 && 'uptriangle']"></div>
                  <div :class="[ Number(supplyInformationData.qoqSupplyWeight || 0) > 0 ? 'up' : 'down']">{{
                    Number(supplyInformationData.qoqSupplyWeight || 0).toFixed(2) + "%" }}</div>
                </div>
              </div>
              <div class="supply-material-value">
                <count-to :startVal="0" :endVal="Number(supplyInformationData.supplyWeight || 0)"
                  separator=""></count-to><span class="unit">kg</span>
              </div>
            </div>
          </div>
          <div class="supply-material-right">
            <div class="supply-material-info">
              <div class="supply-material-data">
                <span>供货片数</span>
                <div class="ringRatio">
                  <span>环比</span>
                  <!-- uptriangle 向上三角根据Prop改变 -->
                  <div :class="['downtriangle', supplyInformationData.qoqSupplySlices > 0 && 'uptriangle']"></div>
                  <div :class="[ Number(supplyInformationData.qoqSupplySlices || 0) > 0 ? 'up' : 'down']">{{
                    Number(supplyInformationData.qoqSupplySlices || 0).toFixed(2) + "%" }}</div>
                </div>
              </div>
              <div class="supply-material-value">
                <count-to :startVal="0" :endVal="Number(supplyInformationData.supplySlices || 0)" :duration="2000"
                  separator=""></count-to><span class="unit">片</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="食安信息">
      <template #extra>
        <DateInlineForm :timeList="timeList"  v-model:modelValue="foodSafetyTime" @search="changeFoodSafetyTimeTime"></DateInlineForm>
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
  </div>
  <modalIouTable 
    @close="close" 
    :time="transactionTime.timeType" 
    :type-name="transactionTitle" 
    :unit="transactionUnit" 
    :show-modal="transactionDetails">
  </modalIouTable>
  <modalUnqualifiedTable
    @close="closeUnqualifiedTable" 
    :time-type="foodSafetyTime.timeType"
    :item-data="unqualifiedDataItem"
    :show-modal="showUnqualifiedTable">
  </modalUnqualifiedTable>
</template>
 
<script setup lang="ts">
import { ref, reactive} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import OperateDays from "../public/operateDays.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import barChart from "../public/charts/bar/barChart.vue";
import { ModelValueItf } from "../public/types";
import { setTimeType } from "@/utils/common";
import modalIouTable from "./components/modal-iou-table.vue";
import modalUnqualifiedTable from "./components/modal-unqualified-table.vue";
import { porkBimStatSummary, porkBimStatSupplyData , meatTradeRank} from "@/api/slide-tianjin";
import { MeatTradeRankVO } from '@/api/models/slide';
const transactionTime = ref<ModelValueItf>({
        timeType: 'THIS_WEEK',
        dateRange: []
    }
);
const supplyMaterial = ref<ModelValueItf>(
  {
        timeType: 'THIS_WEEK',
        dateRange: []
    }
);
const foodSafetyTime = ref<ModelValueItf>(
  {
        timeType: 'THIS_WEEK',
        dateRange: []
    }
);
const Operatevalue = ref<number>();
const transactionTitle = ref('')
const transactionUnit = ref('')
const transactionInfoData = ref([])
const transactionDetails = ref(false)
const supplyInformationData = reactive({
    "supplier": 0,
    "qoqSupplier": 0,
    "supplyWeight": 0,
    "qoqSupplyWeight": 0,
    "supplySlices": 0,
    "qoqSupplySlices": 0
})
const foodSafety = reactive<any>({
  yData:[
    {
      color:'#D9E7FF',
      data:[],
      name:'不合格数量',
      showBackground:true,
      backgroundStyle: {color: '#6C8097'},
      labelFalge:true
    }
  ],
  xData:[]
})
const timeList = [
			{ label: "今日", value: "TODAY" },
			{ label: "近7天", value: "THIS_WEEK" },
			{ label: "近30天", value: "THIS_MONTH" },
			{ label: "近1年", value: "THIS_YEAR" }
		]
const changeSupplyMaterialTime = ()=>{
  supplyInformationEvent()
}
const changeFoodSafetyTimeTime = ()=>{
  foodSafetyInformationEvent()
}
const changeTransactionTime = ()=>{
  transactionEvent()
}
const close = ()=>{
  transactionDetails.value = false
}
const showIot = (item)=>{
  transactionTitle.value = item.name
  transactionUnit.value = item.unit
  transactionDetails.value = true
}
// 交易信息 
const transactionEvent = async()=>{
  let res =await porkBimStatSummary({type:setTimeType(transactionTime.value.timeType)})
  transactionInfoData.value = [
  {
    name:'交易金额',
    value:res.tradeAmount,
    chainRatio:res.qoqTradeAmount,
    unit:'元'
  }, {
    name:'交易佣金',
    value:res.tradeCommission,
    chainRatio:res.qoqTradeCommission,
    unit:'元'
  }, {
    name:'交易均价',
    value:res.tradeAverageAmount,
    chainRatio:res.qoqTradeAverageAmount,
    unit:'元'
  },{
    name:'实际均价',
    value:res.actualAverageAmount,
    chainRatio:res.qoqActualAverageAmount,
    unit:'元/kg'
  },{
    name:'交易重量',
    value:res.tradeWeight,
    chainRatio:res.qoqTradeWeight,
    unit:'kg'
  },{
    name:'交易片数',
    value:res.tradeSlices,
    chainRatio:res.qoqTradeSlices,
    unit:'片'
  },
  ]
}
// 供货信息
const supplyInformationEvent = async()=>{
 let res = await porkBimStatSupplyData({type:setTimeType(supplyMaterial.value.timeType)})
  Object.assign(supplyInformationData,res)
  supplyInformationData.qoqSupplier = Number(supplyInformationData.qoqSupplier)
}

const foodSafetyInformationEvent = async()=>{
 const data = await meatTradeRank({
    type: setTimeType( foodSafetyTime.value.timeType),
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

</script>
<style scoped lang="less">
.transaction-info-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  cursor: pointer;
  font-size: 16px;

  .transaction-info {
    margin: 10px;
    color: #fff;

    .transaction-info-title {
      font-size: 12px;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .transaction-info-data {
      font-size: 22px;

      .unit {
        font-size: 12px;
      }
    }
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  min-width: 120px; // 增加最小宽度，确保有足够空间
  width: auto; // 改为自适应宽度
  color: #fff;
  font-size: 14px;
  gap: 4px; // 添加元素间距

  .ratio-label {
    white-space: nowrap; // 防止"环比"文字换行
    flex-shrink: 0; // 防止被压缩
  }

  .ratio-value {
    white-space: nowrap; // 防止百分比数值换行
    flex-shrink: 0; // 防止被压缩
    min-width: 0; // 允许内容溢出时正常显示
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    transform: rotate(180deg);
    flex-shrink: 0; // 防止三角形被压缩
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  // 添加颜色样式
  .up {
    color: #ffcece;
  }

  .down {
    color: #d2fff3;
  }
}

.supply-material-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;

  .supply-material-left {
    position: relative;
    width: 132px;
    height: 118px;
    background: linear-gradient(90deg, rgba(41, 137, 255, 0.2) 0%, rgba(41, 137, 255, 0.2) 100%);

    .centerBox {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .supply-material-name {
      font-size: 14px;
      color: #fff;
    }
  }

  .supply-material-info {
    text-align: center;
    width: 170px;

    .supply-material-data {
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 12px;
    }

    .supply-material-value {
      width: 170px;
      height: 28px;
      background: rgba(255, 255, 255, 0.1);
      line-height: 28px;
      text-align: center;
      color: #fff;
      font-size: 16px;

      .unit {
        font-size: 12px;
      }
    }
  }
}

.flex-content {
  width: 150px;
  height: 118px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart {
  margin-top: 20px;
  height: 200px;
}
</style>