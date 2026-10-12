import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
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
      supplyShoop.yData = [{ name: "商品价格趋势", data: cur.priceList, lineColor: "#18f5ab" }];
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="保供商户" class="supply-merchant">
            <div class="statistic">
              {supplyMerchant.statistic.map((item) => (
                <div class="statistic-item">
                  <div class="value"> {item.value}</div>
                  <div class="name">
                    <span> {item.label}</span>
                    <span class="unit">（{item.unit}）</span>
                  </div>
                </div>
              ))}
            </div>
            <div class="carousel">
              {" "}
              <RollTable column={supplyMerchant.column} data={supplyMerchant.tableData}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="价格趋势(保供商品)" class="supply-shoop">
            <div class="table-list">
              <div class="table-header flex-between">
                {supplyShoop.column.map((th) => (
                  <div class="td"> {th.title}</div>
                ))}
              </div>
              <div class="table-body">
                {supplyShoop.data.map((tr) => (
                  <div class="tr flex-between">
                    {supplyShoop.column.map((td) => (
                      <div class="td"> {tr[td.dataIndex]}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div class="line-chart">
              {" "}
              <LineChart x-data={supplyShoop.xData} series={supplyShoop.yData} />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
