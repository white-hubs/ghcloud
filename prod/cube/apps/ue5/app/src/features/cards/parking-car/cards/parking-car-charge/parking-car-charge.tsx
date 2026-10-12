import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { chargingOverview } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

import "./parking-car-charge.module.less";

type ChargeMetric = {
  img: string;
  value: number;
  label: string;
  ringRatio: number;
  tone: "received" | "receivable" | "free";
};

const toneByIndex: ChargeMetric["tone"][] = ["received", "receivable", "free"];

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3Zm1 4.4 4.8 4.8-1.4 1.4-3.4-3.4-1.6 1.6-1.4-1.4 3.4-3.4Z" fill="currentColor" />
    </svg>
  </span>
);

export const ParkingCarCharge = defineComponent({
  name: "ParkingCarCharge",
  setup() {
    const collectFees = ref<{ timeType: string } | undefined>();
    const collectFeesList = reactive({
      arr: [] as ChargeMetric[],
    });

    const getChargingOverviewInfo = async (): Promise<void> => {
      const list = await chargingOverview({ dimension: collectFees.value?.timeType });
      collectFeesList.arr = (list ?? []).map((item: Omit<ChargeMetric, "tone">, index: number) => ({
        img: item.img,
        label: item.label,
        value: Number(item.value) || 0,
        ringRatio: Number(item.ringRatio) || 0,
        tone: toneByIndex[index] ?? "received",
      }));
    };

    onMounted(() => {
      void getChargingOverviewInfo();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", "charging-body", "parking-charge-v2-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["charge-metric-list", isZoom ? "is-zoom" : ""]}>
          {collectFeesList.arr.map((item) => {
            const isUp = item.ringRatio > 0;
            return (
              <div class={["charge-metric-card", `is-${item.tone}`]} key={`${isZoom ? "zoom-" : ""}${item.label}`}>
                <div class="charge-metric-icon" aria-hidden="true">
                  <img src={getAssetsImage(item.img)} alt="" />
                </div>
                <div class="charge-metric-main">
                  <div class="charge-metric-label">{item.label}</div>
                  <div class="charge-metric-value-row">
                    <span class="v2-metric-value charge-metric-value">
                      <CountTo startVal={0} endVal={item.value} separator="" duration={1800} decimals={item.value % 1 === 0 ? 0 : 2} />
                    </span>
                  </div>
                </div>
                <div class={["charge-metric-ratio", isUp ? "is-up" : "is-down"]}>
                  <span class="ratio-label">环比</span>
                  <span class="ratio-value">{Math.abs(item.ringRatio)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root parking-charge-v2-root">
        <SubPanelTemplate
          title="停车收费"
          class="visual-v2-sub-panel v2-panel-card parking-charge-v2-panel"
          zoomable
          zoom-title="停车收费详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm v-model:modelValue={collectFees.value} onSearch={getChargingOverviewInfo} />
              </div>
            ),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarCharge;
