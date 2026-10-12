import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { paymentMethod } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import PieList from "@/shared-ui/panel/pieList";

import "./parking-car-charge-interval.module.less";

type PieItem = {
  label: string;
  value: number;
  unit?: string;
  color: string;
};

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2 3v2h12V8H6Zm0 4v2h8v-2H6Z" fill="currentColor" />
    </svg>
  </span>
);

const colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#CBE2FF"];

export const ParkingCarChargeInterval = defineComponent({
  name: "ParkingCarChargeInterval",
  setup() {
    const pay = ref<{ timeType: string } | undefined>();
    const total = ref(0);
    const moneyUnit = ref("元");
    const roundPieData = reactive<{ arr: PieItem[] }>({ arr: [] });

    const paymentProportion = async (): Promise<void> => {
      const res = await paymentMethod({ dimension: pay.value?.timeType });
      roundPieData.arr = (res.arr ?? []).map((item: PieItem, index: number) => ({
        label: item.label,
        value: Number(item.value) || 0,
        unit: item.unit || "元",
        color: colorList[index % colorList.length],
      }));

      if (res.total > 100000) {
        total.value = Number((res.total / 10000).toFixed(2));
        moneyUnit.value = "万元";
      } else {
        total.value = Number(res.total) || 0;
        moneyUnit.value = "元";
      }
    };

    onMounted(() => {
      void paymentProportion();
    });

    // 有分类结构即展示（全 0 仍画饼+图例，避免误判「暂无数据」）
    const hasPieData = (): boolean => roundPieData.arr.length > 0;

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["charge-interval-v2", "parking-car-charge-interval-v2-panel", "v2-panel-body", isZoom ? "is-zoom" : ""]}>
        <div class={["metric-banner", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class="metric-banner-glow" aria-hidden="true" />
          <div class="metric-banner-inner">
            <div class="metric-icon" aria-hidden="true">
              <img src={getAssetsImage("money1.png")} alt="" />
            </div>
            <div class="metric-content">
              <span class="metric-label">实收总金额</span>
              <div class="metric-value-row">
                <span class={["v2-metric-value", "metric-value", isZoom ? "is-zoom-value" : ""]}>
                  <CountTo startVal={0} endVal={total.value} separator="" duration={2000} decimals={2} />
                </span>
                <span class={["metric-unit", isZoom ? "is-zoom-unit" : ""]}>{moneyUnit.value}</span>
              </div>
            </div>
          </div>
        </div>

        <div class={["chart-row", "chart-surface", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasPieData() ? (
            <>
              <RoundPie data={roundPieData.arr}>
                <div class={["pie-center-icon", isZoom ? "is-zoom" : ""]}>
                  <img width={isZoom ? 36 : 25} height={isZoom ? 36 : 25} src={getAssetsImage("money1.png")} alt="" />
                </div>
              </RoundPie>
              <PieList roundPieData={roundPieData.arr} class={isZoom ? "pie-list-zoom" : undefined} />
            </>
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="parking-car-charge-interval-v2-root v2-panel-root">
        <SubPanelTemplate
          title="收费方式占比"
          class="visual-v2-sub-panel v2-panel-card parking-car-charge-interval-v2-panel"
          zoomable
          zoom-title="收费方式占比详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm v-model:modelValue={pay.value} onSearch={paymentProportion} />
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

export default ParkingCarChargeInterval;
