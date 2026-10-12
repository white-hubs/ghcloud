import * as echarts from 'echarts/core';
import {
	TooltipComponent,
	TooltipComponentOption,
	GridComponent,
	GridComponentOption,
	LegendComponent,
	LegendComponentOption,
	MarkLineComponent,
} from 'echarts/components';
import { BarChart, BarSeriesOption	,PictorialBarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { PictorialBarSeriesOption } from 'echarts';
import charts from "@/components/mapPanel/charts/index.vue";

echarts.use([
	TooltipComponent,
	GridComponent,
	LegendComponent,
	MarkLineComponent,
	BarChart,
	CanvasRenderer,
	PictorialBarChart
]);

type EChartsOption = echarts.ComposeOption<
	| TooltipComponentOption
	| GridComponentOption
	| LegendComponentOption
	| BarSeriesOption & { itemStyle: { normal: { color: string } } }
	| PictorialBarSeriesOption
>;

function getOption(xData: string[], yData: { name: string, value: number[], color: string }[],sn:boolean): EChartsOption {
	const option: EChartsOption = {

		legend: {
			itemWidth: 10,
			itemHeight: 10,
			padding: [10, 0, 0, 0],
			data: yData.map(e => {
				return {
					name: e.name,
					textStyle: {
						color: '#A5B6DA',
						fontSize: 12
					}
				}
			})
		},
		grid: {
			left: '0%',
			right: '10px',
			bottom: '0',
			top: '15%',
			containLabel: true
		},
		xAxis: {
			type: "category",
			splitLine: {
				show: false, //隐藏
			},
			
			axisLabel: {
				showMaxLabel: true,
				show: true,
				color: "#ffffff",
				fontSize: 12,
				fontWeight: 300,
				// rotate:20
			},
			data: xData
		},
		yAxis: {
			type: 'value',
			splitLine: {
				lineStyle: {
					type: "dashed", //虚线
					color: ["rgba(255,255,255,0.15)"],
					width: 1,
				},
				show: true, //隐藏
			},
			axisLabel: {
				showMaxLabel: true,
				show: true,
				color: "#ffffff",
				fontSize: 12,
				fontWeight: 300,
			},
		},
		series: caclSeries(xData, yData,sn)
	};
	if (sn) {
		option.tooltip= {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			backgroundColor: 'rgba(3, 11, 27, 0.70)', 
			borderColor: 'rgba(3, 11, 27, 0.70)', 
			textStyle: {  
					color: 'white',  
			},
		}
	}
	return option
}

const caclSeries = (xData: string[], yData: { name: string, value: number[], color: string }[],sn:boolean) => {
	const res = []
	yData.forEach(e => {
		res.push({
			name: e.name,
			type: 'bar',
		
			emphasis: {
				focus: 'series'
			},
			itemStyle: {
				normal: { color: e.color }
			},
			barWidth:sn ?10:15,
			data: e.value,
			z: -2,
		})
	})

	// 阴影
	let dottedData = xData.map(() => 0)
	for (let index = 0; index < yData.length; index++) {
		const element = yData[index];
		for (let i = 0; i < element.value.length; i++) {
			dottedData[i] += element.value[i];
		}
	}
	dottedData=dottedData.map(e=>{
		e-=1
		return e
	})
  if(!sn){
			res.push({
		name: 'dotted',
		type: 'pictorialBar',
		symbol: 'rect',
		itemStyle: {
			color: 'rgba(0,0,0,0.5)'
		},
		symbolRepeat: true,
		symbolSize: [15, 1.5],
		symbolMargin: 1,
		z: -1,
		data: dottedData
	})
	}
	return res
}

export function render(dom: HTMLElement, xData: string[], yData: { name: string, value: number[], color: string }[],sn:boolean) {
	const option = getOption(xData, yData,sn);
	const chart = echarts.init(dom);
	chart.clear()
	chart.resize()
	chart.setOption(option);
	return chart
}