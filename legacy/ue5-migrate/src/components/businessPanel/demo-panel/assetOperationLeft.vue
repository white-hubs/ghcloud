<template>
  <div >
    <whiteStripeTrading @getTime="transactionEvent" :title="transactionTop.title" :table-head="transactionTop.tableHead"
      :areaAlarmRank="transactionTop.areaAlarmRank" />
    <whiteStripeTrading @getTime="exitEvent" :title="exitTop.title" :table-head="exitTop.tableHead"
      :areaAlarmRank="exitTop.areaAlarmRank" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount} from 'vue'
import whiteStripeTrading from "@/components/businessPanel/meat-trading/components/white-stripe-trading.vue";
import { supplTradeRank ,porkBimStatAbattoir} from "@/api/slide";

const transactionData = ref('TODAY')
const exitData = ref('TODAY')
let timer: any = ref(null);

const transactionTop = reactive({
  title:'入驻商户（Top5）',
  tableHead:['商户名称&编号','入驻面积(㎡)'],
  areaAlarmRank:[]
})
const exitTop = reactive({
  title:'合同统计(Top5)',
  tableHead:['屠宰场名称&片数','来货重量(kg)'],
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
//  白条交易大户（TOP5）
const supplTradeTop = async()=>{
  let res = await supplTradeRank({type:transactionData.value,pageSize:5})
  transactionTop.areaAlarmRank = res.records.map(item=>{
    return {
      alarmNum: item.tradeWeight,
      chainRatio: item.qoqTradeWeight,
      name: item.supplyName,
      ratio: item.tradeWeight,//占比不准确
      code:item.supplierCode
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
      code:item.supplySlices
    }
  })
}
const init = ()=>{
  supplTradeTop()
  porkBimTop()
}
onMounted(()=>{
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
})
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style scoped lang="less"></style>
