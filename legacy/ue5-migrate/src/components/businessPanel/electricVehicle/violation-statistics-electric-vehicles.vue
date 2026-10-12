<template>
  <SubPanelTemplate title="电瓶车违规占比">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTimeType" @search="changeDate"></DateInlineForm>
    </template>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData">
          <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
          <div style="color: #fff;text-align: center;font-size: 14px;">违规总数(个)</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { inspectElectronMobileChargeStat, inspectElectronMobileParkingStat } from '@/api/maintain'

const pieData = ref([
    {
        name: '违规充电',
        value: 0,
        color: '#29C2FF',
        ratio: '0%'
    },
    {
        name: '违规停放',
        value: 0,
        color: '#FFAB10',
        ratio: '0%'
    },
])
const alarmTotal = ref(0)
const alarmTimeType = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const changeDate = async () => {
  const park = await inspectElectronMobileParkingStat({period:alarmTimeType.value.dateRange.join(",")})
  const charge = await inspectElectronMobileChargeStat({period:alarmTimeType.value.dateRange.join(",")})
  alarmTotal.value = park.total + charge.total
  pieData.value[1].value = alarmTotal.value?park.total / alarmTotal.value * 100:0
  pieData.value[0].value = alarmTotal.value?charge.total / alarmTotal.value * 100:0
}
</script>
<style lang="less" scoped>
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    width:300px;
    height: 220px;
}

</style>