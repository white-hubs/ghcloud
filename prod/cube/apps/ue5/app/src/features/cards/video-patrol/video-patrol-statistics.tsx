import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cameraPatrolStatistics } from "@/infrastructure/api/vmonitor";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./video-patrol-statistics.module.less";

/** 对齐图2「报警处理情况」：六边形主题图标 + 纵向指标行 + 进度条 */
const routeIcon = getThemeImage("device-total.png");
const cameraIcon = getThemeImage("device-total-online.png");
const personnelIcon = getThemeImage("processed.png");

const TONE_COLOR = {
  route: "#5b9ce2",
  camera: "#29c2ff",
  personnel: "#3ecf8e",
} as const;

type MetricTone = keyof typeof TONE_COLOR;

export const VideoPatrolStatistics = defineComponent({
  name: "VideoPatrolStatistics",
  props: {
    title: { type: String, required: false, default: "视频巡逻统计" },
  },
  setup(props) {
    const route = ref(0);
    const camera = ref(0);
    const personnel = ref(0);

    const metricRows = computed(() => {
      const total = Math.max(route.value + camera.value + personnel.value, 1);
      const rows: Array<{
        key: MetricTone;
        label: string;
        value: number;
        percent: number;
        icon: string;
        color: string;
        toneClass: string;
      }> = [
        {
          key: "route",
          label: "巡逻路线",
          value: route.value,
          percent: Math.round((route.value / total) * 1000) / 10,
          icon: routeIcon,
          color: TONE_COLOR.route,
          toneClass: styles.isRoute,
        },
        {
          key: "camera",
          label: "监控点位",
          value: camera.value,
          percent: Math.round((camera.value / total) * 1000) / 10,
          icon: cameraIcon,
          color: TONE_COLOR.camera,
          toneClass: styles.isCamera,
        },
        {
          key: "personnel",
          label: "巡逻人员",
          value: personnel.value,
          percent: Math.round((personnel.value / total) * 1000) / 10,
          icon: personnelIcon,
          color: TONE_COLOR.personnel,
          toneClass: styles.isPersonnel,
        },
      ];
      return rows;
    });

    const fetchData = async (): Promise<void> => {
      try {
        const res = await cameraPatrolStatistics();
        route.value = Number(res?.patrolLineCount) || 0;
        camera.value = Number(res?.patrolCameraCount) || 0;
        personnel.value = Number(res?.patrolUserCount) || 0;
      } catch {
        route.value = 0;
        camera.value = 0;
        personnel.value = 0;
      }
    };

    onMounted(() => {
      void fetchData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["video-patrol-statistics-v2-panel", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.metricPanel, isZoom ? styles.isZoomPanel : ""]}>
          {metricRows.value.map((item) => (
            <div class={[styles.metricRow, item.toneClass]} key={`${isZoom ? "zoom-" : ""}${item.key}`}>
              <div class={styles.rowIcon} aria-hidden="true">
                <img src={item.icon} alt="" />
              </div>
              <div class={styles.rowBody}>
                <div class={styles.rowHead}>
                  <span class={styles.rowLabel}>{item.label}</span>
                  <span class={styles.rowValue}>
                    <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                    <span class={styles.rowUnit}>占比 {item.percent}%</span>
                  </span>
                </div>
                <div class={styles.rowTrack}>
                  <div
                    class={styles.rowFill}
                    style={{
                      width: `${Math.max(0, Math.min(item.percent, 100))}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card video-patrol-statistics-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default VideoPatrolStatistics;
