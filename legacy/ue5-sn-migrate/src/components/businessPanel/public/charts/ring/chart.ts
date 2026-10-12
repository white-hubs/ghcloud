import { calcFontSize } from '@/utils/common'
import * as echarts from "echarts"
import {TitleComponentOption} from 'echarts/components'
type PieOption = echarts.ComposeOption<TitleComponentOption>
export interface PieData{
    name:string,
    value:number,
    color:string
}
function getOption(pieData:PieData[],seriesName:string = '图表统计', total:string | number = '', unit:string = ''):PieOption{
    let seriesData = [];
    pieData.forEach(item =>{
        seriesData.push(item);
        // seriesData.push({
        //     name: "",
        //     value: 15,
        //     tooltip: { show: false },
        //     itemStyle: {
        //        label: {
        //           show: false,
        //        },
        //        labelLine: {
        //           show: false,
        //        },
        //        color: "rgba(0, 0, 0, 0)",
        //        borderColor: "rgba(0, 0, 0, 0)",
        //        borderWidth: 0,
        //     },
        // });
    })
    const option = {
        color: ["#96B5FC", "#5F8CEF", "#F18A70", "#F4C594", "#E0E7FA"],
        backgroundColor: "transparent",
        title: {
            text: `{a|${total}}{b| ${unit}}\n{c|设备总数}`,
            textStyle: {
                rich: {
                    a: {
                        color: "#FFFFFF",
                        fontSize: calcFontSize(16),
                    },
                    b: {
                        fontSize: calcFontSize(16),
                        color: "#FFFFFF",
                    },
                    c:{
                        fontSize:calcFontSize(12),
                        color:'#D9E7FF'
                    }
                },
            },
            x: "center",
            y: "center",
        },
        tooltip: {
            trigger: "item",
        },
        legend: {
            show:false,
            icon: "circle",
            orient: "horizontal",
            right: "10%",
            top: "30%",
            width: "0",
            textStyle: {
                color: "#E6F7FF",
            },
            data: pieData.map(r => r.name),
        },
        series: [
            {
                name: seriesName,
                type: "pie",
                radius: ["50%", "60%"],
                center: ["50%", "50%"],
                avoidLabelOverlap: false,
                label: {
                    position: "outside",
                    color: "#E6F7FF",
                    lineHeight: 18,
                    formatter: params => {
                        const { data } = params;
                        return data.name ? `${data.name}\n${data.value}${unit}` : "";
                    },
                },
                itemStyle: {
                    color:params =>{
                        if(params.data?.color){
                            return params.data.color
                        }
                    }
                },
                emphasis: {
                    scaleSize: calcFontSize(10),
                },
                data: seriesData,
            },
            {
                name: "阴影圈",
                type: "pie",
                radius: ["0", "40%"],
                center: ["50%", "50%"],
                emphasis: {
                    scale: false,
                },
                tooltip: {
                    show: false,
                },
                itemStyle: {
                    color: "rgba(204,225,255, 0.05)",
                },
                zlevel: 4,
                labelLine: {
                    show: false,
                },
                data: [100],
            },
            {
                name: "阴影圈",
                type: "pie",
                radius: ["0", "30%"],
                center: ["50%", "50%"],
                emphasis: {
                    scale: false,
                },
                tooltip: {
                    show: false,
                },
                itemStyle: {
                    color: "rgba(204,225,255, 0.07)",
                },
                zlevel: 4,
                labelLine: {
                    show: false,
                },
                data: [100],
            },
        ],
    }
    return option
}
export function render(dom:HTMLElement,pieData:PieData[],seriesName?:string, total?:string | number,unit?:string) {
    const option = getOption(pieData,seriesName,total,unit);
    const chart = echarts.init(dom);
    chart.setOption(option);
}