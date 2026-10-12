import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";

import styles from "./safe-operation-days.module.less";

export const SafeOperationDays = defineComponent({
  name: "SafeOperationDays",
  setup() {
    const startTime = ref(window.config?.systemStartTime ?? "2021-01-01");
    const days = ref(dayjs().diff(startTime.value, "day"));

    const startLabel = computed(() => dayjs(startTime.value).format("YYYY-MM-DD"));
    const durationLabel = computed(() => {
      const total = Math.max(0, days.value);
      const years = Math.floor(total / 365);
      const rest = total % 365;
      if (years <= 0) return `累计 ${total} 天`;
      return `累计 ${years} 年 ${rest} 天`;
    });

    const getDictionary = async (): Promise<void> => {
      try {
        const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
          itemCode: "SYSTEM_CREATION_TIME",
          code: "SYSTEM_CREATION_TIME",
        });
        if (res.variable) {
          startTime.value = res.variable;
          days.value = dayjs().diff(startTime.value, "day");
        }
      } catch {
        // keep config fallback
      }
    };

    onMounted(() => {
      void getDictionary();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.body, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.stage, isZoom ? styles.isZoom : ""]} data-no-zoom>
          <div class={styles.status}>
            <i class={styles.statusDot} />
            <span>安全运行中</span>
          </div>

          <div class={[styles.gauge, isZoom ? styles.isZoom : ""]} data-no-zoom>
            {/* 持续动环：全部用 HTML 层 + 本地 CSS module 动画，避免 SVG/全局 keyframes 失效 */}
            <div class={styles.glow} aria-hidden="true" />
            <div class={[styles.ring, styles.ringOuter]} aria-hidden="true" />
            <div class={[styles.ring, styles.ringDash]} aria-hidden="true" />
            <div class={[styles.ring, styles.ringArc]} aria-hidden="true" />
            <div class={[styles.ring, styles.ringCore]} aria-hidden="true" />

            <div class={styles.scan} aria-hidden="true">
              <span class={styles.scanFan} />
              <span class={styles.scanBeam} />
            </div>

            <div class={styles.orbit} aria-hidden="true">
              <i class={[styles.orbitDot, styles.orbitDotA]} />
              <i class={[styles.orbitDot, styles.orbitDotB]} />
              <i class={[styles.orbitDot, styles.orbitDotC]} />
            </div>

            <div class={styles.hub}>
              <div class={styles.valueRow}>
                <CountTo startVal={0} endVal={days.value} separator="" duration={1800} class={styles.value} />
                <span class={styles.unit}>天</span>
              </div>
              <div class={styles.hubCaption}>监测天数</div>
            </div>
          </div>

          <div class={styles.caption}>
            <i class={styles.captionDot} />
            <span>连续稳定运行</span>
          </div>

          <div class={styles.meta}>
            <span class={styles.metaChip} title={`启用日期 ${startLabel.value}`}>
              启用 {startLabel.value}
            </span>
            <span class={[styles.metaChip, styles.metaAccent]} title={durationLabel.value}>
              {durationLabel.value}
            </span>
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class={["v2-panel-root overview-v2-root", styles.root]}>
        <SubPanelTemplate
          title="安全运营天数"
          class={`visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel safe-days-v2-panel ${styles.panel}`}
          zoomable
          zoom-title="安全运营天数详情"
          zoom-width={560}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-safe-days" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default SafeOperationDays;
