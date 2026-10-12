<template>
  <SubPanelTemplate title="物业运营情况">
    <div class="chart" id="物业运营情况"></div>
  </SubPanelTemplate>
  <SubPanelTemplate title="异常滚动播报">
    <div class="table-box">
      <RollTable :column="columns" :data="data" :showLength="8">
      </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types';
import * as echarts from "echarts";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
function init物业运营情况(){
  const myChart = echarts.init(document.getElementById('物业运营情况'));
  var option = {
            // 不显示标题
            title: {
                text: ''
            },
            // 设置图表的网格、坐标轴等
            grid: {
                left: '1%',
                right: '1%',
                bottom: '0%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: ['1月', '2月', '3月', '4月', '5月', '6月'],
                axisLabel: {
                    fontSize: 40, // 设置 x 轴标签字体大小
                    color:'#fff'
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    fontSize: 40, // 设置 y 轴标签字体大小
                    color:'#fff'
                }
            },
            series: [
                {
                    name: '物业费收缴率',
                    type: 'line',
                    data: [85, 90, 92, 88, 95, 97],
                    itemStyle: {
                        color: '#ff0000' // 设置线条颜色
                    },
                    areaStyle: {
                        color: 'rgba(255, 0, 0, 0.3)' // 设置填充颜色
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color:'#fff',
                        fontSize: 40 // 设置数据点标签字体大小
                    }
                },
                {
                    name: '设施完好率',
                    type: 'line',
                    data: [50, 15, 20, 44, 76, 98],
                    itemStyle: {
                        color: '#00ff00' // 设置线条颜色
                    },
                    areaStyle: {
                        color: 'rgba(0, 255, 0, 0.3)' // 设置填充颜色
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color:'#fff',
                        fontSize: 40 // 设置数据点标签字体大小
                    }
                },
                {
                    name: '投诉处理率',
                    type: 'line',
                    data: [18, 99, 0, 99, 40, 70],
                    itemStyle: {
                        color: '#0000ff' // 设置线条颜色
                    },
                    areaStyle: {
                        color: 'rgba(0, 0, 255, 0.3)' // 设置填充颜色
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color:'#fff',
                        fontSize: 40 // 设置数据点标签字体大小
                    }
                },
                {
                    name: '满意度',
                    type: 'line',
                    data: [100, 100, 100, 100, 100, 150],
                    itemStyle: {
                        color: '#ff00ff' // 设置线条颜色
                    },
                    areaStyle: {
                        color: 'rgba(255, 0, 255, 0.3)' // 设置填充颜色
                    },
                    label: {
                        show: true,
                        position: 'top',
                        fontSize: 40 // 设置数据点标签字体大小
                    }
                }
            ]
        };
 
        // 使用刚指定的配置项和数据显示图表
        myChart.setOption(option);
}
onMounted(() => {
  init物业运营情况()
})
const columns = ref([
  {
    title: "异常事件",
    dataIndex: "name",
  },
  {
    title: "异常区域",
    dataIndex: "value",
  },
  {
    title: "异常等级",
    dataIndex: "alarmStatus",
  },
]);
const data = [
  {
    name: "设备故障",
    value: "区域A",
    alarmStatus: "高",
  },
  {
    name: "网络中断",
    value: "区域B",
    alarmStatus: "中",
  },
  {
    name: "电力异常",
    value: "区域C",
    alarmStatus: "低",
  },
  {
    name: "温度过高",
    value: "区域D",
    alarmStatus: "高",
  },
  {
    name: "安全入侵",
    value: "区域E",
    alarmStatus: "中",
  },
  {
    name: "漏水检测",
    value: "区域F",
    alarmStatus: "低",
  },
  {
    name: "火灾预警",
    value: "区域G",
    alarmStatus: "高",
  },
  {
    name: "门禁异常",
    value: "区域H",
    alarmStatus: "中",
  },
  {
    name: "视频丢失",
    value: "区域I",
    alarmStatus: "低",
  },
  {
    name: "烟雾报警",
    value: "区域J",
    alarmStatus: "高",
  },
];
const overviewTime = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
})
const changeHandleOverviewTime = () => {
};
onMounted(()=>{
})
</script>
<style lang="less" scoped>
.echarts {
  height: 200px;
}
.chart{
  height: 200px;
}
.delect {
  color: #f14545;
  cursor: pointer;
}

.table-box {
  height: 490px;
}
</style>