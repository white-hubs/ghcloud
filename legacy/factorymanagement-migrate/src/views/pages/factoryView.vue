<template>
  <div class="factroy-home">
    <div class="factroy-home-top">
      <div class="factroy-home-left">
        <div class="factroy-home-left-left" style="padding-right: 10px;">
          <a-image style="width: 100%" :height="300" :src="imgPath"></a-image>
        </div>
      </div>
      <div class="factroy-home-right">
        <div class="factroy-home-right-top">
          <div class="factroy-home-right-top-box">
            <div class="factroy-home-right-top-box-left">
              <a-image :width="40" :height="40" :src="img.home1Png"></a-image>
            </div>

            <div class="factroy-home-right-top-box-right">
              <div>总建筑面积</div>
              <div style="font-size: 32px; font-weight: 500">
                {{ formData?.floorArea || 0 }}
                <span style="font-size: 14px">平方米</span>
              </div>
            </div>
          </div>

          <div style="
                height: 60px;
                width: 1px;
                background-color: #f0f2f5;
                margin-left: 106px;
              "></div>
          <div class="factroy-home-right-top-box" style="margin-left: 120px">
            <div class="factroy-home-right-top-box-left" style="background-color: #e7f9ff">
              <a-image :width="40" :height="40" :src="img.home2Png"></a-image>
            </div>

            <div class="factroy-home-right-top-box-right">
              <div>占地面积</div>
              <div style="font-size: 32px; font-weight: 500">
                {{ formData?.areaCovered || 0 }}
                <span style="font-size: 14px">平方米</span>
              </div>
            </div>
          </div>
        </div>
        <div class="factroy-home-right-buttom">
          <p>
            &nbsp; &nbsp; &nbsp; &nbsp;
            {{ formData?.remark || "暂无简介" }}
          </p>
        </div>
      </div>
    </div>

    <div class="factroy-home-line"></div>

    <div class="factroy-home-bottom">
      <div class="factroy-home-bottom-left">
        <div class="factroy-home-bottom-left-top" style="margin-left: 20px; margin-bottom: 10px">
          <div class="factroy-home-right-top-box">
            <div class="factroy-home-right-top-box-left">
              <a-image :width="40" :height="40" :src="img?.home1Png"></a-image>
            </div>

            <div class="factroy-home-right-top-box-right">
              <div>可租面积</div>
              <div style="font-size: 32px; font-weight: 500">
                {{ formDataEchart?.leaseNum }}
                <span style="font-size: 14px">平方米</span>
              </div>
            </div>
          </div>
        </div>

        <div class="factroy-home-line"></div>

        <div class="factroy-home-bottom-left-bottom">
          <div class="EcharRefNum">出租率:{{ percent ? percent : "0" }}%</div>
          <div id="EcharRef" style="width: 280px; height: 280px"></div>
        </div>
      </div>

      <div class="factroy-home-line-line"></div>
      <div class="factroy-home-bottom-right">
        <div class="factroy-home-bottom-right-top" style="font-size: 16px; font-weight: bold">
          区域出租率
        </div>
        <div class="factroy-home-bottom-right-bottom">
          <div id="EcharLineRef" ref="EcharLineRef" style="width: 100%; height: 330px"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import * as echarts from "echarts";
const FM = '/resource/v1/factorymanagement-migrate'
const home1Png = `${FM}/home1.png`
const home2Png = `${FM}/home2.png`
const home4Png = `${FM}/home4.png`

export default defineComponent({
  name: "",
  setup() {
    const getAssetsFile = (url) => {
      return new URL(`../../assets/${url}`, import.meta.url).href
    }
    const state = reactive({
      imgPath: "",
      percent: 0,
      formData: {},
      formDataEchart: {},
      formDataEchartLine: [],
    });
    const { proxy } = getCurrentInstance();
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(async () => {
      //3.组件挂载到页面之后执行-------onMounted
      initLineEchart();
      initEchart();
      getHomeData();
    });
    const EcharRef = ref();
    const EcharLineRef = ref();
    const initEchart = async () => {
      var chartDom = document.getElementById("EcharRef");
      var myChart = echarts.init(chartDom);
      var option;

      await proxy.$api.getRoomStatistics().then(res => {
        state.formDataEchart = res;
        if (state.formDataEchart.leaseTotal != 0) {
          state.percent = (
            (100 *
              (state.formDataEchart.leaseTotal -
                state.formDataEchart.leaseNum)) /
            state.formDataEchart.leaseTotal
          ).toFixed(2);
        } else {
          state.percent = 0;
        }
      });
      option = {
        tooltip: {
          trigger: "item",
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },

            emphasis: {
              label: {
                show: false,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: (
                  state.formDataEchart.leaseTotal -
                  state.formDataEchart.leaseNum
                ).toFixed(0),
                name: "出租面积",
                itemStyle: {
                  color: "#1890FF",
                },
              },
              {
                value: state.formDataEchart.leaseNum,
                name: "可租面积",
                itemStyle: {
                  color: "#ccc",
                },
              },
            ],
          },
        ],
      };

      myChart.setOption(option);
      window.addEventListener("resize", () => {
        setTimeout(() => {
          myChart.resize();
        }, 500);
      });
    };
    const initLineEchart = async () => {
      var chartDomLine = document.getElementById("EcharLineRef");
      var myChartLine = echarts.init(chartDomLine);
      var optionLine;
      var xdata = [];
      var ydata = [];
      await proxy.$api.getRoomRateList().then(res => {
        state.formDataEchartLine = res;
        res.forEach(item => {
          xdata.push(item.areaName);
          ydata.push(item.num);
        });
      });

      optionLine = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none", //虚线隐藏
          },
          formatter: function (params) {
            //提示内容
            let relVal = "出租率";
            relVal +=
              "<br/>" +
              params[0].marker +
              params[0].name +
              " : " +
              params[0].value.toLocaleString() +
              "%";
            return relVal;
          },
        },
        grid: {
          left: "0%",
          right: "0%",
          bottom: "1%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            axisTick: {
              alignWithLabel: true,
            },
            data: xdata,
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: {
              formatter: function (value) {
                return value + "%";
              },
            },
          },
        ],
        series: [
          {
            name: "出租率",
            areaStyle: {
              color: "#1890FF",
            },
            type: "bar",
            barWidth: "15%",
            itemStyle: {
              color: "#1890FF",
            },
            data: ydata,
          },
        ],
      };

      myChartLine.setOption(optionLine);
      window.addEventListener("resize", () => {
        setTimeout(() => {
          myChartLine.resize();
        }, 500);
      });
    };

    const getHomeData = async () => {
      const tenantCode = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code
      await proxy.$api.getTenantHome(tenantCode).then(res => {
        state.formData = res;
        if (state.formData?.files?.length > 0) {
          state.imgPath = state.formData.files[0].path;
        } else {
          state.imgPath = home4Png
        }
      });
    };

    return {
      ...toRefs(state),
      getAssetsFile,
      initEchart,
      EcharRef,
      initLineEchart,
      getHomeData,
      EcharLineRef,
      img: {
        home1Png,
        home2Png,
      }
    };
  },
});
</script>
<style scoped lang="less">
:deep(.ant-image-img) {
  width: 100%;
  height: 100% !important;
}

.factroy-home {
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  background: #f0f2f5;
}

.factroy-home-line {
  width: 100%;
  height: 20px;
  background-color: #f0f2f5;
}

.factroy-home-line-line {
  width: 20px;
  height: 100%;
  background-color: #f0f2f5;
}

.factroy-home-right-top-box {
  display: flex;
  justify-content: flex-start;

  .factroy-home-right-top-box-left {
    width: 64px;
    height: 64px;
    background-color: #fff7e6;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    margin-right: 20px;
  }
}

.factroy-home {
  .factroy-home-top {
    display: flex;
    justify-content: space-between;
    background: white;

    .factroy-home-right-buttom {
      margin-top: 40px;
      overflow-y: auto;
      width: 100%;
      height: 180px;
      background: #fafafa;
    }

    .factroy-home-left {
      width: 35%;
      height: 360px;
      padding: 20px 0px 20px 20px;
    }

    .factroy-home-right {
      width: 72%;
      height: 360px;
      padding: 20px 20px 20px 0px;

      .factroy-home-right-top {
        margin-top: 10px;
        display: flex;
        justify-content: flex-start;
      }
    }
  }

  .factroy-home-bottom {
    height: 416px;
    display: flex;
    justify-content: space-between;
    background: white;

    .factroy-home-bottom-left-bottom {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      padding-top: 14px;

      .EcharRefNum {
        position: absolute;
        top: 6px;
        font-size: 20px;
        font-weight: bold;
      }
    }

    .factroy-home-bottom-left {
      width: 25%;
      padding: 20px 0px;
    }

    .factroy-home-bottom-right {
      width: 75%;
      padding: 20px;
    }
  }
}
</style>
