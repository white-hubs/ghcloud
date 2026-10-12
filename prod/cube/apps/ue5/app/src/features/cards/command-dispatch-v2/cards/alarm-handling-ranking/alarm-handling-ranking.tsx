import moment from "moment";
import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { departmentHandlerTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./alarm-handling-ranking.module.less";

const titleIcon = getThemeImage("alarm-record.png");

const DEVICE_TAGS = [
  "builtin.app::SECURITY_MONITORING",
  "builtin.app::ELECTRICMANAGE",
  "builtin.app::FIRECONTROL",
  "builtin.app::GAS_MANAGEMENT",
  "builtin.app::ROTATINGMANAGE",
];

const buildYearRange = (): string[] => [
  moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
  moment().endOf("year").format("YYYY-MM-DD HH:mm:ss"),
];

export const AlarmHandlingRanking = defineComponent({
  name: "AlarmHandlingRanking",
  setup() {
    const { globalState } = useStateStore();
    const handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: buildYearRange(),
    });
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmModalShow = ref(false);
    const parameter = reactive({
      alarmLevelCode: undefined as string | undefined,
      alarmStatus: "" as string,
      dateRange: [] as string[],
      departmentId: "" as string,
      deviceTags: DEVICE_TAGS.toString(),
    });
    let requestSeq = 0;

    const resolvePeriodRange = (): string[] => {
      const range = handleTime.value.dateRange;
      if (range?.[0] && range?.[1]) return [range[0], range[1]];
      return buildYearRange();
    };

    /** 对齐 legacy：departmentHandlerTop({ areaId, type, deviceTags, period }) */
    const areaAlarmStatistic = async (): Promise<void> => {
      const seq = ++requestSeq;
      const dateRange = resolvePeriodRange();
      const params = {
        areaId: globalState.business.currentAreaId,
        type: handleTime.value.timeType || "THIS_YEAR",
        deviceTags: DEVICE_TAGS,
        period: dateRange.join(","),
      };
      try {
        const res = await departmentHandlerTop(params);
        if (seq !== requestSeq) return;
        areaAlarmRank.value = Array.isArray(res) ? res : [];
      } catch {
        if (seq !== requestSeq) return;
        areaAlarmRank.value = [];
      } finally {
        if (seq === requestSeq) loaded.value = true;
      }
    };

    /** 对齐 legacy：下钻传 dateRange + deviceTags + ALARM_HANDLER + departmentId */
    const departmentalRanking = (value: AlarmAreaTop): void => {
      const dateRange = resolvePeriodRange();
      parameter.dateRange = dateRange;
      parameter.deviceTags = DEVICE_TAGS.toString();
      parameter.alarmStatus = "ALARM_HANDLER";
      parameter.alarmLevelCode = undefined;
      parameter.departmentId = value.id;
      alarmModalShow.value = true;
    };

    onMounted(() => {
      void areaAlarmStatistic();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body"]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : areaAlarmRank.value.length > 0 ? (
          <div class={[styles.listSurface, "access-control-card-theme"]}>
            {areaAlarmRank.value.map((item, index) => (
              <button
                type="button"
                class={styles.rankItem}
                key={item.id ?? `${item.name}-${index}`}
                onClick={() => departmentalRanking(item)}
              >
                <EventAlarmItem
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={`${item.ratio ?? 0}%`}
                />
              </button>
            ))}
          </div>
        ) : (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="报警处理排名"
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme air-conditioning-v2-panel cmd-alarm-rank-v2-panel"
            zoomable
            zoom-title="报警处理排名详情"
            zoom-width={780}
            v-slots={{
              titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
              extra: () => (
                <div class="access-control-header-toolbar air-conditioning-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={handleTime.value}
                    onUpdate:modelValue={(v) => {
                      handleTime.value = {
                        timeType: v.timeType,
                        dateRange: v.dateRange?.length ? v.dateRange : buildYearRange(),
                      };
                    }}
                    onSearch={areaAlarmStatistic}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTableNew
          showModal={alarmModalShow.value}
          onClose={() => {
            alarmModalShow.value = false;
          }}
          parameter={parameter}
        />
      </>
    );
  },
});

export default AlarmHandlingRanking;
