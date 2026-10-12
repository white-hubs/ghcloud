<template>
  <SubPanelTemplate title="停车场运行统计分析" class="visiting-data">
    <div class="item" v-for="item in visitingData" :key="item.title">
      <a-statistic :title="item.title">
        <template #formatter>
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
          <div class="ringRatio">
            <span style="white-space: nowrap;">环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
            <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
          </div>
        </template>
      </a-statistic>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="停车位实时监控">
    <template #extra>
      <DateInlineForm @search="changeTopTimeFrame">
      </DateInlineForm>
    </template>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="appointmentChartData">
          <div>{{ appointmentTotalNum }}</div>
          <div>{{ appointmentTotalName }}</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="appointmentChartData" class="elevatorAnalysisList">
      </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>

  <SubPanelTemplate title="区域停车分析">
    <div class="chart">
      <overviewChartBar :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from '../../public/types'

const visitingData = ref([
    { title: "停车场停车率统计", value: 7800, ratio: 12.3 },   
    { title: "空闲停车位统计", value: 4500, ratio: 50.0 },   
    { title: "平均停车时长统计", value: 1500, ratio: -5.0 },      
    { title: "新能源车充电率统计", value: 800, ratio: 8.7 },    
]);
const overviewTime = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
})

const topTimeFrame = ref({
  timeType:'rili',
});
const appointmentChartData = ref<{ name: string; value: number; color: string; ratio?: string }[]>(
  []
);
const deviceStatisticsData1 = reactive({
    title: "告警总量",
    total: 33,
    itemize: [
        {
            name: '处理占比',
            label: "已处理",
            value: 10,
            key: "OFFLINE",
        }
    ]
});
const appointmentTotalNum = ref(0)
const appointmentTotalName = ref('成本总和')
const barData = reactive({
    xData: ['行政区','生产区','仓储物流','公共区','其他区域'],
    yData: [
        {
            data: [10, 20, 30, 40,80],
            name: '电车',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [5, 10, 20, 30,90],
            name: '燃油车',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
    ]
})
const changeTopTimeFrame = ()=>{
  appointmentTotalNum.value = 0
 if(topTimeFrame.value.timeType === 'rili'){
  appointmentChartData.value = [
    { name: '使用车位数量', value: 4500000, color: '#FFAB10' },   
    { name: '空闲车位数量', value: 600000, color: '#2F8DFF'  }, 
    { name: '电车数量占比', value: 450000, color: '#F14545' }, 
    { name: '滞留车位占比', value: 1200000, color:'#19F8F7' },
    { name: '其他人力成本', value: 150000, color: "#B9D9FF" } 
  ]
  appointmentTotalName.value = '车位总览'
 }else if (topTimeFrame.value.timeType === 'quyu') {
  appointmentChartData.value = [
    { name: '行政办公区', value: 12000, color: '#FFAB10' },   
    { name: '生产研发区', value: 6000, color: '#2F8DFF'  }, 
    { name: '仓储物流区', value: 3800, color: '#F14545' }, 
    { name: '公共服务区', value: 2790, color:'#19F8F7' },
    { name: '其他区域', value: 880, color: "#B9D9FF" } 
  ]
 }else if (topTimeFrame.value.timeType === 'weihu') {
  appointmentChartData.value = [
    { name: '建筑物维护', value: 45000, color: '#FFAB10' },   
    { name: '设施设备维护', value: 6000, color: '#2F8DFF'  }, 
    { name: '环境维护', value: 400, color: '#F14545' }, 
    { name: '安全维护', value: 1000, color:'#19F8F7' },
    { name: '其他维护', value: 1500, color: "#B9D9FF" } 
  ]
 }
 appointmentChartData.value.forEach(e=>{
    appointmentTotalNum.value+= e.value 
  })
}
const changeHandleOverviewTime = () => {
};
</script>
<style lang="less" scoped>
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;

    .item {
      height: 60px;
      width: 50%;
      margin-top: 30px;
      margin-bottom: 10px;
      justify-content: center;
      box-sizing: border-box;
      padding-left: 20px;

      .unit {
        font-size: 12px;
      }

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #D0DEEE;
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
      }
    }
  }

  .ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
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

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;

  div {
    color: #fff;
    text-align: center;
    font-size: 14px;
  }
}

.chart {
  flex: 1;
  height: 200px;
}

.elevatorAnalysisList {
  margin-left: 10px;
  width: 180px;
}

.DeviceStatistics {
  height: 60px;
}
</style>