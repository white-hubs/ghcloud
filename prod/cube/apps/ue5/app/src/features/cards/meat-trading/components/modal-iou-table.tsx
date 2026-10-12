import type { TableColumnType } from "ant-design-vue";
import dayjs from "dayjs";
import { computed, defineComponent, reactive, watch } from "vue";

import TableData from "./tableData";
import Modal from "@/features/equipment/modal-table/modal";
import {
  transactionComparisonActualAverage,
  transactionComparisonAmount,
  transactionComparisonAverage,
  transactionComparisonCommission,
  transactionComparisonSlice,
  transactionComparisonWeight,
} from "@/infrastructure/api/slide-tianjin";
import { setTimeType } from "@/infrastructure/utils/common";

import "./iou-table.module.less";

interface TrendRow {
  data: string;
  value: number;
}

interface TradingCompareData {
  currentDateList: TrendRow[];
  currentValue: number;
  lastDateList: TrendRow[];
  lastValue: number;
  qoqTradeValue: number;
}

export const ModalIouTable = defineComponent({
  name: "ModalIouTable",
  props: {
    typeName: { type: String, required: true, default: "" },
    showModal: { type: Boolean, required: true, default: false },
    time: { type: String, required: true, default: "TODAY" },
    unit: { type: String, required: true, default: "" },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const tradingWeight = reactive<TradingCompareData>({
      currentDateList: [],
      currentValue: 0,
      lastDateList: [],
      lastValue: 0,
      qoqTradeValue: 0,
    });

    const currentTimeTitle = computed((): string => {
      if (props.time === "TODAY") return "今日";
      if (props.time === "THIS_WEEK") return `${dayjs().subtract(7, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      if (props.time === "THIS_MONTH") return `${dayjs().subtract(30, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      if (props.time === "THIS_YEAR") return `${dayjs().subtract(365, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      return "当前周期";
    });

    const lastTimeTitle = computed((): string => {
      if (props.time === "TODAY") return "昨日";
      if (props.time === "THIS_WEEK") {
        return `${dayjs().subtract(15, "day").format("YYYY-MM-DD")} - ${dayjs().subtract(8, "day").format("YYYY-MM-DD")}`;
      }
      if (props.time === "THIS_MONTH") {
        return `${dayjs().subtract(61, "day").format("YYYY-MM-DD")} - ${dayjs().subtract(31, "day").format("YYYY-MM-DD")}`;
      }
      if (props.time === "THIS_YEAR") {
        return `${dayjs().subtract(731, "day").format("YYYY-MM-DD")} - ${dayjs().subtract(366, "day").format("YYYY-MM-DD")}`;
      }
      return "对比周期";
    });

    const columns = computed<TableColumnType[]>(() => [
      {
        title: "时间",
        dataIndex: "data",
      },
      {
        title: `${props.typeName || "统计值"}${props.unit ? `(${props.unit})` : ""}`,
        dataIndex: "value",
      },
    ]);

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const formatNumber = (value: unknown, fractionDigits = 2): string => {
      const numericValue = Number(value ?? 0);
      if (!Number.isFinite(numericValue)) return "0";
      return numericValue.toLocaleString(undefined, {
        maximumFractionDigits: fractionDigits,
      });
    };

    const mapRows = (list: unknown, dateKey: string, valueKey: string): TrendRow[] => {
      if (!Array.isArray(list)) return [];
      return list.map((item) => {
        const record = item as Record<string, unknown>;
        return {
          data: String(record[dateKey] ?? ""),
          value: normalizeNumber(record[valueKey]),
        };
      });
    };

    const qoqValue = computed(() => normalizeNumber(tradingWeight.qoqTradeValue));
    const qoqClass = computed(() => (qoqValue.value > 0 ? "is-up" : "is-down"));

    const getTableData = async () => {
      const timeType = setTimeType(props.time);
      const nextData: TradingCompareData = {
        currentDateList: [],
        currentValue: 0,
        lastDateList: [],
        lastValue: 0,
        qoqTradeValue: 0,
      };

      if (props.typeName === "交易金额") {
        const response = await transactionComparisonAmount({ type: timeType });
        nextData.currentValue = normalizeNumber(response?.currentAmount);
        nextData.lastValue = normalizeNumber(response?.lastAmount);
        nextData.qoqTradeValue = normalizeNumber(response?.qoqTradeAmount);
        nextData.currentDateList = mapRows(response?.currentDateAmountList, "summaryDate", "summaryAmount");
        nextData.lastDateList = mapRows(response?.lastDateAmountList, "summaryDate", "summaryAmount");
      } else if (props.typeName === "交易佣金") {
        const response = await transactionComparisonCommission({ type: timeType });
        nextData.currentValue = normalizeNumber(response?.currentCommission);
        nextData.lastValue = normalizeNumber(response?.lastCommission);
        nextData.qoqTradeValue = normalizeNumber(response?.qoqTradeCommission);
        nextData.currentDateList = mapRows(response?.currentDateCommissionList, "summaryDate", "summaryCommission");
        nextData.lastDateList = mapRows(response?.lastDateCommissionList, "summaryDate", "summaryCommission");
      } else if (props.typeName === "交易均价") {
        const response = await transactionComparisonAverage({ type: timeType });
        nextData.currentValue = normalizeNumber(response?.currentAveragePrice);
        nextData.lastValue = normalizeNumber(response?.lastAveragePrice);
        nextData.qoqTradeValue = normalizeNumber(response?.qoqTradeAveragePrice);
        nextData.currentDateList = mapRows(response?.currentDateAveragePriceList, "summaryDate", "summaryAveragePrice");
        nextData.lastDateList = mapRows(response?.lastDateAveragePriceList, "summaryDate", "summaryAveragePrice");
      } else if (props.typeName === "实际均价") {
        const response = await transactionComparisonActualAverage({ type: timeType });
        nextData.currentValue = normalizeNumber(response?.currentAveragePrice);
        nextData.lastValue = normalizeNumber(response?.lastAveragePrice);
        nextData.qoqTradeValue = normalizeNumber(response?.qoqTradeAveragePrice);
        nextData.currentDateList = mapRows(response?.currentDateAveragePriceList, "summaryDate", "summaryAveragePrice");
        nextData.lastDateList = mapRows(response?.lastDateAveragePriceList, "summaryDate", "summaryAveragePrice");
      } else if (props.typeName === "交易重量") {
        const response = await transactionComparisonWeight({ type: timeType });
        nextData.currentValue = normalizeNumber(response?.currentWeight);
        nextData.lastValue = normalizeNumber(response?.lastWeight);
        nextData.qoqTradeValue = normalizeNumber(response?.qoqTradeWeight);
        nextData.currentDateList = mapRows(response?.currentDateWeightList, "summaryDate", "summaryWeight");
        nextData.lastDateList = mapRows(response?.lastDateWeightList, "summaryDate", "summaryWeight");
      } else if (props.typeName === "交易片数") {
        const response = await transactionComparisonSlice({ type: timeType });
        nextData.currentValue = normalizeNumber(response?.currentSlices);
        nextData.lastValue = normalizeNumber(response?.lastSlices);
        nextData.qoqTradeValue = normalizeNumber(response?.qoqTradeSlices);
        nextData.currentDateList = mapRows(response?.currentDateSlicesList, "summaryDate", "summarySlices");
        nextData.lastDateList = mapRows(response?.lastDateSlicesList, "summaryDate", "summarySlices");
      }

      Object.assign(tradingWeight, nextData);
    };

    const cancel = () => {
      emit("close");
    };

    watch(
      () => [props.showModal, props.time, props.typeName],
      () => {
        if (props.showModal && props.typeName) {
          getTableData();
        }
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <Modal
        title={`${props.typeName || "交易信息"}详情`}
        width="980px"
        show={props.showModal}
        onClose={cancel}
        wrapClassName="meat-transaction-detail-modal"
        destroyOnClose
      >
        <div class="meat-transaction-detail">
          <div class="meat-transaction-detail__summary">
            <div class="meat-transaction-detail__summary-main">
              <span class="meat-transaction-detail__label">
                {currentTimeTitle.value}
                {props.typeName}
              </span>
              <span class="meat-transaction-detail__value">
                {formatNumber(tradingWeight.currentValue)}
                <span class="meat-transaction-detail__unit">{props.unit}</span>
              </span>
            </div>
            <div class="meat-transaction-detail__summary-card">
              <span class="meat-transaction-detail__label">
                {lastTimeTitle.value}
                {props.typeName}
              </span>
              <span class="meat-transaction-detail__sub-value">
                {formatNumber(tradingWeight.lastValue)}
                <span class="meat-transaction-detail__unit">{props.unit}</span>
              </span>
            </div>
            <div class={["meat-transaction-detail__summary-card", "meat-transaction-detail__qoq", qoqClass.value]}>
              <span class="meat-transaction-detail__label">环比</span>
              <span class="meat-transaction-detail__sub-value">
                <span class="meat-transaction-detail__qoq-arrow" aria-hidden="true" />
                {formatNumber(qoqValue.value)}%
              </span>
            </div>
          </div>

          <div class="meat-transaction-detail__tables">
            <section class="meat-transaction-detail__table-panel">
              <div class="meat-transaction-detail__table-title">
                <span class="meat-transaction-detail__dot" aria-hidden="true" />
                当前周期
              </div>
              <TableData dataSource={tradingWeight.currentDateList} columns={columns.value} />
            </section>

            <div class="meat-transaction-detail__vs" aria-hidden="true">
              VS
            </div>

            <section class="meat-transaction-detail__table-panel">
              <div class="meat-transaction-detail__table-title">
                <span class="meat-transaction-detail__dot is-compare" aria-hidden="true" />
                对比周期
              </div>
              <TableData dataSource={tradingWeight.lastDateList} columns={columns.value} />
            </section>
          </div>
        </div>
      </Modal>
    );
  },
});

export default ModalIouTable;
