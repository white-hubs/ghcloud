import moment from "moment";
import { defineComponent, onMounted, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./appointmentsNumber.module.less";

const titleIcon = getThemeImage("alarm-count.png");
const todayIcon = getThemeImage("alarm-count-unhandled.png");
const weekIcon = getThemeImage("alarm-count-handled.png");
const monthIcon = getThemeImage("alarm-total.png");

type MetricItem = {
  key: string;
  name: string;
  value: number;
  icon: string;
  toneClass: string;
};

export const AppointmentsNumber = defineComponent({
  name: "AppointmentsNumber",
  props: {
    title: { type: String, default: "访客预约统计" },
  },
  setup(props) {
    const dateFormat = "YYYY-MM-DD HH:mm:ss";
    const listData = reactive<MetricItem[]>([
      { key: "today", name: "今日预约人数", value: 0, icon: todayIcon, toneClass: styles.isToday },
      { key: "week", name: "本周预约人数", value: 0, icon: weekIcon, toneClass: styles.isWeek },
      { key: "month", name: "本月预约人数", value: 0, icon: monthIcon, toneClass: styles.isMonth },
    ]);

    const todayPeriod = [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)];
    const currentWeekPeriod = [
      moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
      moment().endOf("week").add(1, "days").format(dateFormat),
    ];
    const currentMonthPeriod = [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];

    const getListData = async (): Promise<void> => {
      try {
        const params = { pageSize: 1, pageNumber: 1 };
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
      }
    };

    onMounted(() => {
      void getListData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.metricGrid}>
          {listData.map((item) => (
            <div class={[styles.metricCard, item.toneClass]} key={`${isZoom ? "zoom-" : ""}${item.key}`}>
              <div class={styles.metricIcon}>
                <img src={item.icon} alt="" />
              </div>
              <div class={styles.metricContent}>
                <div class={styles.metricLabel}>{item.name}</div>
                <div class={styles.metricValueRow}>
                  <span class={styles.metricValue}>
                    <CountTo startVal={0} endVal={item.value} separator="" duration={1800} />
                  </span>
                  <span class={styles.metricUnit}>人</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card appointments-number-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class={styles.titleIcon} />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default AppointmentsNumber;
