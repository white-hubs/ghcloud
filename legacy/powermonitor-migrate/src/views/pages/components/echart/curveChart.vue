<template>
<div class="curveChart" ref="curveChart"></div>
</template>
<script lang="jsx">
import { defineComponent, onMounted, watch,ref } from "vue";
import * as echarts from "echarts"
export default defineComponent({
    props:{
        xData:{
            type:Array,
            default:() =>{
                return []
            }
        },
        //data为数据 color 为曲线颜色  areaColor为区域颜色   
        series:{
            type:Array,
            default:() =>{
                return [{data:[],color:"",areaColor:[]}]
            }
        }
    },
    setup(props){
        const curveChart = ref(null);
        const setOptions = () =>{
            let myChart = echarts.init(curveChart.value);
            myChart.setOption({
				grid: {
					top:'4%',
                    left: '1%',
                    right: '1%',
                    bottom: '1%',
					containLabel: true
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'line',
						lineStyle: {
							color: 'rgba(50, 216, 205, 1)'
						},
					}
				},
				xAxis: [{
					type: 'category',
					boundaryGap: false,
					axisLine: {
						show: false
					},
					axisLabel: {
                        color: '#86909C', //x轴字体颜色
                        textStyle:{
                            fontSize:12
                        },
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#E5E6EB'
                        }
                    },
					axisTick: {
						show: false
					},
					data: props.xData
				}],
				yAxis: [{
						type: 'value',
						name: '',
						padding: 5,
						// max: 1000,
						splitLine: {
							show: true,
							lineStyle: {
								color: 'rgba(255, 255, 255, 0.2)',
								type: 'solid'
							}
						},
						splitLine: {
                            show: true,
                            lineStyle: {
                                color: '#F2F3F5',
                                type: 'solid'
                            }
                        },
						axisLabel: {
                            color: '#86909C', //x轴字体颜色
                            textStyle:{
                                fontSize:12
                            },
                        },
						axisTick: {
							show: false
						}
					},

				],
                series:function(){
                    let series = [];
                    for(let i=0;i<props.series.length;i++){
                        let serie = {
                            type:"line",
                            smooth: true,
                            symbol: 'circle',
                            itemStyle: {
                                normal: {
                                    color: '#38D0FB',
                                    lineStyle: {
                                        color: props.series[i].color,
                                        width: 2
                                    },
                                }
                            },
                            data:props.series[i].data
                        }
                        if(props.series[i].areaColor&&props.series[i].areaColor.length){
                            serie = {...serie,areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: props.series[i].areaColor[0],
                                        },
                                        {
                                            offset: 1,
                                            color: props.series[i].areaColor[1],
                                        }
                                    ], false),
                                },
                            }}
                        }
                        series.push(serie)
                    }
                    return series
                }()
            })
        }
        onMounted(() =>{
            setOptions()
        })
        watch(() =>props.series,() =>{
            setOptions()
        })
        return {
            curveChart
        }
    }
})
</script>

<style lang="less" scoped>
.curveChart{
    width: 100%;
    height: 100%;
}
</style>