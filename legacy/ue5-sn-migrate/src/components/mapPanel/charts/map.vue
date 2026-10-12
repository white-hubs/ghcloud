<template>
    <div class="mapdrilling-inner">
        <div id="chart" class="chart" ref="mapRef"></div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from 'echarts'
import chinaJson from './geoJson/china.json'

const mapRef = ref();
let myChart: echarts.ECharts | null = null;
 // todo: 1
let iconRQ ='image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABd0lEQVQ4T+XTMU9TURjG8f9zb5EmJqL3ttA2JCTE4MDkQhgkcTbhwCIDJjgwAe4d+BrufgEXqGEhfAFgZXTT0tsGlBCjhN7zkmoYaC5QtEye9ZzzO+/zJEf0eanPHlfAo83hj4jRwHzVFIxivDYxjhEi6jLbTRVui/NGznJn52E6ELaDoseeF+Za7zvDdYMnwCPBmsFbYCojwTHYZ9B3xEOMp0A+ds2hLPArUJFYMeMN8KLHSpLYNUs3g55FxMz/AhqrJhbv0GEjds3y9R3+AZeA6d461LfYJdG1oMneybQATCBaZrQFj4HOFPmMR45i1yxkgYdACbNlBXoAnKbe74ca+GmWPiNgBs9LC6jIM4hoIxKZ7USutZ4FNoARodnIJZ+y4p5ulYq/UiblfaSQHwTtg/jV8ZfLs90/5feEN4G3dXrPYG24jlHu44QjnY//xNB8wSUbt8XL2u+OnABFSXPRbFLrB/hBsjFvYbXgGnv/DP4N0H3nAkwcrhU++LmyAAAAAElFTkSuQmCC';
let iconRQ1 = "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNCRkRBMEJBQzgwRjExRUFBNUI0RTMyMThEN0UxMzFEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjNCRkRBMEJCQzgwRjExRUFBNUI0RTMyMThEN0UxMzFEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6M0JGREEwQjhDODBGMTFFQUE1QjRFMzIxOEQ3RTEzMUQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6M0JGREEwQjlDODBGMTFFQUE1QjRFMzIxOEQ3RTEzMUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5mT42iAAABQ0lEQVR42mL8LabOQCQIBOL1xChkItJAkLp+IBajpqFWQCwPxJ7UNDQCSgdQy1BmIA6Bsl2AmJMahjoAsTiUzQPETtQwNAKN709IAwvUayZQ/hcg/o0k/x6Ig9D0+ABxKJT9HYh/oMm/BBm6GYitgTgfiBmJcLkkEK/CIXcGiGNB3v8JxIVQF31gIA/8AeIWaNK7gRymG4BYH4hPkGjgXSC2A+JaWNChR9QjqIJeIP5PhIGzgdgAiI8Tin2QbSVAvIOAgROBOA0auUQlKV4gtidgqBGp6RSUFrmIKA/ESDEUPcGfBOIUIH6Lln29iTVUCIjdkJJKExDbAPFcqJdPEMpd2AwF5TBWaFKxBeJ6qOHIqaMbmjrcsBUw2AwNh7rKAEeaBaWOMiD2BeJvQOxOyFBuaFJJwZZU0MBWaHCIo0sABBgAetA4Jx5t/ToAAAAASUVORK5CYII="
let data = [{
        name: "北京",
        value: [116.24, 39.55, 100]
    },
    {
        name: "深圳",
        value: [114.271522, 22.753644]
    },
   
    {
        name: "重庆",
        value: [106.54, 29.59]
    },
    {
        name: "浙江",
        value: [120.19, 30.26]
    },

]
let LableData = [
    {
    name: "北京",
    coords: [
        [116.24, 39.55, 100],
        [120.24, 46.55, 100]
    ], // 线条位置[开始位置，结束位置]
    value: [10.21, 1.20]
}, 
{
    name: "深圳",
    coords: [
        [114.271522, 22.753644],
        [118.24, 18.55, 100]
    ], // 线条位置[开始位置，结束位置]
    value: [10.21, 1.20]
}, 
{
    name: "重庆",
    coords: [
        [106.54, 29.59],
        [100.24, 40.55]
    ], // 线条位置[开始位置，结束位置]
    value: [10.21, 1.20]
}, 
{
    name: "浙江",
    coords: [
        [120.19, 30.26],
        [128.24, 35.55, 100]
    ], // 线条位置[开始位置，结束位置]
    value: [10.21, 1.20]
}, 
];
// #151D31  黑   rgb(21 29 49)
// #212A3E  灰   rgb(33 42 62)
// #3F73CD  蓝   rgb(63 115 205)

var devCoordMap = {
    上海: [121.4648, 31.2891],
    广东: [113.8953, 22.901],
    山西: [111.4783, 36.1615],
    新疆: [85.9236, 40.5883],
    河北: [115.0488, 39.0948],
    甘肃: [103.5901, 36.3043],
    内蒙古: [110.3467, 41.4899],
    北京: [116.4551, 40.2539],
    北海: [109.314, 21.6211],
    江苏: [119.6062, 32.9208],
    广西: [108.479, 23.1152],
    江西: [116.0046, 28.6633],
    福建: [118.1689, 24.6478],
    合肥: [117.29, 32.0581],
    陕西: [108.4131, 34.8706],
    黑龙江: [127.9688, 47.368],
    辽宁: [123.452841, 41.702663],
    天津: [117.4219, 39.4189],
    安徽: [117.0123, 32.2121],
    四川: [103.9526, 30.7617],
    西藏: [91.1865, 30.1465],
    云南: [102.9199, 25.4663],
    浙江: [120.5313, 29.1773],
    湖南: [111.5327, 27.0319],
    湖北: [112.3896, 30.6628],
    山东: [117.1582, 36.8701],
    海南: [110.3893, 19.8516],
    青海: [96.8038, 36.2207],
    贵州: [106.6992, 26.7682],
    河南: [113.4668, 34.1234],
    重庆: [107.7539, 30.1904],
    '重庆市,两江新区': [107.7539, 30.1904],
    宁夏: [106.3586, 36.8775],
    吉林: [125.8154, 43.6584],
    香港: [115.1215, 22.1235],
    澳门: [112.1211, 22.2111],
    台北: [120.1111, 23.2435],
    杭州市: [120.153576, 30.287459],
    湖州市: [120.102398, 30.867198],
    舟山市: [122.106863, 30.016028],
    宁波市: [121.549792, 29.868388],
    绍兴市: [120.582112, 29.997117],
    台州市: [121.428599, 28.661378],
    温州市: [120.672111, 28.000575],
    金华市: [119.649506, 29.089524],
    丽水市: [119.921786, 28.451993],
    嘉兴市: [120.750865, 30.762653],
    衢州市: [118.87263, 28.941708],
}

var heatmapData = [{
        name: '广东',
        value: 1231504,
    },
    {
        name: '广西',
        value: 244021,
    },
    {
        name: '江苏',
        value: 1195364,
    },
    {
        name: '重庆',
        value: 95391,
    },
    {
        name: '河南',
        value: 965647,
    },
    {
        name: '江西',
        value: 70156,
    },
    {
        name: '四川',
        value: 450312,
    },
    {
        name: '上海',
        value: 216872,
    },
    {
        name: '福建',
        value: 178888,
    },
    {
        name: '山东',
        value: 254030,
    },
    {
        name: '陕西',
        value: 38428,
    },
    {
        name: '甘肃',
        value: 15553,
    },
    {
        name: '河北',
        value: 17326,
    },
    {
        name: '北京',
        value: 70792,
    },
    {
        name: '贵州',
        value: 25085,
    },
    {
        name: '湖北',
        value: 176955,
    },
    {
        name: '湖南',
        value: 651054,
    },
    {
        name: '安徽',
        value: 64842,
    },
    {
        name: '海南',
        value: 1273,
    },
    {
        name: '黑龙江',
        value: 6544,
    },
    {
        name: '吉林',
        value: 19254,
    },
    {
        name: '辽宁',
        value: 21955,
    },
    {
        name: '内蒙古',
        value: 18729,
    },
    {
        name: '宁夏',
        value: 226,
    },
    {
        name: '青海',
        value: 631,
    },
    {
        name: '山西',
        value: 15421,
    },
    {
        name: '天津',
        value: 38650,
    },
    {
        name: '西藏',
        value: 8,
    },
    {
        name: '新疆',
        value: 5,
    },
    {
        name: '云南',
        value: 91198,
    },
    {
        name: '浙江',
        value: 432749,
    },
]

const convertData = (data) => {
    var res = []
    for (var i = 0; i < data.length; i++) {
        var dataItem = data[i]
        var fromCoord = devCoordMap[dataItem.source]
        var toCoord = devCoordMap[dataItem.target]
        if (fromCoord && toCoord) {
            res.push({
                fromName: dataItem.source,
                toName: dataItem.target,
                coords: [fromCoord, toCoord],
                value: dataItem.num,
            })
        }
    }
    return res
}
var lineData = [{
        target: '广东',
        source: '广东',
        num: 226940,
    },
    {
        target: '广东',
        source: '宁夏',
        num: 109039,
    },
    {
        target: '广东',
        source: '河南',
        num: 88608,
    },
    {
        target: '广东',
        source: '江苏',
        num: 61944,
    },
    {
        target: '广东',
        source: '上海',
        num: 44233,
    },
]


let option: any= {
    backgroundColor: 'transparent',
    geo: {
        map: 'china',
        aspectScale: 0.85,
        layoutCenter: ["50%", "50%"], //地图位置
        layoutSize: '125%',
        // roam: true,
        // center: [104.29, 35.8], //设置可见中心坐标，以此坐标来放大和缩小
        itemStyle: {
            normal: {
                areaColor: 'rgba(23,30,59,0.8)',
                borderWidth: 1.6, //设置外层边框 0.8
                borderColor: '#223055',
            },
            emphasis: {
                areaColor: 'rgba(23,30,59,0.8)',
                // areaColor: '#212A3E',
                borderWidth: 1.6, //设置外层边框 0.8
                borderColor: '#223055',
            }
        },
        emphasis: {
            label: {
                show: false,
            }
        },
        regions: [{
            name: '南海诸岛',
            itemStyle: {
                areaColor: 'rgba(0, 10, 52, 1)',
                borderColor: 'rgba(0, 10, 52, 1)',
                normal: {
                    opacity: 0,
                    label: {
                        show: false,
                        color: "#009cc9",
                    }
                },


            },
            label: {
                show: false,
                color: '#FFFFFF',
                fontSize: 12,
            },


        }],

    },
    series: [
        // 常规地图
        {
            type: 'map',
            mapType: 'china',
            aspectScale: 0.85,
            layoutCenter: ["50%", "50%"], //地图位置
            layoutSize: '100%',
            zoom: 1, //当前视角的缩放比例 1.5
            // roam: true, //是否开启平游或缩放
            scaleLimit: { //滚轮缩放的极限控制
                min: 1,
                max: 2 //  5
            },
            itemStyle: {
                normal: {
                    areaColor: 'rgba(20,30,64,0)',
                    borderWidth: 1.6, //设置外层边框
                    borderColor: 'rgba(28,199,242,0.5)',
                    // shadowBlur: 5,
                    // shadowColor: '#4682B4',
                    // shadowOffsetY: 6,
                },
                emphasis: {
                    areaColor: 'rgba(20,30,64,0)',
                    borderWidth: 1.6, //设置外层边框
                    borderColor: 'rgba(28,199,242,0.5)',
                    // shadowBlur: 5,
                    // shadowColor: '#4682B4',
                    // shadowOffsetY: 6,
                }
            },
        },
        // { //首都星图标
        //     name: '首都',
        //     type: 'scatter',
        //     coordinateSystem: 'geo',
        //     data: [{
        //         name: '首都',
        //         value: [116.24, 41.55, 100],

        //     }, ],
        //     symbol: iconRQ,
        //     symbolSize: 20,
        //     label: {
        //         normal: {
        //             show: false,

        //         },
        //         emphasis: {
        //             show: false
        //         }
        //     },

        // },
        // 区域散点图
        // {
        //     type: 'effectScatter',
        //     coordinateSystem: 'geo',
        //     zlevel: 2,
        //     symbolSize: 10,
        //     rippleEffect: { //坐标点动画
        //         period: 3,
        //         scale: 5,
        //         brushType: 'fill'
        //     },
        //     label: {
        //         normal: {
        //             show: true,
        //             position: 'right',
        //             formatter: '{b}',
        //             color: '#b3e2f2',
        //             fontWeight: "bold",
        //             fontSize: 18
        //         }
        //     },

        //     data: data,
        //     itemStyle: { //坐标点颜色
        //         normal: {
        //             show: true,
        //             color: '#B0D3FF',
        //             shadowBlur: 2,
        //             shadowColor: '#fff'
        //         },
        //         emphasis: {
        //             areaColor: '#f00'
        //         }
        //     },

        // },

        // 线 和 点
        // {
        //     type: 'lines',
        //     zlevel: 2, //设置这个才会有轨迹线的小尾巴
        //     symbol: ['circle', 'none'],
        //     polyline:true,
        //     effect: {
        //         show: true,
        //         period: 4,
        //         trailLength: 0.02,
        //         color: '#FFC700', //流动点颜色
        //         symbol: 'arrow',
        //         symbolSize: 5
        //     },
        //     lineStyle: {
        //         normal: {
        //             color: '#FFC700', //线条颜色
        //             width: 2,
        //             opacity: 0.6,
        //             curveness: 0.2,
        //         }
        //     },
        //     data: [{

        //             fromName: "深圳",
        //             toName: "北京",
        //             coords: [
        //                 [114.271522, 22.753644],
        //                 [116.24, 39.55],
        //                 [114.271522, 22.753644],
                       

        //             ]
        //         },
        //         {

        //             fromName: "深圳",
        //             toName: "浙江",
        //             coords: [
        //                 [114.271522, 22.753644],
        //                 [120.19, 30.26],
        //                 [114.271522, 22.753644],

        //             ]
        //         },
        //         {
        //             fromName: "深圳",
        //             toName: "重庆",
        //             coords: [
        //                 [114.271522, 22.753644],
        //                 [106.54, 29.59],
        //                 [114.271522, 22.753644],

        //             ]
        //         }
        //     ],
        // },
        // 线条
        // 画线
        {
            type: 'lines',
            symbol: ['circle', 'none'],
            zlevel: 2,
            effect: {
                show: true,
                period: 4,
                trailLength: 0.02,
                symbol: 'arrow',
                symbolSize: 5,
            },
            lineStyle: {
                normal: {
                    color: '#FFC700',
                    width: 2,
                    opacity: 0.6,
                    curveness: 0.2,
                },
            },
            data: convertData(lineData),
        },
       
        // 提示弹窗
        // {
        //     type: 'lines',
        //     zlevel: 3,
        //     symbol: 'circle',
        //     symbolSize: [5, 5],
        //     color: '#ff8003',
        //     opacity: 1,
        //     label: {
        //         show: true,
        //         padding: [10, 20],
        //         color: '#fff',
        //         backgroundColor: "#1a3961",
        //         borderColor: '#aee9fb',
        //         borderWidth: 1,
        //         borderRadius: 6,
        //         formatter(params) {
        //             let arr = [params.name, "上行：" + params.value[1] + "G/s", "下行：" + params.value[0] + "G/s"];
        //             return arr.join("\n")
        //         },
        //         textStyle: {
        //             align: 'left',
        //             lineHeight: 20,
        //         }
        //         /* normal: {

        //              textStyle: {
        //                  color: '#fff',
        //                  fontSize: 9,
        //              },
        //              formatter (value){
        //                  return value.data.value[2]
        //              },

        //          }*/
        //     },
        //     lineStyle: {
        //         type: 'solid',
        //         color: '#fff',
        //         width: 0.5,
        //         opacity: 1,
        //     },
        //     data: LableData,
        // },
    ]
 }


const initChart = (container?: HTMLElement) => {
  if (!myChart) myChart = echarts.init(container as HTMLElement);
  echarts.registerMap('china', chinaJson as any) //注册可用的地图
  myChart.setOption(option);
};
onMounted(() => {
  nextTick(() => {
    const container = mapRef.value as HTMLElement;
    if (container) initChart(container);
  });
});
</script>
<style scoped>
.map {
  width: 100%;
  height: 100%;
  transform: rotate3d(1, 0, 0, 35deg);
}
.mapdrilling-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: url("/resource/v1/ue5-sn-migrate/assets/images/map-bg.png") no-repeat;
  background-size: 100% 100%;
  .chart {
    width: 100%;
    height: 100%;
    /* transform: rotate3d(1, 0, 0, 35deg); */
  }
}
</style>
