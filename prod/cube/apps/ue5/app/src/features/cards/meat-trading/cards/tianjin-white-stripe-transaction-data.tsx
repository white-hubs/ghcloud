import { computed, defineComponent, onMounted, ref } from "vue";

import ModalIouTable from "../components/modal-iou-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { porkBimStatSummary, porkBimStatSupplyData } from "@/infrastructure/api/slide-tianjin";
import { setTimeType } from "@/infrastructure/utils/common";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

interface TransactionGroup {
  name: string;
  transactionInfoData: TransactionMetric[];
}

interface TransactionMetric {
  name: string;
  value: number;
  chainRatio: number;
  unit: string;
  clickable: boolean;
}

export const TianjinWhiteStripeTransactionData = defineComponent({
  name: "TianjinWhiteStripeTransactionData",
  setup() {
    const transactionData = ref<TransactionGroup[]>([]);
    const transactionTitle = ref("");
    const transactionUnit = ref("");
    const transactionDetails = ref(false);
    const transactionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const hasData = computed(() => transactionData.value.length > 0);

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const changeTransactionTime = async (): Promise<void> => {
      const data = await porkBimStatSummary({ type: setTimeType(transactionTime.value.timeType) });
      const summaryData = await porkBimStatSupplyData({ type: setTimeType(transactionTime.value.timeType) });
      transactionData.value = [
        {
          name: "交易量",
          transactionInfoData: [
            {
              name: "交易片数",
              value: normalizeNumber(data.tradeSlices),
              chainRatio: normalizeNumber(data.qoqTradeSlices),
              unit: "片",
              clickable: true,
            },
            {
              name: "交易重量",
              value: normalizeNumber(data.tradeWeight),
              chainRatio: normalizeNumber(data.qoqTradeWeight),
              unit: "kg",
              clickable: true,
            },
          ],
        },
        {
          name: "交易均价",
          transactionInfoData: [
            {
              name: "交易均价",
              value: normalizeNumber(data.tradeAverageAmount),
              chainRatio: normalizeNumber(data.qoqTradeAverageAmount),
              unit: "元/kg",
              clickable: true,
            },
            {
              name: "实际均价",
              value: normalizeNumber(data.actualAverageAmount),
              chainRatio: normalizeNumber(data.qoqActualAverageAmount),
              unit: "元/kg",
              clickable: true,
            },
          ],
        },
        {
          name: "交易金额",
          transactionInfoData: [
            {
              name: "交易金额",
              value: normalizeNumber(data.tradeAmount),
              chainRatio: normalizeNumber(data.qoqTradeAmount),
              unit: "元",
              clickable: true,
            },
            {
              name: "交易佣金",
              value: normalizeNumber(data.tradeCommission),
              chainRatio: normalizeNumber(data.qoqTradeCommission),
              unit: "元",
              clickable: true,
            },
          ],
        },
        {
          name: "供货量",
          transactionInfoData: [
            {
              name: "供货片数",
              value: normalizeNumber(summaryData.supplySlices),
              chainRatio: normalizeNumber(summaryData.qoqSupplySlices),
              unit: "片",
              clickable: false,
            },
            {
              name: "供货重量",
              value: normalizeNumber(summaryData.supplyWeight),
              chainRatio: normalizeNumber(summaryData.qoqSupplyWeight),
              unit: "kg",
              clickable: false,
            },
          ],
        },
      ];
    };

    onMounted(() => {
      changeTransactionTime();
    });

    const openTransactionDetail = (item: TransactionMetric): void => {
      if (!item.clickable) return;
      transactionTitle.value = item.name;
      transactionUnit.value = item.unit;
      transactionDetails.value = true;
    };

    const closeTransactionDetail = (): void => {
      transactionDetails.value = false;
    };

    const renderMetricContent = (item: TransactionMetric): JSX.Element => (
      <>
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
      </>
    );

    const renderMetric = (item: TransactionMetric): JSX.Element =>
      item.clickable ? (
        <button
          class={["meat-v2-metric-card", "meat-v2-surface", "meat-v2-clickable"]}
          key={item.name}
          type="button"
          onClick={() => openTransactionDetail(item)}
          aria-label={`查看${item.name}详情`}
        >
          {renderMetricContent(item)}
        </button>
      ) : (
        <div class={["meat-v2-metric-card", "meat-v2-surface"]} key={item.name}>
          {renderMetricContent(item)}
        </div>
      );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["meat-v2-transaction-groups", isZoom ? "is-zoom" : ""]}>
            {transactionData.value.map((group) => (
              <section class="meat-v2-group" key={group.name}>
                <div class="meat-v2-group-title">
                  <span class="meat-v2-dot" aria-hidden="true" />
                  {group.name}
                </div>
                <div class="meat-v2-summary-grid">{group.transactionInfoData.map((item) => renderMetric(item))}</div>
              </section>
            ))}
          </div>
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
            title="白条交易数据"
            class={PANEL_CLASS}
            zoomable
            zoom-title="白条交易数据详情"
            zoom-width={900}
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
          onClose={closeTransactionDetail}
          time={transactionTime.value.timeType}
          type-name={transactionTitle.value}
          unit={transactionUnit.value}
          show-modal={transactionDetails.value}
        />
      </>
    );
  },
});

export default TianjinWhiteStripeTransactionData;
