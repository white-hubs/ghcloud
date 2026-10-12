import { computed, defineComponent, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { spotCheck } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import BarChart from "@/shared-ui/panel/charts/bar/barChart";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

export const MeatFoodSafetyInfo = defineComponent({
  name: "MeatFoodSafetyInfo",
  setup() {
    const foodSafetyTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const supplyReportCount = ref(0);
    const foodSafety = reactive<any>({
      yData: [
        {
          color: "#D9E7FF",
          data: [],
          name: "不合格数量",
          showBackground: true,
          backgroundStyle: { color: "rgba(108, 128, 151, 0.32)" },
          labelFalge: true,
        },
      ],
      xData: ["检疫票", "瘦肉精", "含水量"],
    });
    const timeList = [
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const hasChartData = computed(() => {
      const list = foodSafety.yData[0]?.data;
      return Array.isArray(list) && list.length > 0;
    });

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const changeFoodSafetyTimeTime = () => {
      foodSafetyInformationEvent();
    };

    const foodSafetyInformationEvent = async () => {
      const data = await spotCheck({
        type: setTimeType(foodSafetyTime.value.timeType),
      });
      supplyReportCount.value = normalizeNumber(data.supplyReports);
      foodSafety.yData[0].data = [
        {
          value: normalizeNumber(data.pratiqueFailed),
          pop: normalizeNumber(data.qoqPratiqueFailed),
        },
        {
          value: normalizeNumber(data.clenbuterolFailed),
          pop: normalizeNumber(data.qoqClenbuterolFailed),
        },
        {
          value: normalizeNumber(data.watered),
          pop: normalizeNumber(data.qoqWatered),
        },
      ];
      foodSafety.xData = ["检疫票", "瘦肉精", "含水量"];
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["meat-v2-overview-card", "meat-v2-surface"]}>
          <span class="meat-v2-metric-title">
            <span class="meat-v2-dot" aria-hidden="true" />
            来货报备批次数
          </span>
          <span class="meat-v2-metric-main">
            <span class="meat-v2-value">
              <CountTo startVal={0} endVal={supplyReportCount.value} duration={1600} separator="," />
            </span>
            <span class="meat-v2-unit">批</span>
          </span>
        </div>
        {hasChartData.value ? (
          <div class={["meat-v2-chart", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <BarChart colorLsit={["rgba(53, 169, 255, 0.24)", "#35a9ff"]} data={foodSafety.yData} xData={foodSafety.xData} />
          </div>
        ) : (
          <div class={["meat-v2-empty", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="meat-v2-root">
        <SubPanelTemplate
          title="食安信息"
          class={PANEL_CLASS}
          zoomable
          zoom-title="食安信息详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meat-food-safety" />,
            extra: () => (
              <div class="meat-v2-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList}
                  modelValue={foodSafetyTime.value}
                  onUpdate:modelValue={(v) => {
                    foodSafetyTime.value = v;
                  }}
                  onSearch={changeFoodSafetyTimeTime}
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

export default MeatFoodSafetyInfo;
