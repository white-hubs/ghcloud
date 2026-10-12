<template>
  <SubPanelTemplate title="会议室预订管理">
    <div class="charts1" ref="abc"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="园区活动管理">
    <div class="charts1" ref="abcd"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="日常服务管理统计分析">
    <div class="charts1" ref="abcde"> </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from "echarts";

const abc = ref()
const abcd = ref()
const abcde = ref()
const initChart = () => {
  var option = {
             tooltip: {
                trigger: 'axis',
                textStyle: {
              fontSize: 30 // 字体大小
            },
          },
          legend: {
         data: [
          {
            name: '已预约',
            textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
          },
          {
            name:'未预约',
            textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
          }
        ]
     },
            xAxis: {
              axisLabel: {
          textStyle: {
            color:'#fff',
            fontSize: 30,
          },
        },
                data: ["09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"]
            },
            yAxis: {
         type: 'value',
         axisLabel: {
          color:'#fff',
            fontSize: 34 // 设置y轴标签的字体大小为14
        }
     },
            series: [{
                name: '已预约',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20, 5]
            }, {
                name: '未预约',
                type: 'bar',
                data: [20, 5, 4, 30, 20, 5, 20]
            }]
        };
  const myChart = echarts.init(abc.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
const initChart1 = () => {
   // 定义数据
   var data = [
            { name: '讲座', value: [120, 132, 101, 134, 90, 230, 210] },
            { name: '工作坊', value: [220, 182, 191, 234, 290, 330, 310] },
            { name: '展览', value: [150, 232, 201, 154, 190, 330, 410] },
            { name: '演出', value: [820, 932, 901, 934, 1290, 1330, 1320] }
        ];
 
        // 设置 x 轴标签
        var categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
 
        // 指定图表的配置项和数据
        var option = {
            tooltip: {
                trigger: 'axis',
                textStyle: {
      fontSize: 30 // 字体大小
    },
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: data.map(item => item.name),
                textStyle:{
                  fontSize: 32,//字体大小
                  color: '#ffffff'//字体颜色
                  }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: categories,
                axisLabel: {
          textStyle: {
            color:'#fff',
            fontSize: 30,
          },
        },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                color:'#fff',
                fontSize: 34 // 设置y轴标签的字体大小为14
              }
            },
            series: data.map(item => ({
                name: item.name,
                type: 'bar',
                stack: 'total', // 堆叠系列
                data: item.value
            }))
        };
  const myChart = echarts.init(abcd.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
const initChart2 = () => {
 // 定义数据
 var dates = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        var serviceRequests = [120, 150, 180, 170, 210, 160, 190]; // 每日服务请求数量
 
        // 指定图表的配置项和数据
        var option = {
            tooltip: {
                trigger: 'axis',
                textStyle: {
                  fontSize: 30 // 字体大小
                },
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                  textStyle: {
                    color:'#fff',
                    fontSize: 30,
                  },
                },
            },
            yAxis: {
                type: 'value',
         axisLabel: {
          color:'#fff',
            fontSize: 34 // 设置y轴标签的字体大小为14
        }
            },
            series: [{
                name: '服务请求数量',
                type: 'line',
                data: serviceRequests,
                smooth: true // 使线条平滑
            }]
        };
  const myChart = echarts.init(abcde.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
onMounted(() => {
 initChart()
 initChart1()
 initChart2()
})
</script>
<style lang="less" scoped>
.charts1{
  height: 220px;
}
</style>