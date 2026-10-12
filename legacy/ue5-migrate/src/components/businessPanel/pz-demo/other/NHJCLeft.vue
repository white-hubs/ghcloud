<template>
  <SubPanelTemplate title="区域能耗计分析">
    <div class="chart1" ref="abc"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="用能能耗计分析">
    <div class="chart1" ref="abcd"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="能耗设备分析">
    <div class="chart1">
    <eSankey ref="esankey" :nodes="energydirectionNode" :links="energydirectionLinks" />
      </div>
</SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import eSankey from "@/components/businessPanel/public/charts/eSankey.vue"
import * as echarts from "echarts";

const abc = ref()
const abcd = ref()
const energydirectionNode = ref([
    {
        "name": "二氧化碳", itemStyle: {
            color: 'rgba(112,134,243,0.5)'
        }
    },
    {
        "name": "电力排放", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "燃气排放", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "水利用排放", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "办公区", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "审判区", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "诉服区", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "公共区域", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "停车场", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "羁押区", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
])
const energydirectionLinks = ref<any>([
    { "source": "二氧化碳", "target": "电力排放", "value": 6000 ,},
    { "source": "二氧化碳", "target": "燃气排放", "value": 2500 },
    { "source": "二氧化碳", "target": "水利用排放", "value": 500 },
    { "source": "电力排放", "target": "办公区", "value": 1500 },
    { "source": "电力排放", "target": "审判区", "value": 1400 },
    { "source": "燃气排放", "target": "诉服区", "value": 900 },
    { "source": "燃气排放", "target": "公共区域", "value": 400 },
    { "source": "燃气排放", "target": "停车场", "value": 200 },
    { "source": "水利用排放", "target": "羁押区", "value": 200 },
])
const initChart = () => {
  var data = [
    {name: '区域A', value: 120},
    {name: '区域B', value: 180},
    {name: '区域C', value: 150},
    {name: '区域D', value: 200},
    // 可以添加更多区域的数据
];
 // 配置图表选项和数据
 var option = {
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c}',
        textStyle: {
              fontSize: 40 // 字体大小
            },
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: ['能耗'],
        textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
    },
    series: [
        {
            name: '能耗',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            emphasis: {
                itemStyle: {
                fontSize: 32,//字体大小
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            label: {
                fontSize: 32,//字体大小
                color: '#ffffff',//字体颜色
                formatter: '{b}: {c} ({d}%)'
            }
        }
    ]
};
  const myChart = echarts.init(abc.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
const initChart1 = () => {
          // 准备数据
          var categories = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05']; // 时间维度
        var energyTypes = ['电力', '天然气', '煤炭', '可再生能源']; // 能源类型维度
        var data = [
            {name: '电力', value: [120, 132, 101, 134, 90]},
            {name: '天然气', value: [220, 182, 191, 234, 290]},
            {name: '煤炭', value: [150, 212, 201, 154, 100]},
            {name: '可再生能源', value: [820, 932, 901, 934, 1290]}
        ];

        // 将数据转换为堆叠柱状图所需的格式
        var stackData = categories.map(function (category, index) {
            return energyTypes.map(function (type, typeIndex) {
                return {
                    name: type,
                    value: data[typeIndex].value[index],
                    category: category
                };
            });
        }).reduce(function (acc, curr) {
            return acc.concat(curr);
        }, []);

        // 指定图表的配置项和数据
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                textStyle: {
              fontSize: 30 // 字体大小
            },
            },
            legend: {
                data: energyTypes,
                textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
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
                axisLabel: { formatter: '{value}h',
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     }
            },
            series: [
                {
                    name: '能耗',
                    type: 'bar',
                    stack: 'total', // 指定堆叠的系列名称
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    data: energyTypes.map(function (type) {
                        return data[energyTypes.indexOf(type)].value;
                    })
                }
                // 注意：这里的data应该是直接映射到每个能源类型的能耗值上，
                // 但是由于我们使用了堆叠柱状图，并且数据已经转换为了适合堆叠的格式，
                // 所以我们需要在series中通过legend.data和stack属性来指定每个系列对应的名称和堆叠组。
                // 然而，ECharts的堆叠柱状图通常不需要我们在series的data中直接指定每个类别的数据，
                // 而是应该通过category和name属性在数据源中指定，然后ECharts会自动堆叠。
                // 因此，上面的data属性在这里是不正确的，我们应该使用下面的方式来指定数据：
                /*
                {
                    name: '堆叠能耗',
                    type: 'bar',
                    stack: 'energy',
                    label: {
                        show: true
                    },
                    data: stackData.map(function (item) {
                        return item.value;
                    })
                },
                // 并且我们需要在legend中移除或修改name属性以匹配stackData中的name
                legend: {
                    // ... 其他配置
                    // 由于stackData中的name属性已经包含了能源类型，所以这里不需要再指定data
                    // data: energyTypes // 这行应该移除或注释掉
                }
                */
                // 但是，为了简化示例并保持与原始回答风格一致，我们在这里仍然使用错误的data属性，
                // 并在下面提供正确的示例代码段。在实际应用中，请使用正确的数据映射方式。
            ]
            // 注意：上面的series配置是错误的，因为它没有正确地使用堆叠数据。
            // 正确的配置应该像这样（下面的代码段将替换上面的series配置）：
        };

        // 正确的series配置示例（替换上面的series部分）：
        option.series = energyTypes.map(function (type) {
            return {
                name: type,
                type: 'bar',
                stack: 'energy', // 所有堆叠的系列都应该使用相同的stack名称
                label: {
                    show: true,
                    position: 'insideRight' // 或其他位置
                },
                emphasis: {
                    focus: 'series'
                },
                data: data[energyTypes.indexOf(type)].value
            };
        });
  const myChart = echarts.init(abcd.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}

onMounted(() => {
 initChart()
 initChart1()
})
</script>
<style lang="less" scoped>
.chart1{
  height: 220px;
}
</style>