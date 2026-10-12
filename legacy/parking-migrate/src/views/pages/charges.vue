<template>
  <g-table
    title="收费记录"
    :columns="columns"
    :search="search"
    :api="api"
    btns="btns"
    ref="tableRef"
    :beforeGet="beforeGet"
  >
    <!-- 顶部 -->
    <template v-slot:content-data>
      <div class="access-record-top">
        <!-- 左边 -->
        <div class="act-left">
          <div class="charge-bg">
            <i class="iconfont icon-jinriruchang"></i>
          </div>
          <!-- 入账金额 -->
          <div>
            <p>今日入账</p>
            <p>
              <span class="money">{{ totalAmount }}</span>
              元
            </p>
          </div>
          <i class="iconfont icon-jinriruchang money-big"></i>
        </div>
        <!-- 右边图表 -->
        <div class="act-right">
          <LineCharts
            :title="'停车收费记录'"
            :xData="xData"
            :colors="colors"
            :seriesData="seriesData"
            :unit="unit"
            :chartBox="'charges'"
          ></LineCharts>
        </div>
      </div>

      <!-- 标题 -->
      <h2>收费记录</h2>
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
import moment from "moment";

export default defineComponent({
  components: { LineCharts },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      totalAmount: 0, //今日缴费金额
      xData: [], //x轴数据
      colors: ["#FA8C16"], //曲线颜色
      unit: "元", //单位
      //echarts请求数据
      seriesData: [
        {
          name: "收费金额",
          type: "line",
          smooth: true,
          data: [],
        },
      ],
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
                content={text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""}
              >
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "vehicleNo",
          title: "车牌号码",
        },
        {
          dataIndex: "accessInTime",
          title: "入场时间",
          key: "accessInTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""}
              >
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
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
          dataIndex: "parkingTimes",
          key: "parkingTimes",
          title: "停车时长 (分钟)",
          align: "center",
        },
        {
          dataIndex: "payType",
          title: "收费方式",
          key: "payType",
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
          key: "receivableAmount",
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
          key: "freeAmount",
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
      api: { list: "getCharges" }, //收费记录列表
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
    const beforeGet=(params)=>{
      getParkingPayment()
      getParkingFeeTrends()
      return {...params}
    }
    // 今日停车缴费金额
    const getParkingPayment = () => {
      proxy.$api.getParkingPayment().then(res => {
        state.totalAmount = res.totalAmount ? res.totalAmount : 0;
      });
    };
    // 今日停车缴费趋势
    const getParkingFeeTrends = () => {
      proxy.$api.getParkingFeeTrends().then(res => {
        // 选取相同时间点的数据展示
        res.forEach(v => {
          state.seriesData[0].data.push(v.amount);
          state.xData.push(v.period);
        });
      });
    };
    onMounted(() => {
      getParkingPayment(); // 今日停车缴费金额
      getParkingFeeTrends(); // 今日停车缴费趋势
    });
    return {
      ...toRefs(state),
      moment,
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
    width: 200px;
    height: 280px;
    padding: 30px 0 0 30px;
    box-sizing: border-box;
    background-color: #fff;
    margin-right: 16px;
    .charge-bg {
      width: 64px;
      height: 64px;
      line-height: 64px;
      text-align: center;
      background: #fff7e6;
      border-radius: 12px;
      opacity: 1;
    }
    .icon-jinriruchang {
      font-size: 36px;
      color: #fa8c16;
    }
    .money {
      font-size: 32px;
      font-family: DIN Alternate-Bold, DIN Alternate;
      font-weight: bold;
      color: #333333;
      line-height: 28px;
    }
    .money-big {
      position: absolute;
      bottom: -42px;
      right: -8px;
      font-size: 110px;
      color: rgba(250, 140, 22, 0.05);
    }
  }
  .act-right {
    flex: 1;
    height: 280px;
    padding-top: 10px;
    background-color: #fff;
    box-sizing: border-box;
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
