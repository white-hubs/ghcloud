import { computed, defineComponent, onMounted, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeAlarmStatService } from "@/infrastructure/api/service";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./alarm-application-rate.module.less";

type AppRateItem = {
  name: string;
  value: number;
  code: string;
  color: string;
  percent: number;
};

const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#00F27B", "#328BF7", "#EF424A", "#6EE3E1"];

export const AlarmApplicationRate = defineComponent({
  name: "AlarmApplicationRate",
  props: {
    title: { type: String, required: true, default: "报警占比" },
  },
  setup(props) {
    const alarmModalShow = ref(false);
    const alarmParameter = ref<Record<string, unknown>>({});
    const alarmTime = ref<ModelValueItf>();
    const rateList = ref<AppRateItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const alarmTotal = computed(() => rateList.value.reduce((sum, item) => sum + item.value, 0));
    const hasData = computed(() => rateList.value.some((item) => item.value > 0));
    const pieData = computed(() =>
      rateList.value.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
        code: item.code,
        percent: item.percent,
      })),
    );

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const openItemModal = (item: { code?: string; name?: string }): void => {
      alarmParameter.value = {
        applicationCode: item.code,
        dateRange: [...(alarmTime.value?.dateRange ?? [])],
      };
      alarmModalShow.value = true;
    };

    const openPieModal = (item: AppRateItem | { data?: { originData?: AppRateItem } }): void => {
      const resolved = (item as { data?: { originData?: AppRateItem } })?.data?.originData ?? (item as AppRateItem);
      if (!resolved?.code && !resolved?.name) return;
      openItemModal(resolved);
    };

    const changeAlarmTime = async (): Promise<void> => {
      const param = {
        period: alarmTime.value?.dateRange?.join(",") ?? "",
        type: alarmTime.value?.timeType,
      };
      try {
        const data = await cubeAlarmStatService.alarmApplicationStatGroup(param);
        const list = Array.isArray(data) ? data : [];
        const total = list.reduce((sum, item) => sum + (Number(item.alarmNum) || 0), 0) || 1;
        rateList.value = list.map((item, index) => {
          const value = Number(item.alarmNum) || 0;
          return {
            name: item.applicationName,
            value,
            code: item.applicationCode,
            color: colors[index % colors.length],
            percent: Math.round((value / total) * 1000) / 10,
          };
        });
      } catch {
        rateList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeAlarmTime();
    });

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={alarmTime.value}
          onUpdate:modelValue={(v) => {
            alarmTime.value = v;
          }}
          onSearch={changeAlarmTime}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        ) : (
          <div class={styles.analysisSurface}>
            <div class={styles.chartWrap}>
              <ElevatorAnalysisPie pieData={pieData.value} onClickbar={openPieModal}>
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={alarmTotal.value} separator="" duration={1600} />
                </div>
                <div class={styles.pieCenterLabel}>报警总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.rateList}>
              {pieData.value.map((item) => (
                <button
                  key={`${isZoom ? "zoom-" : ""}${item.code || item.name}`}
                  type="button"
                  class={styles.rateItem}
                  onClick={() => openItemModal(item)}
                >
                  <span class={styles.rateColor} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  <span class={styles.rateMain}>
                    <span class={styles.rateTop}>
                      <span class={styles.rateName}>{item.name}</span>
                      <span class={styles.rateCount}>{item.value}</span>
                    </span>
                    <span class={styles.rateBarTrack}>
                      <span
                        class={styles.rateBarFill}
                        style={{
                          width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                        }}
                      />
                    </span>
                    <span class={styles.rateShare}>占比 {item.percent}%</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} alarm-application-rate-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
              extra: () => renderDateForm(),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTable showModal={alarmModalShow.value} onClose={closeModal} parameter={alarmParameter.value} />
      </>
    );
  },
});

export default AlarmApplicationRate;
