<template>
  <g-table
    title="出入记录"
    :columns="columns"
    :search="search"
    :api="api"
    btns="btns"
    ref="tableRef"
  >
    <!-- 顶部 -->
    <template v-slot:content-data>
      <div class="access-record-top">
        <!-- 左边 -->
        <ul class="act-left">
          <li>
            <div class="enter-bg">
              <i class="iconfont icon-ruchangcheliang"></i>
            </div>
            <div>
              <p>今日入场</p>
              <p>
                <span class="car-num">{{ inNum }}</span>
                辆
              </p>
            </div>
            <i class="iconfont icon-ruchangcheliang enter-big"></i>
          </li>
          <li>
            <div class="out-bg">
              <i class="iconfont icon-chuchangcheliang"></i>
            </div>
            <div>
              <p>今日出场</p>
              <p>
                <span class="car-num">{{ outNum }}</span>
                辆
              </p>
            </div>
            <i class="iconfont icon-chuchangcheliang out-big"></i>
          </li>
        </ul>
        <!-- 右边 -->
        <div class="act-right">
          <LineCharts
            title="停车出入记录图"
            :xData="xData"
            :unit="unit"
            :colors="colors"
            :seriesData="seriesData"
          ></LineCharts>
        </div>
      </div>
      <!-- 标题 -->
      <h2>实时出入记录</h2>
    </template>
  </g-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import LineCharts from "./components/LineCharts.vue";

export default defineComponent({
  components: { LineCharts },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      inNum: 0, //入场数量
      outNum: 0, //出场数量
      xData: [], //x轴数据
      // unit: "单位", //数据单位
      colors: ["#0091ff", "#FA8C16"],
      //echarts请求数据
      seriesData: [
        {
          name: "入场车辆",
          type: "line",
          smooth: true,
          data: [],
        },
        {
          name: "出场车辆",
          type: "line",
          smooth: true,
          data: [],
        },
      ],
      columns: [
        {
          dataIndex: "accessTime",
          title: "时间",
        },
        {
          dataIndex: "vehicleNo",
          title: "车牌号码",
        },
        {
          dataIndex: "accessType",
          title: "出入场",
        },
        {
          dataIndex: "channelName",
          title: "位置",
        },
        {
          dataIndex: "imageBase",
          title: "图片",
          slots: {
            customRender: "imageBase",
          },
          customRender: ({ text }) => {
            return <a-image width="50" src={text} />;
          },
        },
      ],
      api: {
        list: "getAccessRecords", //实时出入记录
      },
      btns: [],
      search: [
        {
          label: "搜索:",
          value: "vehicleNo",
          placeholder: "请输入车牌号码查询",
        },
        {
          label: "时间范围:",
          value: "accessTime",
          defaultDate: "period",
          component: "a-range-picker",
        },
      ],
    });

    // 今日车辆出入数量统计
    const getCarNum = () => {
      proxy.$api.getCarNum().then(res => {
        state.inNum = res.inNum;
        state.outNum = res.outNum;
      });
    };
    // 今日停车出入趋势
    const getParkingLotEntrance = () => {
      proxy.$api.getParkingLotEntrance().then(res => {
        const { inTrendVOS, outTrendVOS } = res;
        // 选取相同时间点的数据展示
        inTrendVOS.forEach(v => {
          outTrendVOS.forEach(item => {
            if (v.period === item.period) {
              state.seriesData[0].data.push(v.num);
              state.seriesData[1].data.push(item.num);
              state.xData.push(item.period);
            }
          });
        });
      });
    };
    onMounted(() => {
      getCarNum(); // 今日车辆出入数量统计
      getParkingLotEntrance(); // 今日停车出入趋势
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.access-record-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  .act-left {
    position: relative;
    width: 390px;
    // height: 280px;
    // background-color: aquamarine;
    box-sizing: border-box;
    margin-right: 16px;
    li {
      display: flex;
      align-items: center;
      height: 140px;
      background-color: #fff;
      &:first-child {
        margin-bottom: 16px;
      }
      .car-num {
        font-size: 32px;
        font-family: DIN Alternate-Bold, DIN Alternate;
        font-weight: bold;
        color: #333333;
        line-height: 28px;
      }
      .enter-bg {
        width: 64px;
        height: 64px;
        line-height: 64px;
        text-align: center;
        background: #fff7e6;
        border-radius: 12px;
        opacity: 1;
        margin: 0 16px;
      }
      .out-bg {
        width: 64px;
        height: 64px;
        line-height: 64px;
        text-align: center;
        background: #e9fff9;
        border-radius: 12px;
        opacity: 1;
        margin: 0 16px;
      }
      .icon-ruchangcheliang {
        font-size: 36px;
        color: #fa8c16;
      }
      .icon-chuchangcheliang {
        font-size: 36px;
        color: #00ba8b;
      }
      .enter-big {
        position: absolute;
        top: 3px;
        right: -8px;
        font-size: 120px;
        color: rgba(250, 140, 22, 0.05);
      }
      .out-big {
        position: absolute;
        bottom: -52px;
        right: -8px;
        font-size: 120px;
        color: rgba(0, 186, 139, 0.05);
      }
    }
  }
  .act-right {
    flex: 1;
    height: 296px;
    box-sizing: border-box;
    background-color: #fff;
    padding-top: 10px;
  }
}
h2 {
  margin: 0;
  margin-top: 16px;
  padding: 10px 0 10px 16px;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  color: #333333;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}
// 面包屑
/deep/ .layout-header {
  padding: 0 15px;
  background-color: #fff;
}
// 搜索
/deep/ .content-search {
  padding-left: 16px;
  background-color: #fff;
}
// 表格
/deep/ .content-table {
  padding: 0 16px;
  background-color: #fff;
}
// 分页
/deep/ .layout-footer {
  height: 56px !important;
  padding-left: 16px;
  margin-bottom: 16px;
  background-color: #fff;
}
</style>
