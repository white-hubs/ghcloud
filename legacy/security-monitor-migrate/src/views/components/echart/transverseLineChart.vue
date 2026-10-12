<template>
    <div class="transverseLineChart" ref="transverseLineChart">
    
    </div>
    </template>
    
    <script lang="jsx">
    import { defineComponent, onMounted, ref, watch } from "vue";
    import * as echarts from "echarts"
    export default defineComponent({
        props:{
            yData:{
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
            },
            title:{
                type:String,
                default:""
            },
            content:{
                type:String,
                default:""
            }
        },
        setup(props){
            const transverseLineChart = ref(null);
            let myChart;
            const setOptions = () =>{
                myChart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line',
                            lineStyle: {
                                color: 'rgba(50, 216, 205, 1)'
                            },
                        },
                        formatter:function(params){
                              var res = `${params[0].name} <br/>`
                                for (const item of params) {
                                if (item.value !== 0) {
                                    res += `<span style="background: ${item.color}; height:10px; width: 10px; border-radius: 50%;display: inline-block;margin-right:10px;"></span> ${item.data.averageProcessing?item.data.averageProcessing:item.value}${props.title==='count'?'个':''}<br/>`
                                }
                                }
                            return res
                        }
                    },
                    grid: {
                        top:'3%',
                        left: '3%',
                        right: '3%',
                        bottom: '2%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
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
                    },
                    yAxis: {
                        type: 'category',
                        data: props.yData,
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
                myChart = echarts.init(transverseLineChart.value);
                setOptions()
            })
            watch(() =>props.series,(val) =>{
                setOptions()
            })
            return{
                transverseLineChart
            }
        }
    })
    </script>
    
    <style lang="less" scoped>
    .transverseLineChart{
        width: 100%;
        height: 100%;
    }
    </style>