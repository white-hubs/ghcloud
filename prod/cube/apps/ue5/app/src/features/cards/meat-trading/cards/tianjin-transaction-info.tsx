import { computed, defineComponent, onMounted, ref } from "vue";

import ModalIouTable from "../components/modal-iou-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { porkBimStatSummary } from "@/infrastructure/api/slide-tianjin";
import { setTimeType } from "@/infrastructure/utils/common";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

interface TransactionMetric {
  name: string;
  value: number;
  chainRatio: number;
  unit: string;
}

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

export const TianjinTransactionInfo = defineComponent({
  name: "TianjinTransactionInfo",
  setup() {
    const transactionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });

    const transactionTitle = ref("");
    const transactionUnit = ref("");
    const transactionInfoData = ref<TransactionMetric[]>([]);
    const transactionDetails = ref(false);

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const hasData = computed(() => transactionInfoData.value.length > 0);

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const changeTransactionTime = () => {
      transactionEvent();
    };

    const close = () => {
      transactionDetails.value = false;
    };

    const showIot = (item: TransactionMetric) => {
      transactionTitle.value = item.name;
      transactionUnit.value = item.unit;
      transactionDetails.value = true;
    };

    // 交易信息
    const transactionEvent = async () => {
      const res = await porkBimStatSummary({ type: setTimeType(transactionTime.value.timeType) });
      transactionInfoData.value = [
        {
          name: "交易金额",
          value: normalizeNumber(res.tradeAmount),
          chainRatio: normalizeNumber(res.qoqTradeAmount),
          unit: "元",
        },
        {
          name: "交易佣金",
          value: normalizeNumber(res.tradeCommission),
          chainRatio: normalizeNumber(res.qoqTradeCommission),
          unit: "元",
        },
        {
          name: "交易均价",
          value: normalizeNumber(res.tradeAverageAmount),
          chainRatio: normalizeNumber(res.qoqTradeAverageAmount),
          unit: "元",
        },
        {
          name: "实际均价",
          value: normalizeNumber(res.actualAverageAmount),
          chainRatio: normalizeNumber(res.qoqActualAverageAmount),
          unit: "元/kg",
        },
        {
          name: "交易重量",
          value: normalizeNumber(res.tradeWeight),
          chainRatio: normalizeNumber(res.qoqTradeWeight),
          unit: "kg",
        },
        {
          name: "交易片数",
          value: normalizeNumber(res.tradeSlices),
          chainRatio: normalizeNumber(res.qoqTradeSlices),
          unit: "片",
        },
      ];
    };

    onMounted(() => {
      transactionEvent();
    });

    const renderMetric = (item: TransactionMetric): JSX.Element => (
      <button
        class={["meat-v2-metric-card", "meat-v2-surface", "meat-v2-clickable"]}
        key={item.name}
        type="button"
        onClick={() => showIot(item)}
        data-no-zoom
      >
        <span class="meat-v2-metric-title">
          <span class="meat-v2-dot" aria-hidden="true" />
          {item.name}
        </span>
        <span class="meat-v2-metric-main">
          <span class="meat-v2-value">
            <CountTo startVal={0} endVal={item.value} duration={1600} separator="," />
          </span>
          <span class="meat-v2-unit">{item.unit}</span>
        </span>
        <span class={["meat-v2-qoq", item.chainRatio > 0 ? "is-up" : ""]}>
          <span>环比</span>
          <span class="meat-v2-qoq-mark" aria-hidden="true" />
          <span class="meat-v2-qoq-value">{item.chainRatio}%</span>
        </span>
      </button>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class="meat-v2-summary-grid">{transactionInfoData.value.map((item) => renderMetric(item))}</div>
        ) : (
          <div class={["meat-v2-empty", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="meat-v2-root">
          <SubPanelTemplate
            title="交易信息"
            class={PANEL_CLASS}
            zoomable
            zoom-title="交易信息详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="meat-transaction" />,
              extra: () => (
                <div class="meat-v2-toolbar" data-no-zoom>
                  <DateInlineForm
                    timeList={timeList}
                    modelValue={transactionTime.value}
                    onUpdate:modelValue={(v) => {
                      transactionTime.value = v;
                    }}
                    onSearch={changeTransactionTime}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalIouTable
          onClose={close}
          time={transactionTime.value.timeType}
          type-name={transactionTitle.value}
          unit={transactionUnit.value}
          show-modal={transactionDetails.value}
        />
      </>
    );
  },
});

export default TianjinTransactionInfo;
