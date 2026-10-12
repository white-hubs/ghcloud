<template>
  <div class="room-home">
    <div class="room-home-main">
      <span class="verticalLine primary-color-before">通行记录</span>
      <div class="room-home-line"></div>
      <div class="room-home-top">
        <div class="room-home-top-left">
          <div class="room-home-top-left-box">
            <div class="room-home-top-left-img">
              <a-image :width="40" :height="40" :src="img.roomPng"></a-image>
            </div>
            <div>今日通行</div>
            <div style="font-size: 32px; font-weight: bold">
              {{ sumCount }}
              <span style="font-size: 14px">次</span>
            </div>
          </div>
        </div>
        <div class="room-home-line-line"></div>

        <div class="room-home-top-right">
          <div class="room-home-top-right-top">
            <div class="room-home-top-right-top-left basic-title">人员通行统计</div>
            <div class="room-home-top-right-top-left"></div>
          </div>
          <div class="room-home-top-right-echart">
            <div id="EcharRefLineLine" style="width: 100%; height: 170px"></div>
          </div>
        </div>
      </div>
      <div class="room-home-line"></div>

      <div class="room-home-bottom">
        <g-table
          tableCode="ROOM_LOG"
          ref="tableRef"
          title="通行记录"
          :columns="columns"
          :btns="btns"
          :search="search"
          :api="api"
          :editMode="'page'"
        ></g-table>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import * as echarts from "echarts";
import moment from "moment";
import { defineComponent, reactive, toRefs, onBeforeMount, onMounted, getCurrentInstance, ref } from "vue";
const roomPng = "/resource/v1/accesscontrol-migrate/room.png";

export default defineComponent({
  name: "",
  components: {},
  setup() {
    const state = reactive({
      sumCount: 0,
      tableData: [],
      columns: [
        {
          title: "时间",
          dataIndex: "eventTime",
          key: "eventTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""}>
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "门禁名称",
          dataIndex: "doorName",
          key: "doorName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "通行人员",
          dataIndex: "personName",
          key: "personName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "通行方式",
          dataIndex: "eventWay",
          key: "eventWay",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "通行事件",
          dataIndex: "eventName",
          key: "eventName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "通行照片",
          dataIndex: "pictureFile",
          key: "pictureFile",
          width: 96,
          ellipsis: false,
          customRender: ({ record }) => {
            const pictureUrl = record.pictureFile?.path;
            return pictureUrl ? (
              <a-image src={pictureUrl} width="48" height="48" style={{ borderRadius: "4px", objectFit: "cover" }} />
            ) : (
              "无"
            );
          },
        },
        {
          title: "通行结果",
          dataIndex: "eventResult",
          key: "eventResult",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text == "DO_PASS" ? "通过" : "拒绝"}>
                {text == "DO_PASS" ? "通过" : "拒绝"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        list: "getDoorEventRecord",
        deleteSingle: "",
        delete: "",
        path: "",
      },
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入门禁名称搜索",
        },
        {
          label: "通行结果",
          value: "eventResult",
          component: "gSelect",
          options: [
            {
              id: "DO_PASS",
              name: "通过",
            },
            {
              id: "DO_REFUSE",
              name: "拒绝",
            },
          ],
          field: { id: "value", name: "label" },
          placeholder: "请选择通行结果",
        },
        {
          label: "时间范围",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
      ],
      btns: [],
    });

    const { proxy } = getCurrentInstance();
    const tabPosition = ref("top");
    //vue3写法
    const myChart = ref(null);
    const initEchart = async () => {
      echarts.init(document.getElementById("EcharRefLineLine")).dispose();
      let myChart = echarts.init(document.getElementById("EcharRefLineLine"));
      var option;
      var xdata = [];
      var ydata = [];
      await proxy.$api.getToDayEventTrend().then((res) => {
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
            let relVal = "人数";
            relVal += "<br/>" + params[0].marker + params[0].name + " 时: " + params[0].value.toLocaleString() + "人";
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
            boundaryGap: false,
            data: xdata,
            axisLabel: {
              interval: 0,
              rotate: 40,
              formatter: function (value) {
                let dw = "时";
                let cur;
                cur = value + dw;
                return cur;
              },
            },
            axisTick: { show: false },
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
            lineStyle: {
              color: "#FA8C16",
            },
            color: "#FA8C16",

            smooth: true,
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
        state.sumCount = res;
      });
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(async () => {
      //3.组件挂载到页面之后执行-------onMounted

      initEchart();
      getHomeData();
    });
    return {
      ...toRefs(state),
      tabPosition,
      initEchart,
      getHomeData,
      myChart,
      img: {
        roomPng,
      },
    };
  },
});
</script>
<style scoped lang="less">
.basic-title {
  font-size: 16px;
  font-weight: bold;
}
:deep(.ant-table-row) {
  height: 40px !important;
}
:deep(.ant-table-column-title) {
  font-weight: bold !important;
}
.room-home {
  width: 100%;
  height: 100%;
  .room-home-main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
.room-home-top {
  width: 100%;
  height: 210px;
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
  height: 100%;
  .room-home-bottom-left {
    width: 48%;
  }
  .room-home-bottom-right {
    width: 50%;
  }
}
.verticalLine {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  font-family: PingFang SC-Medium;
  height: 60px !important;
  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
    background-color: @blue;
    margin-left: 10px;
  }
}
.room-home-top-right-echart {
  padding: 0px 0px;
}
</style>
