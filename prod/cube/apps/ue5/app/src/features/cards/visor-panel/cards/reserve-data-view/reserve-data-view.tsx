import moment from "moment";
import { computed, defineComponent, onMounted, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./reserve-data-view.module.less";

const titleIcon = getThemeImage("alarm-count.png");

type MetricItem = {
  name: string;
  value: number;
  cardClass: string;
  valueClass: string;
};

export const ReserveDataView = defineComponent({
  name: "ReserveDataView",
  setup() {
    const dateFormat = "YYYY-MM-DD HH:mm:ss";
    const listData = reactive<MetricItem[]>([
      { name: "今日预约人数", value: 0, cardClass: "is-today", valueClass: "is-today-value" },
      { name: "本周预约人数", value: 0, cardClass: "is-week", valueClass: "is-week-value" },
      { name: "本月预约人数", value: 0, cardClass: "is-month", valueClass: "is-month-value" },
    ]);
    const loaded = reactive({ value: false });
    const hasData = computed(() => listData.some((item) => item.value > 0));

    const todayPeriod = [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)];
    const currentWeekPeriod = [
      moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
      moment().endOf("week").add(1, "days").format(dateFormat),
    ];
    const currentMonthPeriod = [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];

    const getListData = async (): Promise<void> => {
      try {
        const params = { pageSize: 999999, pageNumber: 1 };
        const resList = await Promise.all([
          cubeVisitorManagementService.getReservationRecordPage({ ...params, period: todayPeriod.join(",") }),
          cubeVisitorManagementService.getReservationRecordPage({ ...params, period: currentWeekPeriod.join(",") }),
          cubeVisitorManagementService.getReservationRecordPage({ ...params, period: currentMonthPeriod.join(",") }),
        ]);
        resList.forEach((item, index) => {
          listData[index].value = Number(item?.total ?? 0);
        });
      } catch {
        listData.forEach((item) => {
          item.value = 0;
        });
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getListData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["visor-reserve-data-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        ) : (
          <div class={["metric-grid", isZoom ? "is-zoom" : ""]}>
            {listData.map((item) => (
              <div class={["metric-card", item.cardClass]} key={item.name}>
                <div class="metric-label">{item.name}</div>
                <div class={["metric-value", item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={1800} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root visor-reserve-data-v2-root">
        <SubPanelTemplate
          title="预约数据总览"
          class="visual-v2-sub-panel v2-panel-card visor-reserve-data-v2-panel"
          zoomable
          zoom-title="预约数据总览详情"
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ReserveDataView;
