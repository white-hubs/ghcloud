<template>
  <div class="panel">
    <SubPanelTemplate title="保供商户" class="supply-merchant">
      <div class="statistic">
        <div class="statistic-item" v-for="item in supplyMerchant.statistic">
          <div class="value">{{ item.value }}</div>
          <div class="name">
            <span>{{ item.label }}</span
            ><span class="unit">（{{ item.unit }}）</span>
          </div>
        </div>
      </div>
      <div class="carousel">
        <RollTable
          :column="supplyMerchant.column"
          :data="supplyMerchant.tableData"
        ></RollTable>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="价格趋势(保供商品)" class="supply-shoop">
      <div class="table-list">
        <div class="table-header flex-between">
          <div class="td" v-for="th in supplyShoop.column">{{ th.title }}</div>
        </div>
        <div class="table-body">
          <div class="tr flex-between" v-for="tr in supplyShoop.data">
            <div class="td" v-for="td in supplyShoop.column">{{ tr[td.dataIndex] }}</div>
          </div>
        </div>
      </div>
      <div class="line-chart">
        <LineChart :x-data="supplyShoop.xData" :series="supplyShoop.yData" />
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import LineChart from "../public/lineChart.vue";
import moment from "moment";
interface SeriesItf {
  name?: string;
  data?: number[];
  linearGradientColor?: string[];
  showSymbol?: boolean;
  lineColor?: string;
}
interface SuppluMerchant {
  statistic: { label: string; value: number; unit: string }[];
  column: { title: string; dataIndex: string }[];
  tableData: { name: string; phone: string; supply: number; breed: string }[];
}
interface SupplyShoop {
  column: { title: string; dataIndex: string }[];
  data: { breed: string; higtrice: number; lowPrice: number; midPrice: number }[];
  list: { name: string; priceList: number[] }[];
  listIndex: number;
  xData: string[];
  yData: SeriesItf[];
}
const supplyMerchant: SuppluMerchant = reactive({
  statistic: [
    {
      label: "保供商家",
      value: 500,
      unit: "个",
    },
    {
      label: "日均供应量",
      value: 3500,
      unit: "吨",
    },
    {
      label: "保供基地",
      value: 95,
      unit: "个",
    },
    {
      label: "产地面积",
      value: 300000,
      unit: "亩",
    },
  ],
  column: [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "电话",
      dataIndex: "phone",
    },
    {
      title: "人均供应量（吨）",
      dataIndex: "supply",
    },
    {
      title: "品种",
      dataIndex: "breed",
    },
  ],
  tableData: [
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
    {
      name: "郭泽",
      phone: "13880286799",
      supply: 10,
      breed: "冬瓜",
    },
  ],
});
const supplyShoop: SupplyShoop = reactive({
  column: [
    {
      title: "品种",
      dataIndex: "breed",
    },
    {
      title: "最高价",
      dataIndex: "higtrice",
    },
    {
      title: "中间价",
      dataIndex: "midPrice",
    },
    {
      title: "最低价",
      dataIndex: "lowPrice",
    },
  ],
  data: [],
  list: [
    {
      name: "白萝卜",
      priceList: [0.4, 0.45, 0.4, 0.45, 0.4, 0.45, 0.45],
    },
    {
      name: "莴笋",
      priceList: [1.2, 0.8, 0.9, 1.1, 0.6, 0.6, 0.8],
    },
    {
      name: "冬瓜",
      priceList: [0.8, 0.65, 0.6, 0.65, 0.6, 0.6, 0.6],
    },
    {
      name: "洋葱",
      priceList: [0.6, 0.65, 0.6, 0.65, 0.6, 0.55, 0.6],
    },
    {
      name: "大白菜",
      priceList: [0.4, 0.45, 0.4, 0.35, 0.4, 0.4, 0.45],
    },
    {
      name: "土豆",
      priceList: [1.5, 1.5, 1.5, 1.6, 1.3, 1.5, 1.5],
    },
    {
      name: "南瓜",
      priceList: [1.3, 1.2, 1.2, 1.2, 1.2, 1.2, 1.1],
    },
  ],
  listIndex: 0,
  xData: [],
  yData: [],
});
onMounted(() => {
  countShoopPrice();
  getWeekArrData();

  setInterval(() => {
    supplyShoop.listIndex++;
    if (supplyShoop.listIndex <= supplyShoop.list.length) {
      countShoopPrice();
    } else {
      supplyShoop.listIndex = 0;
      countShoopPrice();
    }
  }, 10000);
});
const getWeekArrData = () => {
  for (let i = 6; i >= 0; i--) {
    supplyShoop.xData.push(moment().subtract(i, "days").format("MM-DD"));
  }
};
const countShoopPrice = () => {
  let cur = supplyShoop.list[supplyShoop.listIndex];
  let total = cur.priceList.reduce(function (pre, curr) {
    return pre + curr;
  });
  supplyShoop.data = [
    {
      breed: cur.name,
      higtrice: Math.max(...cur.priceList),
      lowPrice: Math.min(...cur.priceList),
      midPrice: Math.floor((total / cur.priceList.length) * 100) / 100,
    },
  ];
  supplyShoop.yData = [
    { name: "商品价格趋势", data: cur.priceList, lineColor: "#18f5ab" },
  ];
};
</script>
<style lang="less" scoped>
.supply-merchant {
  .statistic {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    &-item {
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100px;

      background: linear-gradient(
        90deg,
        rgba(78, 107, 140, 0.8) 0%,
        rgba(78, 107, 140, 0) 100%
      );
      .value {
        font-size: 30px;
        color: #18f5ab;
        font-family: "robotoMedium";
      }
      &:first-child .value {
        color: #1890ff;
      }
      .name {
        font-size: 14px;
      }
      .unit {
        color: #ccc;
      }
    }
  }
  .carousel {
    height: 320px;
  }
}

.supply-shoop {
  .table-list {
    color: #ffffff;
    font-size: 16px;
  }
  .table-header {
    background: rgba(86, 142, 255, 0.2);
    font-weight: bold;
  }
  .table-body {
    background: rgba(255, 255, 255, 0.1);
  }
  .td {
    flex: 1;
    padding: 6px 0;
    text-align: center;
    border: 1px solid #000;
  }
  .line-chart {
    height: 240px;
  }
}
</style>
