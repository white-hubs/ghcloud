import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import TallyingModal from "@/features/equipment/equipmentPanel/tallying-modal/tallying-modal";
import Modal from "@/features/equipment/modal-table/modal";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { porkBimDeviceSlicesStatistics, porkBimSlicesStatistics, porkBimStatSupplyData } from "@/infrastructure/api/slide-tianjin";
import { setTimeType } from "@/infrastructure/utils/common";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

interface DeviceTallyData {
  id: string;
  code?: string;
  name: string;
  number: number;
}

interface TallyMetric {
  title: string;
  count: number;
  qoq: number;
  unit: string;
  status: "passed" | "failed";
}

export const TianjinTallyData = defineComponent({
  name: "TianjinTallyData",
  setup() {
    const tallyTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const summaryData = reactive({
      qoqSupplier: 0,
      qoqSupplySlices: 0,
      qoqSupplyWeight: 0,
      supplier: 0,
      supplySlices: 0,
      supplyWeight: 0,
    });
    const slicesData = reactive({ number: 0, qoq: 0 });
    const deviceData = ref<DeviceTallyData[]>([]);
    const deviceId = ref("");
    const showDevice = ref(false);

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const hasDeviceData = computed(() => deviceData.value.length > 0);

    const changeTallyTime = async (): Promise<void> => {
      try {
        const summary = await porkBimStatSupplyData({ type: setTimeType(tallyTime.value.timeType) });
        Object.assign(summaryData, {
          qoqSupplier: normalizeNumber(summary.qoqSupplier),
          qoqSupplySlices: normalizeNumber(summary.qoqSupplySlices),
          qoqSupplyWeight: normalizeNumber(summary.qoqSupplyWeight),
          supplier: normalizeNumber(summary.supplier),
          supplySlices: normalizeNumber(summary.supplySlices),
          supplyWeight: normalizeNumber(summary.supplyWeight),
        });
      } catch (error) {
        Object.assign(summaryData, {
          qoqSupplier: 0,
          qoqSupplySlices: 0,
          qoqSupplyWeight: 0,
          supplier: 0,
          supplySlices: 0,
          supplyWeight: 0,
        });
      }

      try {
        const slices = await porkBimSlicesStatistics({ type: setTimeType(tallyTime.value.timeType) });
        Object.assign(slicesData, {
          number: normalizeNumber(slices.number),
          qoq: normalizeNumber(slices.qoq),
        });
      } catch (error) {
        Object.assign(slicesData, {
          number: 0,
          qoq: 0,
        });
      }

      try {
        const device = await porkBimDeviceSlicesStatistics({ type: setTimeType(tallyTime.value.timeType) });
        deviceData.value = Array.isArray(device)
          ? device.map((item) => ({
              id: item.id,
              code: item.code,
              name: item.name,
              number: normalizeNumber(item.number),
            }))
          : [];
      } catch (error) {
        deviceData.value = [];
      }
    };

    onMounted(() => {
      changeTallyTime();
    });

    const showDeviceDetail = (item: DeviceTallyData): void => {
      if (!item.id) return;
      deviceId.value = item.id;
      showDevice.value = true;
    };

    const hideDevice = (): void => {
      showDevice.value = false;
    };

    const renderTallyMetric = (item: TallyMetric): JSX.Element => (
      <div class={["meat-v2-audit-card", "meat-v2-surface", `is-${item.status}`]} key={item.title}>
        <div class="meat-v2-audit-head">
          <span class="meat-v2-metric-title">
            <span class="meat-v2-dot" aria-hidden="true" />
            {item.title}
          </span>
          <span class={["meat-v2-qoq", item.qoq > 0 ? "is-up" : ""]}>
            <span>环比</span>
            <span class="meat-v2-qoq-mark" aria-hidden="true" />
            <span class="meat-v2-qoq-value">{item.qoq}%</span>
          </span>
        </div>
        <div class="meat-v2-audit-main">
          <span class="meat-v2-value">
            <CountTo startVal={0} endVal={item.count} duration={1600} separator="," />
          </span>
          <span class="meat-v2-unit">{item.unit}</span>
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => {
      const metrics: TallyMetric[] = [
        {
          title: "报备片数",
          count: summaryData.supplySlices,
          qoq: summaryData.qoqSupplySlices,
          unit: "片",
          status: "passed",
        },
        {
          title: "报备重量",
          count: summaryData.supplyWeight,
          qoq: summaryData.qoqSupplyWeight,
          unit: "kg",
          status: "failed",
        },
      ];

      return (
        <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["meat-v2-audit-layout", isZoom ? "is-zoom" : ""]}>
            <div class={["meat-v2-audit-total", "meat-v2-surface"]}>
              <span class="meat-v2-metric-title">
                <span class="meat-v2-dot" aria-hidden="true" />
                理货总数
              </span>
              <span class="meat-v2-metric-main">
                <span class="meat-v2-value">
                  <CountTo startVal={0} endVal={slicesData.number} duration={1600} separator="," />
                </span>
                <span class="meat-v2-unit">片</span>
              </span>
              <span class={["meat-v2-qoq", slicesData.qoq > 0 ? "is-up" : ""]}>
                <span>环比</span>
                <span class="meat-v2-qoq-mark" aria-hidden="true" />
                <span class="meat-v2-qoq-value">{slicesData.qoq}%</span>
              </span>
            </div>
            <div class="meat-v2-audit-side">{metrics.map((item) => renderTallyMetric(item))}</div>
          </div>
          <div class={["meat-v2-tally-device-list", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <div class="meat-v2-group-title">
              <span class="meat-v2-dot" aria-hidden="true" />
              各理货台的理货数
            </div>
            {hasDeviceData.value ? (
              <div class="meat-v2-tally-device-grid">
                {deviceData.value.map((item) => (
                  <button class="meat-v2-tally-device-card" key={item.id || item.name} type="button" onClick={() => showDeviceDetail(item)}>
                    <span class="meat-v2-tally-device-name" title={item.name}>
                      {item.name || "-"}
                    </span>
                    <span class="meat-v2-metric-main">
                      <span class="meat-v2-value">
                        <CountTo startVal={0} endVal={item.number} duration={1600} separator="," />
                      </span>
                      <span class="meat-v2-unit">片</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div class="meat-v2-tally-empty">
                <NoData />
              </div>
            )}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <>
        <div class="meat-v2-root">
          <SubPanelTemplate
            title="理货数据"
            class={PANEL_CLASS}
            zoomable
            zoom-title="理货数据详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="meat-audit" />,
              extra: () => (
                <div class="meat-v2-toolbar" data-no-zoom>
                  <DateInlineForm
                    timeList={timeList}
                    modelValue={tallyTime.value}
                    onUpdate:modelValue={(v) => {
                      tallyTime.value = v;
                    }}
                    onSearch={changeTallyTime}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <Modal
          title="理货台详情"
          width="880px"
          show={showDevice.value}
          onClose={hideDevice}
          wrapClassName="modal-table-device"
          destroyOnClose
        >
          <TallyingModal id={deviceId.value} onClose={hideDevice} />
        </Modal>
      </>
    );
  },
});

export default TianjinTallyData;
