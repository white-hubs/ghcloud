<template>
  <g-table
    title="停车统计"
    :columns="columns"
    :search="search"
    :api="api"
    btns="btns"
    ref="tableRef"
  >
    <!-- 顶部 -->
    <template v-slot:content-data>
      <div style="margin-top: 10px">
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
              title="车场停车数趋势图"
              :xData="xData"
              :seriesData="seriesData"
              :yAxisMinInterval="1"
            ></LineCharts>
          </div>
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
  watch,
  ref,
} from "vue";
import LineCharts from "./components/LineCharts.vue";
import moment from "moment";
const parkingP1 = '/resource/v1/parking-migrate/assets/images/parkingP1.png'
export default defineComponent({
  components: { LineCharts },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      areaId: null,
      totalNum: 0, //入场数量
      totalSpaceNum: 0, //出场数量
      xData: [], //x轴数据
      // unit: "单位", //数据单位
      colors: ["#0091ff", "#FA8C16"],
      //echarts请求数据
      seriesData: [
        {
          name: "停车数量",
          type: "line",
          smooth: true,
          data: [],
        },
      ],
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
      btns: [],
      search: [
        {
          label: "搜索:",
          value: "keyword",
          placeholder: "请输入车牌号码查询",
        },
        {
          label: "时间范围:",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
      ],
    });

    // // 今日车辆出入数量统计
    // const getCarNum = () => {
    //   proxy.$api
    //     .getCarNum({
    //       parkingInfoCode: state.areaId,
    //     })
    //     .then(res => {
    //       state.totalNum = res.totalNum;
    //       state.totalSpaceNum = res.totalSpaceNum;
    //     });
    // };
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
    // 今日停车出入趋势
    const getParkingLotEntrance = () => {
      proxy.$api
        .getParkingNum({
          parkingInfoCode: state.areaId,
        })
        .then(res => {
          const { inTrendVOS, outTrendVOS } = res;
          // 选取相同时间点的数据展示
          res.forEach(v => {
            state.seriesData[0].data.push(v.num);
            state.xData.push(v.period);
          });
        });
    };
    const tableRef = ref();
    const customChange = (value, options) => {
      tableRef.value.form.parkingInfoCode = value;
      tableRef.value.getData();
      state.areaId = value;
      getParkingLotEntrance();
      getParkingInformation();
    };
    onMounted(() => {
      getParkingInformation(); // 今日车辆出入数量统计
      getParkingLotEntrance(); // 今日停车出入趋势
    });
    watch(tableRef, () => {
      if (!tableRef.value) {
        return
      }
      tableRef.value.form.parkingInfoCode = null;
      tableRef.value.getData();
    })
    return {
      ...toRefs(state),
      moment,
      tableRef,
      customChange,
      img:{
        parkingP1
      }
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-column-title) {
  font-weight: bold !important;
}
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
        img{
          width: 32px;
          height: 32px;
        }
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
