<template>
  <div class="panel">
    <SubPanelTemplate title="金额交易情况概览">
      <template #extra>
        <DateInlineForm v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="environment-box">
        <div class="environment-item" v-for="item in transactionList">
          <div class="environment-item-title">{{ item.label }}</div>
          <div class="environment-item-box">
            <div class="environment-item-value">{{ item.value ||0 }}</div>
            <div class="extra flex-start">
              <div class="mode">环比</div>
              <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
              <div :class="[item.ratio < 0 ? 'down' : 'up']">{{ item.ratio }}%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="pie-chart">
        <pieGuidance :showLegend="false" :y-data="yData" height="80%"></pieGuidance>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="金额交易趋势图">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :unit="{x:'',y:'元'}" :gridTop="'20'" :x-data="xData" :series="[
            {
              data: yDataTrend,
              linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="账户消费Top10">
      <template #extra>
        <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
      </template>
      <div class="body" v-show="intercomRank.length" style="min-height: 250px">
        <EventAlarmItem :sn="false" v-for="(item, index) in intercomRank" :sort="index + 1" :name="item.name"
         :count="item.value"/>
      </div>
      <div class="body" v-show="!intercomRank.length" style="min-height: 250px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "../public/noData.vue";
import { ModelValueItf } from '../public/types'
import { transactionAmountStat, transactionTrendStat, transactionTypeStat, transactionUserStat } from '@/api/onecard'

const yData = ref([])
const transactionList = ref([
  {
    label:'交易金额',
    value:'0',
    ratio:0
  },
  {
    label:'交易笔数',
    value:'0',
    ratio:0
  },
  {
    label:'单笔平均金额',
    value:'0',
    ratio:0
  },
])
const intercomTime = ref<ModelValueItf>()
const transactionTime = ref<ModelValueItf>()
const handleTime = ref<ModelValueItf>();
const xData = ref<string[]>([]);
const yDataTrend = ref<number[]>([]);
const intercomRank = ref([]);
const changeTransactionTime = async () => {
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
 const res = await transactionAmountStat({type:transactionTime.value.timeType,period:transactionTime.value.dateRange.join(",")})
 const data = await transactionTypeStat({type:transactionTime.value.timeType,period:transactionTime.value.dateRange.join(",")})
 transactionList.value[0].value = res.amount
 transactionList.value[0].ratio = res.qoqAmount
 transactionList.value[1].value = res.num
 transactionList.value[1].ratio = res.qoqNum
 transactionList.value[2].value = res.avgAmount
 transactionList.value[2].ratio = res.qoqAvgAmount
 yData.value = data.map((item,index)=>{
  return {
    name:item.name,
    value:item.value,
    itemStyle:{color:colorList[index]}
  }
 })
}
const changeHandleTime = async () => {
 const res = await transactionTrendStat({type:handleTime.value.timeType,period:handleTime.value.dateRange.join(",")})
  xData.value = res.map((item)=>{
    return handleTime.value.timeType==='TODAY'?item.code+'时':item.code
  })
  yDataTrend.value = res.map((item)=>{
    return item.value
  })
}
const getIntercomEvent = async () => {
  intercomRank.value = await transactionUserStat({type:intercomTime.value.timeType,period:intercomTime.value.dateRange.join(",")})
}
</script>
<style lang="less" scoped>
.pie-chart {
  height: 250px;
}

.chart {
  height: 200px;
}

.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 4px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}

.environment-box {
  display: flex;
  justify-content: space-between;

  .environment-item {
    background: rgba(142, 172, 206, 0.1);
    padding: 4px;

    .environment-item-title {
      font-size: 16px;
      color: #fff;
    }

    .environment-item-box {
      display: flex;

      .environment-item-value {
        color: #fff;
        font-size: 14px;
      }
    }
  }
}</style>