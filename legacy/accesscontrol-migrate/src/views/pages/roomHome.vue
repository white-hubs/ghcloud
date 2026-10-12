<template>
  <div class="room-home">
    <gVerticalLine style="height: 40px; margin-left: 10px" title="门禁概览"></gVerticalLine>
    <div class="room-home-line"></div>
    <div class="room-home-top">
      <div class="room-home-top-left">
        <div class="room-home-top-left-box">
          <div class="room-home-top-left-img">
            <a-image :width="40" :height="40" :src="img.roomPng"></a-image>
          </div>
          <div>今日通行记录</div>
          <div style="font-size: 32px; font-weight: bold">
            {{ sumCount }}
            <span style="font-size: 14px">次</span>
          </div>
        </div>
      </div>
      <div class="room-home-line-line"></div>

      <div class="room-home-top-right">
        <div class="room-home-top-right-top">
          <div class="room-home-top-right-top-left basic-title">通行人数统计</div>
          <div class="room-home-top-right-top-left">
            <a-radio-group button-style="solid" v-model:value="tabPosition" @change="changeType" style="margin: 8px">
              <a-radio-button value="timeDay">日</a-radio-button>
              <a-radio-button value="timeMonth">月</a-radio-button>
              <a-radio-button value="timeYear">年</a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <div class="room-home-top-right-echart">
          <div id="EcharRef" style="width: 100%; height: 200px"></div>
        </div>
      </div>
    </div>
    <div class="room-home-line"></div>

    <div class="room-home-bottom">
      <div class="room-home-bottom-left">
        <div class="room-home-top-right-top">
          <div class="room-home-top-right-top-left basic-title">门禁使用排名Top10</div>
          <div class="room-home-top-right-top-left"></div>
        </div>

        <div style="padding: 0px 16px">
          <AliasTable
            tableCode="ACCESS_CONTROL_RANK"
            applicationCode="DOORMANAGE"
            ref="tableRef"
            :columns="columns1"
            :data-source="tableData1"
            :pagination="false"
            :scroll="{ y: 340 }"
          >
          </AliasTable>
        </div>
      </div>
      <div class="room-home-line-line"></div>

      <div class="room-home-bottom-right table-card">
        <div class="room-home-top-right-top">
          <div class="room-home-top-right-top-left basic-title">门禁记录</div>
          <div class="room-home-top-right-top-left"></div>
        </div>

        <div style="padding: 0px 16px" class="table-container">
          <AliasTable
            tableCode="ACCESS_CONTROL_RECORD"
            applicationCode="DOORMANAGE"
            ref="tableRef"
            :columns="columns2"
            :data-source="tableData2"
            :scroll="{ y: 340 }"
            :pagination="{
              total: tableData2.length,
            }"
          ></AliasTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import * as echarts from "echarts";
import { defineComponent, reactive, toRefs, onBeforeMount, onMounted, getCurrentInstance, ref, h } from "vue";
const roomPng = "/resource/v1/accesscontrol-migrate/room.png";
import { AliasTable } from "@ghcloud/generic-component";

export default defineComponent({
  name: "",
  components: { AliasTable },
  setup() {
    const state = reactive({
      echartsType: "timeMonth",
      sumCount: 0,
      formData: {},
      tableData: [],
    });
    const columns1 = ref([
      {
        title: "排名",
        dataIndex: "pm",
        align: "center",
        customRender: ({ index }) => {
          const classObj = {
            0: "table-item1",
            1: "table-item2",
            2: "table-item3",
          };
          return [h("div", { class: classObj[index] || "table-item4" }, { default: () => index + 1 })];
        },
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
        align: "center",
        slots: { customRender: "doorName" },
      },
      {
        title: "使用次数",
        dataIndex: "num",
        align: "center",
        slots: { customRender: "num" },
      },
    ]);
    const columns2 = ref([
      {
        title: "时间",
        dataIndex: "eventTime",
        key: "eventTime",
        slots: { customRender: "eventTime" },
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
        key: "doorName",
        slots: { customRender: "doorName" },
      },

      {
        title: "事件名称",
        dataIndex: "eventName",
        key: "eventName",
        slots: { customRender: "eventName" },
      },
    ]);
    const tableData1 = ref([
      {
        key: "1",
        name: "2号门门禁名称",
        pm: 1,
        count: 10,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
      },
      {
        key: "3",
        name: "22号门门禁名称",
        pm: 3,
        count: 30,
      },
      {
        key: "4",
        name: "22号门门禁名称",
        pm: 3,
        count: 30,
      },
    ]);
    const tableData2 = ref([
      {
        key: "1",
        name: "2号门门禁名称",
        pm: 1,
        count: 10,
      },
      {
        key: "2",
        name: "12号门门禁名称",
        pm: 2,
        count: 20,
      },
      {
        key: "3",
        name: "22号门门禁名称",
        pm: 3,
        count: 30,
      },
      {
        key: "4",
        name: "22号门门禁名称",
        pm: 3,
        count: 30,
      },
    ]);
    const { proxy } = getCurrentInstance();
    const tabPosition = ref("timeDay");
    const myChart = ref(null);
    const changeType = async (e) => {
      state.echartsType = e.target.value;
      await initEchart(e.target.value);
      await myChart.value.resize();
    };
    const initEchart = async (echartsType) => {
      echarts.init(document.getElementById("EcharRef")).dispose();
      var chartDom = document.getElementById("EcharRef");
      let myChart = echarts.init(chartDom);
      var option;
      var xdata = [];
      var ydata = [];
      await proxy.$api.getDoorTend({}, echartsType).then((res) => {
        if (res) {
          res.forEach((item) => {
            xdata.push(item.timeValue);
            ydata.push(item.num);
          });
        }
      });
      option = {
        tooltip: {
          trigger: "axis",
          show: true,
          axisPointer: {
            type: "none", //虚线隐藏
          },
          formatter: function (params) {
            //提示内容
            let dw = "时";
            if (tabPosition.value == "timeDay") {
              dw = "时";
            }
            if (tabPosition.value == "timeMonth") {
              dw = "日";
            }
            if (tabPosition.value == "timeYear") {
              dw = "月";
            }
            let relVal = "人数";

            relVal += "<br/>" + params[0].marker + params[0].name + `${dw}:` + params[0].value.toLocaleString() + "人";
            return relVal;
          },
        },
        legend: {
          data: [],
        },
        toolbox: {
          feature: {},
        },
        grid: {
          left: "1%",
          right: "1%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            // boundaryGap: false,
            data: xdata,

            axisTick: { show: false },
            axisLabel: {
              interval: 0,
              rotate: 40,
              formatter: function (value) {
                let dw = "时";
                let cur;
                if (tabPosition.value == "timeDay") {
                  dw = "时";
                  cur = value + dw;
                } else {
                  cur = value;
                }

                return cur;
              },
            },
          },
        ],

        yAxis: [
          {
            type: "value",
            minInterval: 1,
            axisLabel: {
              formatter: function (value) {
                return value + "人";
              },
            },
          },
        ],
        series: [
          {
            name: "人数",
            type: "line",
            smooth: true,
            lineStyle: {
              color: "#FA8C16",
            },
            color: "#FA8C16",

            data: ydata,
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
    const getHomeData = async () => {
      await proxy.$api.passedTodayNum().then((res) => {
        state.sumCount = Number(res) || 0;
      });
    };
    const getHomeTableData = async () => {
      await proxy.$api.getDoorRanking().then((res) => {
        tableData1.value = res;
      });
      await proxy.$api.getDoorEvents().then((res) => {
        tableData2.value = res;
      });
    };

    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
      initEchart("timeDay");
      getHomeData();
      getHomeTableData();
    });
    return {
      ...toRefs(state),
      tabPosition,
      initEchart,
      columns1,
      columns2,
      tableData1,
      tableData2,
      getHomeData,
      changeType,
      getHomeTableData,
      myChart,
      img: {
        roomPng,
      },
    };
  },
});
</script>
<style scoped lang="less">
:deep(.ant-table-row) {
  height: 40px !important;
}

:deep(.ant-table-column-title) {
  font-weight: bold !important;
}

.room-home-top-right-echart {
  padding: 0px 0px;
}

:deep(.table-item1) {
  width: 48px;
  height: 25px;
  color: #fff;
  margin: auto;
  background-color: #ff4d4f;
  border: 1px solid #fff;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.table-item2) {
  width: 48px;
  height: 25px;
  color: #fff;
  margin: auto;
  background-color: #f98952;
  border: 1px solid #fff;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.table-item3) {
  width: 48px;
  height: 25px;
  color: #fff;
  background-color: #ffb400;
  border: 1px solid #fff;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  margin: auto;
  align-items: center;
}

:deep(.table-item4) {
  width: 48px;
  height: 25px;
  color: #fff;
  margin: auto;
  background-color: #dcdcdc;
  border: 1px solid #fff;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.room-home {
  height: 100%;
  overflow: auto;
}

.basic-title {
  font-size: 16px;
  font-weight: bold;
}

.room-home-top {
  width: 100%;
  height: 264px;
  display: flex;
  justify-content: space-between;

  .room-home-top-left {
    width: 15%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .room-home-top-left-img {
      width: 64px;
      height: 64px;
      background: #e7f9ff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
      margin-right: 20px;
      margin-bottom: 10px;
    }
  }

  .room-home-top-right {
    width: 85%;
  }
}

.room-home-top-right-top {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #fff;
}

.room-home-line {
  width: 100%;
  height: 16px;
  background-color: #f0f2f5;
}

.room-home-line-line {
  width: 16px;
  height: 100%;
  background-color: #f0f2f5;
}

.room-home-bottom {
  display: flex;
  justify-content: space-between;
  background-color: #f0f2f5;
  .room-home-bottom-left {
    width: 50%;
    background-color: #fff;

    padding: 20px 0px;
  }

  .room-home-bottom-right {
    width: 50%;
    padding: 20px 0px;
    background-color: #fff;
  }
}
</style>
