<template>
  <div >
    <whiteStripeTrading @getTime="transactionEvent" @showMore="showMoreTransaction" :title="transactionTop.title" :table-head="transactionTop.tableHead"
      :areaAlarmRank="transactionTop.areaAlarmRank" />
    <whiteStripeTrading @getTime="exitEvent" @showMore="showMoreExit" :title="exitTop.title" :table-head="exitTop.tableHead"
      :areaAlarmRank="exitTop.areaAlarmRank" />
  </div>
  <modalTransactionTable :showModal="showTransactionModal" :type="transactionData" @close="closeTransactionModal" />
  <modalSupplyTable :showModal="showExitModal" :type="exitData" @close="closeExitModal" />
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount} from 'vue'
import whiteStripeTrading from "./components/white-stripe-trading.vue";
import modalTransactionTable from "./components/modal-transaction-table.vue";
import modalSupplyTable from "./components/modal-supply-table.vue";
import { supplTradeRank ,porkBimStatAbattoir} from "@/api/slide-tianjin";
import { supplierDetails } from "@/api/mdata";

const transactionData = ref('TODAY')
const exitData = ref('TODAY')
let timer: any = ref(null);

const showTransactionModal = ref(false);
const showExitModal = ref(false);


const transactionTop = reactive({
  title:'白条交易大户（Top5）',
  tableHead:['商家名称','手机号','来货重量(kg)'],
  areaAlarmRank:[]
})
const exitTop = reactive({
  title:'屠宰场供货TOP',
  tableHead:['屠宰场名称','片数','来货重量(kg)'],
  areaAlarmRank:[]
})
const transactionEvent = (value)=>{
 transactionData.value = value
 supplTradeTop()
}
const exitEvent = async(value)=>{
  exitData.value = value
  porkBimTop()
}

const showMoreTransaction = (item: any) => {
  showTransactionModal.value = true;
}

const showMoreExit = (item: any) => {
  showExitModal.value = true;
}

const closeTransactionModal = ()=>{
  showTransactionModal.value = false;
}
const closeExitModal = ()=>{
  showExitModal.value = false;
}

//  白条交易大户（TOP5）
const supplTradeTop = async()=>{
  let res = await supplTradeRank({type:transactionData.value,pageSize:5})
 const wholesalerData = res.records.map(item=>{
    return supplierDetails(item.supplierId)
  })
  let wholesalerList = []
  try {
     await Promise.all(wholesalerData).then(res=>{
      wholesalerList = res
    })
  } catch (error) {
    
  }
 
  transactionTop.areaAlarmRank = res.records.map(item=>{
    return {
      alarmNum: item.tradeWeight,
      chainRatio: item.qoqTradeWeight,
      name: item.supplyName,
      ratio: item.tradeWeight,//占比不准确
      code:item.supplierCode,
      phone: wholesalerList.find(wholesaler=>wholesaler.id === item.supplierId)?.phone
    }
  })
}
//  白条来货数据（TOP5）
const porkBimTop = async()=>{
  let res = await porkBimStatAbattoir({type:exitData.value,pageSize:5})
  exitTop.areaAlarmRank= res.records.map(item=>{
    return {
      alarmNum: item.supplyWeight,
      chainRatio: item.qoq,
      name: item.abattoirName,
      ratio: item.qoq,//占比不准确
      code:item.supplySlices,
      phone: item.supplySlices,
    }
  })
}
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style scoped lang="less"></style>
