import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import ModalUnqualifiedTable from "../components/modal-unqualified-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { MeatTradeRankVO } from "@/infrastructure/api/models/slide";
import { meatTradeRank } from "@/infrastructure/api/slide-tianjin";
import { setTimeType } from "@/infrastructure/utils/common";
import BarChart from "@/shared-ui/panel/charts/bar/barChart";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

const createEmptyRank = (): MeatTradeRankVO => ({
  id: "",
  timeRange: "",
  startDate: "",
  endDate: "",
  meatTestingItem: "",
  meatTestingItemCode: "",
  meatTestingItemName: "",
  totalCheckNumSum: 0,
  totalSum: 0,
  notPassSum: 0,
  prevTotalCheckNumSum: 0,
  prevTotalSum: 0,
  prevNotPassSum: 0,
  checkNumSumRate: 0,
  totalSumRate: 0,
  notPassSumRate: 0,
});

interface BarClickEvent {
  name: string;
  value: number;
  dataIndex: number;
  metadata?: MeatTradeRankVO;
}

export const TianjinFoodSafetyFloor = defineComponent({
  name: "TianjinFoodSafetyFloor",
  setup() {
    const spotCheckTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const supplyReportCount = ref(0);
    const showUnqualifiedTable = ref(false);
    const unqualifiedDataItem = ref<MeatTradeRankVO>(createEmptyRank());

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const foodSafety = reactive<any>({
      yData: [
        {
          color: "#35a9ff",
          data: [],
          name: "不合格数量",
          showBackground: true,
          backgroundStyle: { color: "rgba(108, 128, 151, 0.32)" },
          labelFalge: true,
        },
      ],
      xData: [],
    });

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const hasChartData = computed(() => {
      const list = foodSafety.yData[0]?.data;
      return Array.isArray(list) && list.some((item) => normalizeNumber(item?.value) > 0);
    });

    const changeSpotCheckTime = (): void => {
      getSpotCheck();
    };

    const getSpotCheck = async (): Promise<void> => {
      const data = await meatTradeRank({
        type: setTimeType(spotCheckTime.value.timeType),
      });
      const list = Array.isArray(data) ? data : [];
      supplyReportCount.value = normalizeNumber(list[0]?.totalSum);
      foodSafety.yData[0].data = list.map((item) => ({
        metadata: item,
        value: normalizeNumber(item.notPassSum),
        pop: normalizeNumber(item.notPassSumRate),
      }));
      foodSafety.xData = list.map((item) => item.meatTestingItemName);
    };

    onMounted(() => {
      getSpotCheck();
    });

    const handleBarClick = (event: BarClickEvent): void => {
      if (!event.metadata) return;
      unqualifiedDataItem.value = event.metadata;
      showUnqualifiedTable.value = true;
    };

    const closeUnqualifiedTable = (): void => {
      showUnqualifiedTable.value = false;
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
            <BarChart
              colorLsit={["rgba(53, 169, 255, 0.24)", "#35a9ff"]}
              data={foodSafety.yData}
              xData={foodSafety.xData}
              onBarClick={handleBarClick}
            />
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
            title="来货报备"
            class={PANEL_CLASS}
            zoomable
            zoom-title="来货报备详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="meat-food-safety" />,
              extra: () => (
                <div class="meat-v2-toolbar" data-no-zoom>
                  <DateInlineForm
                    timeList={timeList}
                    modelValue={spotCheckTime.value}
                    onUpdate:modelValue={(v) => {
                      spotCheckTime.value = v;
                    }}
                    onSearch={changeSpotCheckTime}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalUnqualifiedTable
          onClose={closeUnqualifiedTable}
          time-type={spotCheckTime.value.timeType}
          item-data={unqualifiedDataItem.value}
          show-modal={showUnqualifiedTable.value}
        />
      </>
    );
  },
});

export default TianjinFoodSafetyFloor;
