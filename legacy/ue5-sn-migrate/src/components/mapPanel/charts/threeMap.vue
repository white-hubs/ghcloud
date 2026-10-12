
<template>
  <div class="mapdrilling-inner">
      <div id="chart" class="chart" ref="mapRef"></div>
      <!-- <div class="back_to_china" v-show="inShenzheng">
          <a-icon type="rollback" class="btn">
            <span class="ml2">返回中国地图</span>
          </a-icon>
      </div> -->
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts'
import { onMounted, ref, onUnmounted , nextTick} from 'vue'
import { getAssetsImage } from '@/utils/getImage';
import chinaJson from './geoJson/china.json'
import shenzhengJson from './geoJson/geojson_4403.js';
import bus from "@/utils/bus";
import {
  zongbuChartData,
  shenzhengChartData,
  shenzhengIcon ,
  startBlue,
  startLight,
  geoItemStyleA,
  geoItemStyleB,
  seriesItemStyleA,
  seriesItemStyleB
 } from './geoJson/mock.js'

let myChart: echarts.ECharts | null = null;
const mapRef = ref();
let timer = null
let option = {}
let inShenzheng = ref(false)

const initChart = () => {
  const container = mapRef.value as HTMLElement;
  if (!myChart) myChart = echarts.init(container as HTMLElement);
  addChartEvent()

  // 获取渲染地图的相关数据
  myChart.showLoading()
  const { partData, geoJson } = getGeoAndMapData('china')
  myChart.hideLoading()

  // 注册渲染地图
  renderMap('china', partData, geoJson)
}

// 添加绑定事件
const addChartEvent = () => {
  bindResizeWindow() // 监听屏幕大小改变
  bindGeoRoamChart() // 绑定缩放拖拽事件
  bindClickChart() // 绑定单击事件
  bindMouseOverChart() // 绑定鼠标事件
  bindMouseLeaveChart() // 绑定鼠标事件
  bindContextmenuChart() // 右键返回
}
// 监听屏幕大小改变
const bindResizeWindow = () => {
  window.addEventListener('resize', () => {
    if (timer) return
    timer = setTimeout(() => {
      myChart.resize()
      timer = null
    }, 100)
  })
}
// 绑定缩放拖拽事件
const bindGeoRoamChart = () => {
  myChart.on('georoam', (e) => {
    let option = myChart.getOption(); //获得option对象
    if (e.zoom != null && e.zoom != undefined) {
      //捕捉到缩放时
      option.geo[0].zoom = option.series[0].zoom; //下层geo的缩放等级跟着上层的geo一起改变
      option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
    } else {
      //捕捉到拖曳时
      option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
    }
    myChart.setOption(option);
    bus.emit("threeMapRoam", e);
  });

}
// 绑定单击事件
const bindClickChart = () => {
  myChart.on('click', (e) => {
    if (e.seriesType == 'custom' && e.data?.code == 'hq') {
      inShenzheng.value = true;
      const { partData, geoJson } = getGeoAndMapData('shenzheng')
      renderMap('shenzheng', partData, geoJson)
    } else {
      inShenzheng.value = false;
      bus.emit("threeMapClick", e);
    }
  })
}
// 绑定鼠标事件
const bindMouseOverChart = () => {
  myChart.on('mouseover', (e) => {
    const { name, data } = e
    bus.emit("threeMapMouseover", e);
  })
}
// 绑定鼠标事件
const bindMouseLeaveChart = () => {
  myChart.on('mouseleave',(e)=>{
    bus.emit("threeMapMouseleave", e);
  })
}
// 绑定自定义右击事件
const bindContextmenuChart = () => {
  // 取消右击默认事件
  const container = document.getElementById('chart')
  container.oncontextmenu = e => e.preventDefault()
  // 绑定自定义右击事件
  myChart.on('contextmenu', () => {
    goBack()
  })
}
// 返回中国
const goBack = () => {
  const { partData, geoJson } = getGeoAndMapData('china')
  renderMap('china', partData, geoJson)
}
// 获取渲染地图的相关数据
const getGeoAndMapData = (mapName) => {
  const mapData = new Map([
    ['shenzheng', {geoJson: shenzhengJson, partData: shenzhengChartData }],
    ['china', {geoJson: chinaJson, partData: zongbuChartData }],
  ])
  return mapData.get(mapName)
}
// 绘制地图
const renderMap = (mapName, partData, geoJson):void => {
  // option = null
  option = {
    backgroundColor: 'transparent',
    title: {
      text: mapName,
      textStyle: {
        color: '#b7def9',
        fontSize: 16,
      },
    },
    geo: {
      map: 'china',
      type: 'map',
      // map: mapName, // 同 registerMap 方法的第一个参数一致
      scaleLimit: {
        //滚轮缩放的极限控制
        min: 1,
        max: 5,
      },
      zoom: 1,
      aspectScale: 1,
      layoutCenter: ['50%', '50%'], //地图位置
      layoutSize: '100%',
      roam: 'scale',
      // roam: true,
      zlevel: 1,
      itemStyle: geoItemStyleA,
      regions: [
        {
          name: '南海诸岛',
          itemStyle: {
            areaColor: '#1f2124',
            borderColor: 'rgba(0, 10, 52, 1)',
            normal: {
              opacity: 0,
              label: {
                show: false,
                color: '#1f2124',
              },
            },
          },
          label: {
            show: true,
            color: '#1f2124',
            fontSize: 12,
          },
        },
      ],
    },
    series: [
      // 常规地图
      {
        map: 'china',
        type: 'map',
        // map: mapName, // 同 registerMap 方法的第一个参数一致
        zoom: 1.2, // 当前视角的缩放比例
        zlevel: 1, // 用于 Canvas 分层，不同zlevel值的图形会放置在不同的 Canvas 中
        scaleLimit: {
          min: 0.8,
          max: 2,
        },
        // roam: true, //是否开启平游或缩放
        roam: 'scale',
        layoutCenter: ['50%', '50%'], //地图位置
        layoutSize: '100%',
        label: {
          // 非高亮状态下的文本样式
          normal: {
            show: true,
            position: 'inside', // 文本标签显示的位置
            textStyle: {
              color: '#ffe4e5', // 文本颜色
              fontSize: 12,
            },
            // formatter: '{b}\n{c}', // 文本上显示的值  data:[{name: "地名", value: 数据}],  {b}表示label信息,{c}代表value
          },
          // 高亮状态下的文本样式
          emphasis: {
            textStyle: {
              color: '#fff', // 文本颜色
            },
          },
        },
        itemStyle: seriesItemStyleA,
      },
      // 散点
      {
        type: 'custom',
        coordinateSystem: 'geo',
        renderItem(params, api) {
          return {
            type: 'image',
            style: {
              image: partData.points[params.dataIndex].image || startLight,
              x:
                api.coord([
                partData.points[params.dataIndex].value[0],
                partData.points[params.dataIndex].value[1],
                ])[0] - 11,
              y:
                api.coord([
                partData.points[params.dataIndex].value[0],
                  partData.points[params.dataIndex].value[1],
                ])[1] - 28,
              width: 14,
              height: 20,
              textPosition: [0, 28],
              text: partData.points[params.dataIndex].name,
              textFill: '#fff',
            },
          };
        },
        data: partData.points,
        zlevel: 20,
      },
      //飞线
      {
        type: 'lines',
        zlevel: 15,
        effect: {
          show: true,
          period: 5, //箭头指向速度，值越小速度越快
          trailLength: 0.2, //特效尾迹长度[0,1]值越大，尾迹越长重
          symbol: 'arrow', //箭头图标 none arrow
          symbolSize: 5, //图标大小
        },
        lineStyle: {
          normal: {
            color: '#EDBA55',
            width: 1, //线条宽度
            opacity: 0.2, //尾迹线条透明度
            curveness: 0.3, //尾迹线条曲直度
          },
        },
        data: partData.lines,
      }
    ],
      animation: true,
      animationDuration: 1000,
      animationDurationUpdate: 600,
      animationEasingUpdate: 'cubicInOut',
  }
  if (mapName === 'shenzheng') {
    let shenzhengOptions = {
      geo: {
        map: 'shenzheng',
        center: null,
      },
      series: [
        {
          map: 'shenzheng',
          center: null,
        },
        // 散点
        {
          type: 'custom',
          coordinateSystem: 'geo',
          renderItem(params, api) {
            return {
              type: 'image',
              style: {
                image: partData.points[params.dataIndex].image || startLight,
                x:
                  api.coord([
                  partData.points[params.dataIndex].value[0],
                  partData.points[params.dataIndex].value[1],
                  ])[0] - 11,
                y:
                  api.coord([
                  partData.points[params.dataIndex].value[0],
                    partData.points[params.dataIndex].value[1],
                  ])[1] - 28,
                width: 14,
                height: 20,
                textPosition: [0, 28],
                text: partData.points[params.dataIndex].name,
                textFill: '#fff',
              },
            };
          },
          data: partData.points,
        },
        //飞线
        {
          type: 'lines',
          zlevel: 15,
          effect: {
            show: true,
            period: 5, //箭头指向速度，值越小速度越快
            trailLength: 0.2, //特效尾迹长度[0,1]值越大，尾迹越长重
            symbol: 'arrow', //箭头图标 none arrow
            symbolSize: 5, //图标大小
          },
          lineStyle: {
            normal: {
              color: '#EDBA55',
              width: 1, //线条宽度
              opacity: 0.2, //尾迹线条透明度
              curveness: 0.3, //尾迹线条曲直度
            },
          },
          data: partData.lines,
        }
      ],
    }
    echarts.registerMap('shenzheng', geoJson);
    myChart.setOption(shenzhengOptions)
  } else {
    echarts.registerMap(mapName, geoJson);
    myChart.setOption(option)
  }
}
// 自动放大到深圳
const autoScaleSZ = () => {
  myChart.setOption({
    geo: { zoom: 5, center: [113, 23] },
    series: [{ zoom: 5, center: [113, 23] }],
    // animationDuration: 4000,
  });
  setTimeout(() => {
    myChart.dispatchAction({
      type: 'click',
      target: null,
    }); // 刷新画布
  }, 100);
}


onMounted(() => {
  nextTick(() => {
    initChart()
  });
});
onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped>
.mapdrilling-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  /* background: url("/resource/v1/ue5-sn-migrate/assets/images/map-bg.png") no-repeat;
  background-size: 100% 100%; */
  .chart {
    width: 100%;
    height: 100%;
  }
}
.back_to_china {
  position: absolute;
  display: inline-block;
  top: 200px;
  left: 420px;
  .btn{
    color: #fff;
    padding: 4px 12px;
    border: 1px solid #fff;
    border-radius: 2px;
    cursor: pointer;
    font-size: 24px;
    &:hover {
      box-shadow: 0 0 4px 0 #fff;
      text-shadow: 0 0 4px #fff;
    }
  }
}
.shenzheng_nam {
  color: #fff;
  font-weight: 600;
  font-size: 24px;
  margin-left: 24px;
  display: inline-block;
}

</style>