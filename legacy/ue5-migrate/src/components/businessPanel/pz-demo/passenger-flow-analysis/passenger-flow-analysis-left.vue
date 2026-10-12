<template>
  <SubPanelTemplate title="客流效果评估">
    <template #extra>
      <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
    </template>
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
  </SubPanelTemplate>
  <SubPanelTemplate title="客流预测" class="visiting-data">
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
  <SubPanelTemplate title="访客统计分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <DeviceStatistics class="DeviceStatistics" imgPath="overView21.png" :statistic="deviceStatisticsData1">
    </DeviceStatistics>
    <div class="chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
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
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from '@/components/businessPanel/public/types';
const contentList = ref([
  {
    name: "促销来访数",
    field:"timeoutRatio",
    value: '100',
  },
  {
    name: "促销离开数",
    field:"actualRatio",
    value: '80',
  },
  {
    name: "促销停留数",
    field:"ratio",
    value: '90',
  },
]);
const visitingData = ref([
    { title: "未来七天来访数", value: 7800, ratio: 12.3 },   
    { title: "未来7天预约数", value: 4500, ratio: 50.0 },   
    { title: "未来七天到访率", value: 1500, ratio: -5.0 },      
    { title: "未来7天离开数", value: 800, ratio: 8.7 },    
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
    title: "访客总量",
    total: 33,
    itemize: [
        {
            name: '来访占比',
            label: "已到访",
            value: 10,
            key: "OFFLINE",
        }
    ]
});
const appointmentTotalNum = ref(0)
const appointmentTotalName = ref('成本总和')
const barData = reactive({
    xData: ['行政办公区', '生产研发区', '仓储物流区', '公共服务区'],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '来访',
            color: ['rgba(28, 56, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [18, 25, 48, 52],
            name: '未来访',
            color: ['rgba(28, 48, 189, 0.80)', 'rgba(42, 232, 189, 0)']
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
  appointmentTotalName.value = '成本总和'
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
  height: 180px;
}

.elevatorAnalysisList {
  margin-left: 10px;
  width: 180px;
}

.DeviceStatistics {
  height: 60px;
}
</style>