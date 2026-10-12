<template>
  <div >
    <SubPanelTemplate title="交易信息">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="transaction-info-box" @click="showIot">
        <div class="transaction-info" v-for="item in transactionInfoData" :key="item.name">
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
            <div :class="['downtriangle', item.chainRatio > 0 && 'uptriangle']"></div>
            <div :class="[item.chainRatio > 0 ? 'up' : 'down']">{{ item.chainRatio + "%" }}</div>
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
              <count-to :startVal="0" :endVal="Number(supplyInformationData.supplier)" :duration="2000"
                separator=""></count-to><span class="unit">户</span>
            </div>
            <div class="ringRatio">
              <span>环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', supplyInformationData.qoqSupplier> 0 && 'uptriangle']"></div>
              <div :class="[ supplyInformationData.qoqSupplier > 0 ? 'up' : 'down']">{{ supplyInformationData.qoqSupplier
                + "%" }}</div>
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
                  <div :class="['downtriangle', supplyInformationData.qoqSupplyWeight > 0 && 'uptriangle']"></div>
                  <div :class="[ supplyInformationData.qoqSupplyWeight > 0 ? 'up' : 'down']">{{
                    supplyInformationData.qoqSupplyWeight + "%" }}</div>
                </div>
              </div>
              <div class="supply-material-value">
                <count-to :startVal="0" :endVal="Number(supplyInformationData.supplyWeight)"
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
                  <div :class="[ supplyInformationData.qoqSupplySlices > 0 ? 'up' : 'down']">{{
                    supplyInformationData.qoqSupplySlices + "%" }}</div>
                </div>
              </div>
              <div class="supply-material-value">
                <count-to :startVal="0" :endVal="supplyInformationData.supplySlices" :duration="2000"
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
      <OperateDays :value="Operatevalue" title="来货报备批次数"></OperateDays>
      <div class="chart">
        <barChart :colorLsit="['#98ACCD','#D9E7FF']" :data="foodSafety.yData" :xData="foodSafety.xData"></barChart>
      </div>
    </SubPanelTemplate>
  </div>
  <!-- <tallyingModal :device-id="'0'" :show-modal="true"></tallyingModal> -->
  <iouTable @close="close" :time="transactionTime.timeType" :show-modal="transactionDetails"></iouTable>
</template>
 
<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import OperateDays from "../public/operateDays.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import barChart from "../public/charts/bar/barChart.vue";
import { ModelValueItf } from "../public/types";
import { setTimeType } from "@/utils/common";
import iouTable from "./components/iou-table.vue";
import { porkBimStatSummary, porkBimStatSupplyData , spotCheck} from "@/api/slide";
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
  xData:['检疫票','瘦肉精','含水量']
})
const timeList = [
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
const showIot = ()=>{
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
 const data=await spotCheck({
    type:setTimeType( foodSafetyTime.value.timeType),
  });
  Operatevalue.value=data.supplyReports
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
  // justify-content: space-between;
  width: 100px;
  color: #fff;
  font-size: 16px;

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
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
    width: 160px;

    .supply-material-data {
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 12px;
    }

    .supply-material-value {
      width: 160px;
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