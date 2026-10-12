<template>
  <g-layout-no-footer title="停车监控">
    <template v-slot:content-table>
      <!-- 顶部 -->
      <div class="data-container flex-column">
        <div class="access-record-top">
          <!-- 左边 -->
          <ul class="act-left">
            <li>
              <div class="enter-bg">
                <i class="iconfont icon-zongcheweishu"></i>
              </div>
              <div>
                <p>总车位数</p>
                <p>
                  <span class="car-num">{{ totalNum }}</span>
                  个
                </p>
              </div>
              <i class="iconfont icon-zongcheweishu enter-big"></i>
            </li>
            <li>
              <div class="out-bg">
                <i class="iconfont icon-shengyuchewei"></i>
              </div>
              <div>
                <p>剩余车位数</p>
                <p>
                  <span class="car-num">{{ totalSpaceNum }}</span>
                  个
                </p>
              </div>
              <i class="iconfont icon-zongcheweishu out-big"></i>
            </li>
          </ul>
          <!-- 右边 -->
          <div class="act-right">
            <LineCharts
              title="车辆停车趋势图"
              :xData="xData"
              :seriesData="seriesData"
            ></LineCharts>
          </div>
        </div>
        <div class="table-content">
          <!-- 实时出入记录 -->
          <div class="table-left flex-column">
            <h2>实时出入记录</h2>
            <div class="table-data">
              <s-table
                :columns="approach.columns"
                :api="approach.api"
                :search="[]"
                :btns="[]"
                scrollX="auto"
              ></s-table>
            </div>
          </div>
          <!--  实时收费记录-->
          <div class="table-right flex-column">
            <h2>实时收费记录</h2>
            <div class="table-data">
              <s-table
                :columns="charge.columns"
                :api="charge.api"
                :search="[]"
                :btns="[]"
                scrollX="auto"
              ></s-table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </g-layout-no-footer>
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
      totalNum: 0, //车位总数
      totalSpaceNum: 0, //剩余总数
      xData: [],
      seriesData: [
        {
          name: "停车数量",
          type: "line",
          smooth: true,
          data: [],
        },
      ],
      approach: {
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
      },
      charge: {
        columns: [
          {
            dataIndex: "payTime",
            title: "时间",
          },
          {
            dataIndex: "vehicleNo",
            title: "车牌号码",
          },
          {
            dataIndex: "parkingTimes",
            title: "停车时长",
          },
          {
            dataIndex: "payType",
            title: "收费方式",
          },
          {
            dataIndex: "receivableAmount",
            title: "应收金额",
          },
          {
            dataIndex: "freeAmount",
            title: "实收金额",
          },
        ],
        api: {
          list: "getCharges", //收费记录列表
        },
      },
    });
    // 今日车辆出入数量统计
    const getParkingInformation = () => {
      proxy.$api.getParkingInformation().then(res => {
        state.totalNum = res.totalNum;
        state.totalSpaceNum = res.totalSpaceNum;
      });
    };
    // 车场停车数趋势图
    const getParkingNum = () => {
      proxy.$api.getParkingNum().then(res => {
        // 选取相同时间点的数据展示
        res.forEach(v => {
          state.seriesData[0].data.push(v.num);
          state.xData.push(v.period);
        });
      });
    };
    onMounted(() => {
      // getData();
      getParkingInformation();
      getParkingNum();
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.data-container {
  height: 100%;
  overflow: hidden;
}
.access-record-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .act-left {
    position: relative;
    width: 390px;
    box-sizing: border-box;
    margin-right: 16px;
    overflow: hidden;
    li {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      height: 140px;
      background-color: #fff;
      &:last-child {
        margin-top: 16px;
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
      .icon-zongcheweishu {
        font-size: 36px;
        color: #fa8c16;
      }
      .icon-shengyuchewei {
        font-size: 36px;
        color: #00ba8b;
      }
      .enter-big {
        position: absolute;
        top: 26px;
        right: -25px;
        font-size: 110px;
        color: rgba(250, 140, 22, 0.05);
        overflow: hidden;
      }
      .out-big {
        position: absolute;
        bottom: -60px;
        right: -25px;
        font-size: 110px;
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
// 面包屑
/deep/ .layout-header {
  padding: 0 15px;
  background-color: #fff;
}
// 下部分表格
.table-content {
  display: flex;
  flex: 1;
  justify-content: space-between;
  width: 100%;
  margin-top: 16px;
  // 实时出入记录
  .table-left {
    flex: 1;
    margin-right: 16px;
    background-color: #fff;
  }
  // 实时收费记录
  .table-right {
    flex: 1;
    background-color: #fff;
  }
  h2 {
    padding: 10px 0 10px 16px;
    font-size: 16px;
    font-weight: 700;
    text-align: left;
    color: #333333;
    border-bottom: 1px solid #eee;
  }
  .table-data {
    flex: 1;
  }
}
</style>
