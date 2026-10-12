<template>
	<div class="chart" :class="[props?.calss]" ref="chartDom"></div>
</template>

<script lang="ts" setup>
import { defineComponent, onMounted, ref, watch, computed } from "vue";
import { TitleComponentOption } from 'echarts/components'
import * as echarts from "echarts";
type EChartsOption = echarts.EChartsOption;
type PieOption = echarts.ComposeOption<TitleComponentOption>

interface SeriesItf {
	name?: string;
	value?: number;
	color?: string;
}
interface Props {
	gridTop?: string;
	legendFontSize?: number;
	pieData?: SeriesItf[];
	showLegend?: boolean;
	calss?: string;
	unit:string;
}
const props = withDefaults(defineProps<Props>(), {
	gridTop: "10%",
	legendFontSize: 12,
	pieData: () => [],
	showLegend: true,
});

const chartOption = () => {
	let chartData = [];
	props.pieData.forEach((item) => {
		chartData.push(item);
	});
	const option: PieOption = {
		backgroundColor: 'transparent',
		grid: {
			right: 0,
			top: props.gridTop,
			bottom: 20,
		},
		toolbox: {
			show: false,
		},
		tooltip: {
			trigger: 'item',
			formatter: function (params) {
					// params 是一个包含当前点信息的数组
					var res = `${params.data.name }:${params.data.value}${props.unit?props.unit:''}${params.percent}%<br/>`
					return res;
        },
			backgroundColor: '#fff',
			textStyle: {
				color: '#333',
			},
			position: function (pos, params, dom, rect, size) {
				// 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
				var obj = { top: 60 };
				obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
				return obj;
			}
		},
		series: [
			{ // 外层圆
				type: "pie",
				radius: ["20%", "75%"],
				width: "70%",
				hoverAnimation: false,
				roseType: 'radius',
				label: {
					show: false
				},
				data: chartData,
				z: 1,
			},
			{ // 内层圆
				type: "pie",
				radius: ["20%", "70%"],
				width: "70%",
				hoverAnimation: false,
				roseType: 'radius',
				// label: {
				// 	show: false,
				// },
				percentPrecision: 0,
				label: {
					show: true,
					position: 'inner',
					fontWeight: 'bold',
					color: '#fff',
					formatter: function (params) {
						return params.color != 'transparent' ? `${params.percent}%` : '';
					},
					lineHeight: 15,
					rich: {
						white: {
							color: '#fff',
							align: 'center',
							fontSize: 14,
							fontWeight: 'bold',
						}
					}
				},
				itemStyle: {
					normal: {
						// color: 'rgba(255,255,255,.1)'
						color: 'rgba(0,0,0,.1)'
					},
				},
				data: chartData,
				z: 2,
			},
		],
	};
	if (props.showLegend) {
		option.legend = {
			icon: "circle",
			itemWidth: 10,
			itemHeight: 10,
			type: 'scroll',
			orient: 'vertical',
			right: 0,
			top: '20%',
			bottom: 20,
			textStyle: {
				fontSize: props.legendFontSize, //字体大小
				color: "#fff", //字体颜色
			},
			data: props.pieData.filter(item => item.name)
		};
	}
	return option;
}
const chartDom = ref();
let myChart;
const optionRef = ref<EChartsOption>(chartOption());

watch(
	() => [...props.pieData],
	() => {
		myChart.setOption(chartOption());
	}, { deep: true }
);

onMounted(() => {
	myChart = echarts.init(chartDom.value);
	myChart.setOption(optionRef.value);
});
</script>

<style lang="less" scoped>
.chart {
	width: 100%;
	min-height: 180px;
}
</style>
