import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { porkBimStatSupplyData } from "@/infrastructure/api/slide-tianjin";
import { setTimeType } from "@/infrastructure/utils/common";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

interface SupplyMetric {
  title: string;
  value: number;
  qoq: number;
  unit: string;
}

export const TianjinSupplyInfo = defineComponent({
  name: "TianjinSupplyInfo",
  setup() {
    const supplyMaterial = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });

    const supplyInformationData = reactive({
      supplier: 0,
      qoqSupplier: 0,
      supplyWeight: 0,
      qoqSupplyWeight: 0,
      supplySlices: 0,
      qoqSupplySlices: 0,
    });

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const changeSupplyMaterialTime = () => {
      supplyInformationEvent();
    };

    // 供货信息
    const supplyInformationEvent = async () => {
      const res = await porkBimStatSupplyData({ type: setTimeType(supplyMaterial.value.timeType) });
      Object.assign(supplyInformationData, {
        supplier: normalizeNumber(res.supplier),
        qoqSupplier: normalizeNumber(res.qoqSupplier),
        supplyWeight: normalizeNumber(res.supplyWeight),
        qoqSupplyWeight: normalizeNumber(res.qoqSupplyWeight),
        supplySlices: normalizeNumber(res.supplySlices),
        qoqSupplySlices: normalizeNumber(res.qoqSupplySlices),
      });
    };

    onMounted(() => {
      supplyInformationEvent();
    });

    const renderMetric = (item: SupplyMetric, isMain = false): JSX.Element => (
      <div class={["meat-v2-metric-card", "meat-v2-surface", isMain ? "meat-v2-supply-main" : ""]} key={item.title}>
        <span class="meat-v2-metric-title">
          <span class="meat-v2-dot" aria-hidden="true" />
          {item.title}
        </span>
        <span class="meat-v2-metric-main">
          <span class="meat-v2-value">
            <CountTo startVal={0} endVal={item.value} duration={1600} separator="," />
          </span>
          <span class="meat-v2-unit">{item.unit}</span>
        </span>
        <span class={["meat-v2-qoq", item.qoq > 0 ? "is-up" : ""]}>
          <span>环比</span>
          <span class="meat-v2-qoq-mark" aria-hidden="true" />
          <span class="meat-v2-qoq-value">{item.qoq}%</span>
        </span>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => {
      const mainMetric: SupplyMetric = {
        title: "供货商户数",
        value: supplyInformationData.supplier,
        qoq: supplyInformationData.qoqSupplier,
        unit: "户",
      };
      const sideMetrics: SupplyMetric[] = [
        {
          title: "供货重量",
          value: supplyInformationData.supplyWeight,
          qoq: supplyInformationData.qoqSupplyWeight,
          unit: "kg",
        },
        {
          title: "供货片数",
          value: supplyInformationData.supplySlices,
          qoq: supplyInformationData.qoqSupplySlices,
          unit: "片",
        },
      ];

      return (
        <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class="meat-v2-supply-grid">
            {renderMetric(mainMetric, true)}
            <div class="meat-v2-supply-side">{sideMetrics.map((item) => renderMetric(item))}</div>
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="meat-v2-root">
        <SubPanelTemplate
          title="供货信息"
          class={PANEL_CLASS}
          zoomable
          zoom-title="供货信息详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meat-supply" />,
            extra: () => (
              <div class="meat-v2-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList}
                  modelValue={supplyMaterial.value}
                  onUpdate:modelValue={(v) => {
                    supplyMaterial.value = v;
                  }}
                  onSearch={changeSupplyMaterialTime}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TianjinSupplyInfo;
