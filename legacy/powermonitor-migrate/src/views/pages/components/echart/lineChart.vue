<template>
<div class="lineChart" ref="lineChart">

</div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, ref, watch } from "vue";
import * as echarts from "echarts"
export default defineComponent({
    props:{
        xData:{
            type:Array,
            default:() =>{
                return []
            }
        },
        series:{
            type:Array,
            default:() =>{
                return [{data:[],color:""}]
            }
        }
    },
    setup(props){
        const lineChart = ref(null);
        const setOptions = () =>{
            let myChart = echarts.init(lineChart.value);
            myChart.setOption({
                tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'line',
						lineStyle: {
							color: 'rgba(50, 216, 205, 1)'
						},
					}
				},
                grid: {
                    top:'4%',
                    left: '3%',
                    right: '3%',
                    bottom: '2%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: props.xData,
                    axisLabel: {
                        rotate:30,
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
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: '#86909C', //x轴字体颜色
                        textStyle:{
                            fontSize:12
                        },
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#F2F3F5',
                            type: 'solid'
                        }
                    },
                },
                series:function(){
                    let series = [];
                    for(let i = 0 ; i < props.series.length ; i++ ){
                        let serie = {
                            data: props.series[i].data,
                            type: 'bar',
                            barWidth: 16,
                            itemStyle:{
                                normal:{
                                    color:props.series[i].color
                                }
                            }
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
        watch(() =>props.series,(val) =>{
            setOptions()
        })
        return{
            lineChart
        }
    }
})
</script>

<style lang="less" scoped>
.lineChart{
    width: 100%;
    height: 100%;
}
</style>