<template>
  <div >
    <SubPanelTemplate title="商户/档位统计">
      <div class="gear-position flex-center">
        <div class="gear-position-box" v-for="item in merchant" :key="item.name">
          <div class="gear-position-name">{{ item.name }}</div>
          <div class="gear-position-value">
            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="商户清单">
      <merchantList></merchantList>
    </SubPanelTemplate>
    <SubPanelTemplate title="区域档位数">
      <div class="equipmentAlarm">
        <planPie :pie-data="roundPieData.arr">
          <div class="content">
            <div class="pie-center">{{ roundPieData.throughNum }}</div>
            <div>档位总数</div>
          </div>
        </planPie>
        <pieList :roundPieData="roundPieData.arr"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="问卷调查统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="statisticsTime" @search="changeStatisticsTime"></DateInlineForm>
      </template>
      <div class="chart">
        <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5">
        </overviewChartBar>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onUnmounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import merchantList from "@/components/businessPanel/merchant-manage/components/merchant-list.vue"
import DateInlineForm from "../public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import planPie from "../public/charts/pie/planePie.vue";
import pieList from "../public/pieList.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue"
import { splitArray } from "@/utils/common";
import { visualizationCount ,visualizationRanking ,visualizationRroportion,visualizationQuestionnaire, areasAllGraph} from '@/api/merchant'
import moment from 'moment'

const secureTime = ref<ModelValueItf>();
const proportionTime = ref<ModelValueItf>();
const statisticsTime = ref<ModelValueItf>();
const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const totalData = reactive({
  secureRankTotal:[],
  statisticsTotal:[],
})
const numTotal = reactive({
  secure:1,
  statistics:0
})
const time = reactive({
  secure:null,
  statistics:null
})
const merchant = ref([
{
    name:'商户总数（个）',
    value:0
  }, {
    name:'档位总数（个）',
    value:0
  },
])
const secureRank = ref([
{
    name:'商户1',
    value:10,
    percentage:34,
  },  {
    name:'商户2',
    value:10,
    percentage:34,
  },  {
    name:'商户3',
    value:10,
    percentage:34,
  },  {
    name:'商户4',
    value:10,
    percentage:34,
  }, {
    name:'商户5',
    value:10,
    percentage:34,
  },
])
const roundPieData = reactive({
  arr:[],
  throughNum:0
})
const barData = reactive({
    xData: [],
    yData: [
        {
            data: [],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
// 安全生产值排名
const changeSecureTime = async()=>{
  let beforePeriod = []
const dateFormat = "YYYY-MM-DD HH:mm:ss";
   if (secureTime.value.timeType === 'TODAY') {
    beforePeriod = [
    moment(secureTime.value.dateRange[0]).subtract(1, 'day').format(dateFormat),
    moment(secureTime.value.dateRange[1]).subtract(1, 'day').format(dateFormat),
    ]
   }else if (secureTime.value.timeType === 'THIS_WEEK') {
    beforePeriod = [
    moment(secureTime.value.dateRange[0]).subtract(1, 'week').format(dateFormat),
    moment(secureTime.value.dateRange[1]).subtract(1, 'week').format(dateFormat),
    ]
  }else if (secureTime.value.timeType === 'THIS_MONTH') {
    beforePeriod = [
    moment(secureTime.value.dateRange[0]).subtract(1, 'month').format(dateFormat),
    moment(secureTime.value.dateRange[1]).subtract(1, 'month').format(dateFormat),
    ]
  }else if (secureTime.value.timeType === 'THIS_YEAR') {
    beforePeriod = [
    moment(secureTime.value.dateRange[0]).subtract(1, 'year').format(dateFormat),
    moment(secureTime.value.dateRange[1]).subtract(1, 'year').format(dateFormat),
    ]
  }
    numTotal.secure = 1
    if (time.secure) {
      clearInterval(time.secure)
    }
    let params = {
        period:secureTime.value.dateRange.join(','),
        beforePeriod:beforePeriod.join(','),
        pageSize:5,
        pageNumber:numTotal.secure
      }
      let res =await visualizationRanking(params)
      secureRank.value = res.records.map(item => {
        return {
          name:item.name,
          value:item.value,
          percentage:item.percentage,
        }
      });
    numTotal.secure = 2
    time.secure=setInterval(async()=>{
      let params = {
        period:secureTime.value.dateRange.join(','),
        beforePeriod:beforePeriod.join(','),
        pageSize:5,
        pageNumber:numTotal.secure
      }
      let res =await visualizationRanking(params)
      secureRank.value = res.records.map(item => {
        return {
          name:item.name,
          value:item.value,
          percentage:item.percentage,
        }
      });
      if (res.pages === numTotal.secure) {
        numTotal.secure = 0
      }else{
        numTotal.secure++
      }
    },5000)
}
// 安全生产值占比
const changeProportionTime = async()=>{
  let res =  await areasAllGraph({projectId: '1323555902002921473'})
  roundPieData.throughNum = 0
  roundPieData.arr = res.map((item,index)=>{
  roundPieData.throughNum +=item.spaceNum
    return {
      label:item.name,
      value:item.spaceNum || 0,
      color:colors[index]
    }
  })
}
// 问卷调查统计
const changeStatisticsTime = async()=>{
 let res = await visualizationQuestionnaire({period:statisticsTime.value.dateRange.join(',')})
 totalData.statisticsTotal = splitArray(res, 5)
 barData.xData = totalData.statisticsTotal[numTotal.statistics].map(item=>{
  return item.name
 })
 barData.yData[0].data = totalData.statisticsTotal[numTotal.statistics].map(item=>{
  return item.value
 })
 if (time.statistics) {
      clearInterval(time.statistics)
    }
    time.statistics=setInterval(()=>{
      if (totalData.secureRankTotal.length === numTotal.statistics) {
        numTotal.statistics = 0
      }else{
        numTotal.statistics++
      }
    },5000)
}
// 商户/档位统计
const getMerchantData = async ()=>{
  let res =  await visualizationCount()
  merchant.value[0].value = res.merchantTotal
  merchant.value[1].value = res.gearTotal
}
onMounted(()=>{
  getMerchantData()
  changeProportionTime()
})
onUnmounted(() =>{
	clearInterval(time.secure)
	clearInterval(time.statistics)
})
</script>
<style lang="less" scoped>
.gear-position {
  .gear-position-box {
    width: 200px;

    .gear-position-name {
      font-size: 14px;
      color: #AAAAAA;
    }

    .gear-position-value {
      font-size: 18px;
      color: #fff;
      font-weight: bold;
    }
  }
}

.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  :deep(.policeList) {
    height: auto;
  }

  .content {
    font-size: 16px;
    color: #fff;
    text-align: center;
  }

  .pie-center {
    font-size: 18px;
    font-weight: bold;
  }
}

.chart {
  height: 200px;
}
</style>