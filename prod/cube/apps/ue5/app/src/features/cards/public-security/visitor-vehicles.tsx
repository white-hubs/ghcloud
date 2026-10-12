import moment from "moment";
import { defineComponent, onMounted, reactive, ref } from "vue";

import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import type { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./visitor-vehicles.module.less";

const titleIcon = getThemeImage("vehicle-trend.png");

export const VisitorVehicles = defineComponent({
  name: "VisitorVehicles",
  props: {
    title: { type: String, default: "访客车辆数统计" },
  },
  setup(props) {
    const timeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const barData = reactive({
      xData: ["今日", "本周", "本月"] as string[],
      yData: [
        {
          data: [0, 0, 0] as number[],
          name: "访客通行",
          color: ["rgba(41, 137, 255, 0.85)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });

    const dateFormat = "YYYY-MM-DD HH:mm:ss";

    const resolvePeriods = (): string[][] => {
      const custom = timeFrame.value.dateRange;
      if (Array.isArray(custom) && custom.length === 2 && custom[0] && custom[1]) {
        return [custom, custom, custom];
      }
      return [
        [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)],
        [moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"), moment().endOf("week").add(1, "days").format(dateFormat)],
        [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)],
      ];
    };

    const loadData = async (): Promise<void> => {
      try {
        const periods = resolvePeriods();
        const customRange = Array.isArray(timeFrame.value.dateRange) && timeFrame.value.dateRange.length === 2;
        if (customRange) {
          const res = await cubeVisitorManagementService.getPassRecordPage({
            pageSize: 1,
            pageNumber: 1,
            period: periods[0].join(","),
          });
          const total = Number(res?.total) || 0;
          barData.xData = ["所选时段"];
          barData.yData[0].data = [total];
          return;
        }
        const resList = await Promise.all(
          periods.map((period) =>
            cubeVisitorManagementService.getPassRecordPage({
              pageSize: 1,
              pageNumber: 1,
              period: period.join(","),
            }),
          ),
        );
        barData.xData = ["今日", "本周", "本月"];
        barData.yData[0].data = resList.map((item) => Number(item?.total) || 0);
      } catch {
        barData.xData = ["今日", "本周", "本月"];
        barData.yData[0].data = [0, 0, 0];
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.chartPanel}>
          <OverviewChartBar
            bottom={isZoom ? "8%" : "4%"}
            gridTop={isZoom ? 36 : 28}
            height={isZoom ? 360 : undefined}
            title="次"
            xData={barData.xData}
            yData={barData.yData}
          />
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card visitor-vehicles-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class={styles.titleIcon} />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = v;
                  }}
                  onSearch={loadData}
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

export default VisitorVehicles;
