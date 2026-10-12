<template>
  <SubPanelTemplate title="促销活动效果分析">
    <div class="chart">
    <overviewChartBar :title="''" :xData="['促销销售额','促销参与率','促销成本']" :yData="[
        {
            data: [90, 40, 120],
            name: '',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        }
    ]"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="销售区域收益统计分析">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame">
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
  <SubPanelTemplate title="销售率统计分析">
    <div class="chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from '@/components/businessPanel/public/types';
const visitingData = ref([
    { title: "已销售面积", value: 7800, ratio: 12.3 },   
    { title: "销售率", value: 60, ratio: 10.0 },   
    { title: "今年销售面积", value: 1500, ratio: 5.0 },      
    { title: "今年相对销售率", value: 40, ratio: 8.7 },    
]);
const timeList = [
  { label: "区域统计", value: "quyu" },
  { label: "A区", value: "A区" },
  { label: "B区", value: "B区" },
  { label: "本月统计", value: "benyue" },
]
const overviewTime = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
})

const topTimeFrame = ref({
  timeType:'quyu',
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
    xData: ['整体销售率', '本季度', 'A区', 'B区'],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '已售',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [18, 25, 48, 52],
            name: '未售',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        },
    ]
})
const changeTopTimeFrame = ()=>{
  appointmentTotalNum.value = 0
 if(topTimeFrame.value.timeType === 'rili'){
  appointmentChartData.value = [
    { name: '工资及福利', value: 4500000, color: '#FFAB10' },   
    { name: '培训与发展', value: 600000, color: '#2F8DFF'  }, 
    { name: '招聘与选拔', value: 450000, color: '#F14545' }, 
    { name: '社会保险与公积金', value: 1200000, color:'#19F8F7' },
    { name: '其他人力成本', value: 150000, color: "#B9D9FF" } 
  ]
  appointmentTotalName.value = '区域收益'
 }else if (topTimeFrame.value.timeType === 'quyu') {
  appointmentChartData.value = [
    { name: '行政办公区', value: 12000, color: '#FFAB10' },   
    { name: '生产研发区', value: 6000, color: '#2F8DFF'  }, 
    { name: '仓储物流区', value: 3800, color: '#F14545' }, 
    { name: '公共服务区', value: 2790, color:'#19F8F7' },
    { name: '其他区域', value: 880, color: "#B9D9FF" } 
  ]
  appointmentTotalName.value = '区域总收益'
 }else if (topTimeFrame.value.timeType === 'A区') {
  appointmentChartData.value = [
    { name: '1号楼', value: 45000, color: '#FFAB10' },   
    { name: '2号楼', value: 6000, color: '#2F8DFF'  }, 
    { name: '3号楼', value: 400, color: '#F14545' }, 
    { name: '4号楼', value: 1000, color:'#19F8F7' },
    { name: '5号楼', value: 1500, color: "#B9D9FF" } 
  ]
  appointmentTotalName.value = 'A区总收益'
 }else if (topTimeFrame.value.timeType === 'B区') {
  appointmentChartData.value = [
    { name: '厂房', value: 45000, color: '#FFAB10' },   
    { name: '空地', value: 6000, color: '#2F8DFF'  }, 
    { name: '写字楼', value: 400, color: '#F14545' }, 
  ]
  appointmentTotalName.value = 'B区总收益'
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
  div{
    color: #fff;
    text-align: center;
    font-size: 14px;
  }
}

.chart {
  flex: 1;
  height: 220px;
}
.elevatorAnalysisList{
  margin-left: 10px;
  width: 180px;
}
.DeviceStatistics{
  height: 60px;
}
</style>