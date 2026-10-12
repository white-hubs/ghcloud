<template>
  <div class="panel">
    <SubPanelTemplate title="份额交易概览">
      <template #extra>
        <DateInlineForm v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="environment-box">
        <div class="environment-item" v-for="item in transactionList">
          <div class="environment-item-title">{{ item.label }}</div>
          <div class="environment-item-box">
            <div class="environment-item-value">{{ item.value || 0}}</div>
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
    <SubPanelTemplate title="份额交易趋势图">
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
    <SubPanelTemplate title="账户实时状态统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
      </template>
      <div class="environment-box">
        <div class="environment-item" v-for="item in intercomList">
          <div class="environment-item-title">{{ item.label }}</div>
          <div class="environment-item-box">
            <div class="environment-item-value">{{ item.value || 0}}个</div>
          </div>
        </div>
      </div>
      <div class="pie-chart">
        <pieGuidance :showLegend="false" :y-data="accountStatusData" height="80%"></pieGuidance>
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
import { ModelValueItf } from '../public/types'
import { accountStatusStat, transactionCopiesStat, transactionCopiesStatTime, transactionCopiesTypeStat } from '@/api/onecard'

const yData = ref([
  {
    name:'退款',
    value:10,
    color:'#0099FF'
  },
  {
    name:'消费',
    value:20,
    color:'#FF9900'
  },
  {
    name:'充值',
    value:30,
    color:'#63a35c'
  },
])
const accountStatusData = ref([])
const transactionList = ref([
  {
    label:'交易份数',
    value:'100',
    ratio:10
  },
  {
    label:'交易笔数',
    value:'100',
    ratio:10
  },
  {
    label:'单笔平均份数',
    value:'100',
    ratio:10
  },
])
const intercomList = ref([
  {
    label:'账户总数',
    value:'0',
  },
  {
    label:'正常状态',
    value:'0',
  },
  {
    label:'过期状态',
    value:'0',
  },
])
const intercomTime = ref<ModelValueItf>()
const handleTime = ref<ModelValueItf>();
const transactionTime = ref<ModelValueItf>();
const xData = ref<string[]>(['1','2','3','4','5','6']);
const yDataTrend = ref<number[]>([2,3,4,5,6,7,8]);
const changeTransactionTime = async () => {
let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
 const res = await transactionCopiesStat({type:transactionTime.value.timeType,period:transactionTime.value.dateRange.join(",")})
  transactionList.value[0].value = res.amount
  transactionList.value[0].ratio = res.qoqAmount
  transactionList.value[1].value = res.num
  transactionList.value[1].ratio = res.qoqNum
  transactionList.value[2].value = res.avgAmount
  transactionList.value[2].ratio = res.qoqAvgAmount
  const data = await  transactionCopiesTypeStat({type:transactionTime.value.timeType,period:transactionTime.value.dateRange.join(",")})
  yData.value = data.map((item,index)=>{
  return {
    name:item.name,
    value:item.value,
    itemStyle:{color:colorList[index]}
  }
 })
}
const changeHandleTime = async () => {
  const res = await transactionCopiesStatTime({type:handleTime.value.timeType,period:handleTime.value.dateRange.join(",")})
  xData.value = res.map((item)=>{
    return handleTime.value.timeType==='TODAY'?item.code+'时':item.code
  })
  yDataTrend.value = res.map((item)=>{
    return item.value
  })
}
const getIntercomEvent = async () => {
  const res = await accountStatusStat({type:intercomTime.value.timeType,period:intercomTime.value.dateRange.join(",")})
  intercomList.value[0].value = res.total
  intercomList.value[1].value = res.normal
  intercomList.value[2].value = res.expired
  accountStatusData.value = [
    {
      name:'正常',
      value:res.normal,
      color:'#19F8F7'
    },{
      name:'过期',
      value:res.expired,
      color:'#FFC700'
    }
  ]
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