<template>
  <g-layout-no-footer title="停车监控">
    <template v-slot:content-table>
      <!-- 顶部 -->
      <div>
        <span>
          <g-select
            v-model:value="areaId"
            :url="'getParkingInfors'"
            @change-check="customChange"
            :field="{
              code: 'value',
              name: 'label',
            }"
            :placeholder="'请选择停车场'"
          ></g-select>
        </span>
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
            <!-- <div class="factroy-home-line-line" style="height: 310px"></div> -->

            <!-- 右边 -->
            <div class="act-right">
              <LineCharts
                title="车场停车数趋势图"
                :xData="xData"
                :seriesData="seriesData"
                :yAxisMinInterval="1"
              ></LineCharts>
            </div>
          </div>

          <div style="margin-top: 20px">
            <!-- <div class="factroy-home-line"></div> -->
            <div class="table-content">
              <!-- 实时出入记录 -->
              <div class="table-left flex-column">
                <h2>实时出入记录</h2>
                <div class="table-data">
                  <hTable
                    ref="hTableRef"
                    :columns="approach.columns"
                    :api="approach.api"
                    :search="[]"
                    :btns="[]"
                    :scrollX="'auto'"
                  ></hTable>
                </div>
              </div>
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
  watch,
  ref,
} from "vue";
import LineCharts from "./components/LineCharts.vue";
import hTable from "./components/hTable.vue";
import moment from "moment";
import _ from "lodash";

export default defineComponent({
  components: { LineCharts, hTable },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      areaId: null,
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
            key: "accessTime",
            ellipsis: true,

            customRender: ({ text }) => {
              return (
                <PopOver
                  position="topLeft"
                  content={
                    text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""
                  }
                >
                  {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "vehicleNo",
            title: "车牌号码",
            key: "vehicleNo",
            ellipsis: true,
          },
          {
            dataIndex: "accessType",
            title: "出入场",
            key: "accessType",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <PopOver
                  position="topLeft"
                  content={text == "ACCESS_IN" ? "入场" : "出场"}
                >
                  {text == "ACCESS_IN" ? "入场" : "出场"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "parkingInfoName",
            title: "所属停车场",
            key: "parkingInfoName",
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
            dataIndex: "channelName",
            title: "位置",
            key: "channelName",
            ellipsis: true,
          },
          {
            dataIndex: "imageUrl",
            title: "图片",
            key: "imageUrl",
            ellipsis: true,
            slots: {
              customRender: "imageUrl",
            },
            customRender: ({ text }) => {
              return (
                text? <a-image
                  width={50}
                  height={50}
                  src={text}
                />:"暂无图片"
              );
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
            key: "payTime",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <PopOver
                  position="topLeft"
                  content={
                    text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""
                  }
                >
                  {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "vehicleNo",
            title: "车牌号码",
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
            dataIndex: "parkingTimes",
            title: "停车时长(分钟)",
            ellipsis: true,
            align: "center",
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "payType",
            title: "收费方式",
            ellipsis: true,
            align: "center",
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "receivableAmount",
            title: "应收金额(元)",
            ellipsis: true,
            align: "center",
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "freeAmount",
            title: "实收金额(元)",
            ellipsis: true,
            align: "center",
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
        ],
        api: {
          list: "getCharges", //收费记录列表
        },
      },
    });
    // 今日车辆出入数量统计
    const getParkingInformation = () => {
      proxy.$api
        .getParkingInformation({
          parkingInfoCode: state.areaId,
        })
        .then(res => {
          state.totalNum = res.totalNum;
          state.totalSpaceNum = res.totalSpaceNum;
        });
    };
    const hTableRef = ref();
    // 车场停车数趋势图
    const getParkingNum = () => {
      proxy.$api
        .getParkingNum({
          parkingInfoCode: state.areaId,
        })
        .then(res => {
          // 选取相同时间点的数据展示
          res.forEach(v => {
            state.seriesData[0].data.push(v.num);
            state.xData.push(v.period);
          });
        });
    };
    const customChange = (value, options) => {
      hTableRef.value.form.parkingInfoCode = value;
      hTableRef.value.getData();
      state.areaId = value;
      getParkingInformation();
      getParkingNum();
    };
    onMounted(() => {
      getParkingInformation();
      getParkingNum();
    });
    watch(hTableRef, () => {
      if (!hTableRef.value) {
        return
      }
      hTableRef.value.form.parkingInfoCode = null;
      hTableRef.value.getData();
    })
    return {
      ...toRefs(state),
      hTable,
      customChange,
      hTableRef,
    };
  },
});
</script>

<style lang="less" scoped>
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

:deep(.ant-table-column-title) {
  font-weight: bold !important;
}
:deep(.ant-table-row) {
  height: 60px !important;
}

.data-container {
  height: 100%;
  overflow: auto;
}
.access-record-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 270px;
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
  // display: flex;
  // flex: 1;
  // justify-content: space-between;
  width: 100%;
  background-color: #f0f2f5;

  // 实时出入记录
  .table-left {
    width: 100%;
    background-color: #fff;
    // border-right: 1px solid #ccc;
    padding: 0px 10px;
  }
  // 实时收费记录
  .table-right {
    flex: 1;
    background-color: #fff;
    // border-left: 1px solid #ccc;
    padding: 0px 10px;
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
