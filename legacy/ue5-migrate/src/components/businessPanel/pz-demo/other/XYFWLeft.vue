<template>
  <SubPanelTemplate title="课程管理">
    <div class="chart" ref="abc"></div>
  </SubPanelTemplate>
  <SubPanelTemplate title="学生信息管理">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
  <SubPanelTemplate title="教学资源管理">
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData" class="chart-box">
          <div>{{ alarmTotal }}</div>
          <div>总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from "echarts";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"

const abc = ref();
const columns = ref([
  {
    title: "学生",
    dataIndex: "name",
  },
  {
    title: "学籍",
    dataIndex: "studentStatus",
  },
  {
    title: "年龄",
    dataIndex: "age",
  },
]);
const data = ref<any>([
  {
        name: "李华",
        studentStatus: '初二',
        age: 14
    },
    {
        name: "王芳",
        studentStatus: '初三',
        age: 15
    },
    {
        name: "赵雷",
        studentStatus: '高一',
        age: 16
    },
    {
        name: "孙婷",
        studentStatus: '高二',
        age: 17
    },
    {
        name: "周明",
        studentStatus: '高三',
        age: 18
    },
    {
        name: "吴浩",
        studentStatus: '初一',
        age: 13
    },
    {
        name: "郑洁",
        studentStatus: '初二',
        age: 14
    },
    
]);
const alarmTotal = ref(640)
const pieData = ref([
  {
    name: '教材资源',
    value: 300,
    color: '#2AE8BD',
  },
  {
    name: '多媒体资源',
    value: 140,
    color: '#2989FF',
  },
  {
    name: '网络资源',
    value: 100,
    color: '#FFC700',
  },
  {
    name: '实验设备',
    value: 100,
    color: '#F14545',
  },
])
const initChart = () => {
 // 指定图表的配置项和数据
 const option = {
     title: {
         text: ''
     },
     tooltip: {
         trigger: 'axis',
         textStyle: {
      fontSize: 30 // 字体大小
    },
     },
     legend: {
         data: [
          {
            name: '选课趋势',
            textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
          },
          {
            name:'退课趋势',
            textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
          }
        ]
     },
     xAxis: {
         type: 'category',
         boundaryGap: false,
         axisLabel: {
          textStyle: {
            color:'#fff',
            fontSize: 30,
          },
        },
         data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
     },
     yAxis: {
         type: 'value',
         axisLabel: {
          color:'#fff',
            fontSize: 34 // 设置y轴标签的字体大小为14
        }
     },
     series: [
         {
             name: '选课趋势',
             type: 'line',
             stack: '总量',
             data: [120, 132, 101, 134, 90, 230, 210]
         },
         {
             name: '退课趋势',
             type: 'line',
             stack: '总量',
             data: [220, 182, 191, 234, 290, 330, 310]
         }
     ]
 };
 const myChart = echarts.init(abc.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
onMounted(() => {
 initChart()
})
</script>
<style lang="less" scoped>
.chart {
  height: 220px;
  .chart-box {
    width: 160px;

    div {
      color: #fff;
      text-align: center;
      font-size: 16px;
    }
  }
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
</style>