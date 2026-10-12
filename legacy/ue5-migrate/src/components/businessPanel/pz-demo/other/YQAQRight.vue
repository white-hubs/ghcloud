<template>
  <div>
    <SubPanelTemplates title="高峰时段">
      <div class="chart" id="高峰时段"></div>
    </SubPanelTemplates>
    <SubPanelTemplates title="访客趋势">
      <div class="chart" id="访客趋势"></div>
    </SubPanelTemplates>
    <SubPanelTemplate title="报警时间">
    <div class="table-box">
      <RollTable :column="columns" :data="data" :showLength="8">
      </RollTable>
    </div>
  </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted, onBeforeUnmount} from 'vue'
import bus from "@/utils/bus";
import SubPanelTemplates from "../../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import * as echarts from "echarts";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

let timer = null;
function init高峰时段(){
  const myChart = echarts.init(document.getElementById('高峰时段'));
 // 数据
 const categories = ['00:00-03:00', '03:00-06:00', '06:00-09:00', '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-24:00'];
        const values = [5, 10, 30, 60, 40, 80, 120, 50]; // 示例数据，假设这些值代表各时间段的活动量
        const peakHours = [2, 5, 6]; // 高峰时段的索引，对应 categories 中的时间段
 
        // 配置项
        const option = {
            xAxis: {
                type: 'category',
                data: categories,
                axisLabel: {
                    interval: 0, // 显示所有标签
                    rotate: 45, // 旋转标签以避免重叠
                    textStyle: {
                        fontSize: 16,
                        color: '#fff'
                    }
                },
                splitLine: {
                    show: false // 不显示网格线
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        fontSize: 16,
                        color: '#fff'
                    }
                }
            },
            series: [
                {
                    name: '活动量',
                    type: 'bar',
                    data: values,
                    itemStyle: {
                        normal: {
                            color: function(params) {
                                // 根据是否是高峰时段设置不同颜色
                                return peakHours.includes(params.dataIndex) ? '#ff00008a' : '#00ff008a';
                            }
                        }
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}',
                        textStyle: {
                            fontSize: 40,
                            color: '#fff'
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

  // 使用刚指定的配置项和数据显示图表
  myChart.setOption(option);
}
function init访客趋势(){
  const myChart = echarts.init(document.getElementById('访客趋势'));
// 数据
const categories = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const values = [5, 10, 15, 20, 25, 30, 50, 70,  260, 240,50,0]; // 示例数据，表示每个小时的访客数量
 
        // 配置项
        const option = {
            xAxis: {
                type: 'category',
                data: categories,
                axisLabel: {
                    interval: 0, // 显示所有标签
                    rotate: -45, // 旋转标签以避免重叠
                    textStyle: {
                        fontSize: 30,
                        color: '#fff'
                    }
                },
                splitLine: {
                    show: false // 不显示网格线
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        fontSize: 14,
                        color: '#fff'
                    }
                }
            },
            series: [
                {
                    name: '访客数量',
                    type: 'line',
                    data: values,
                    smooth: true, // 设置为 true 以显示平滑曲线
                    itemStyle: {
                        normal: {
                            color: '#ff0000' // 线条颜色
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: 'rgba(255, 0, 0, 0.1)' // 填充区域颜色
                        }
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}',
                        textStyle: {
                            fontSize: 30,
                            color: '#fff'
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
 
  // 使用刚指定的配置项和数据显示图表
  myChart.setOption(option);
}
onMounted(()=>{
  init高峰时段()
  init访客趋势()
})
onBeforeUnmount(()=>{
  timer && clearInterval(timer)
})

const columns = ref([
  {
    title: "报警事件",
    dataIndex: "name",
  },
  {
    title: "报警区域",
    dataIndex: "value",
  },
  {
    title: "报警等级",
    dataIndex: "alarmStatus",
  },
  {
    title: "是否处理",
    dataIndex: "status",
  },
]);
const data = ref([
  {
    name: "火灾报警",
    value: "区域A",
    alarmStatus: "高级",
    status: "已处理",
  },
  {
    name: "入侵报警",
    value: "区域B",
    alarmStatus: "中级",
    status: "未处理",
  },
  {
    name: "烟雾报警",
    value: "区域C",
    alarmStatus: "低级",
    status: "处理中",
  },
  {
    name: "设备故障",
    value: "区域D",
    alarmStatus: "高级",
    status: "已忽略",
  },
  {
    name: "温度异常",
    value: "区域E",
    alarmStatus: "中级",
    status: "待处理",
  },
  {
    name: "湿度异常",
    value: "区域F",
    alarmStatus: "低级",
    status: "已处理",
  },
  {
    name: "电压波动",
    value: "区域G",
    alarmStatus: "高级",
    status: "处理中",
  },
  {
    name: "电流过载",
    value: "区域H",
    alarmStatus: "中级",
    status: "未处理",
  },
  {
    name: "网络故障",
    value: "区域I",
    alarmStatus: "低级",
    status: "已忽略",
  },
  {
    name: "门禁异常",
    value: "区域J",
    alarmStatus: "高级",
    status: "待处理",
  },
]);
const num = ref(0);
let cameraList = ref<any[]>([
  {
        "id": 1,
        "name": "视频1",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/8f47c5301397757900067377319/v.f100830.mp4"
  },
  {
        "id": 2,
        "name": "视频2",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/076881ff1397757899908022992/v.f100830.mp4"
  },
  {
        "id": 3,
        "name": "视频3",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/5d2febd41397757900056698391/v.f100830.mp4"
  },
  {
        "id": 4,
        "name": "视频4",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/9c172c5b1397757899982090126/v.f100830.mp4"
  },
]);
const cameraListTotal = ref([]);
// 切换视频
const changeVideo = () => {
  if (num.value === cameraListTotal.value.length - 1) {
    num.value = 0;
  } else {
    num.value++;
  }
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = cameraListTotal.value[num.value];
  }
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
</script>
<style lang="less" scoped>
.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
      .video{
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;

  img {
    width: 14px;
    height: 14px;
  }
}
.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
.chart{
  height: 220px;
}
.table-box{
  height: 300px
}
</style>