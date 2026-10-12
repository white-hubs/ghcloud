import { computed, defineComponent, onMounted, ref, provide } from "vue";

import AbnormalEvents from "../components/abnormal-events";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import Modal from "@/features/equipment/modal-table/modal";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmPage } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

import styles from "./patrol-abnormal-event-statistics.module.less";

type AlarmRow = {
  alarmPoint?: string;
  alarmTime?: string;
  alarmResult?: string;
  key?: string | number;
};

export const PatrolAbnormalEventStatistics = defineComponent({
  name: "PatrolAbnormalEventStatistics",
  setup() {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(
      () => `modal-table-alarm modal-table-device equipment-data-list-modal device-records-theme-${currentTheme.value}`,
    );
    const showAbnormalModal = ref(false);
    const listData = ref<AlarmRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const column = [
      {
        title: "报警地点",
        dataIndex: "alarmPoint",
        flex: 1.1,
        align: "left" as const,
      },
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        flex: 1.2,
        align: "center" as const,
      },
      {
        title: "处理结果",
        dataIndex: "alarmResult",
        flex: 1,
        align: "center" as const,
      },
    ];

    const getAlarmPage = async (): Promise<void> => {
      try {
        const { records } = await alarmPage({ pageSize: 10, pageNumber: 1, keyword: "" });
        const rows = Array.isArray(records) ? records : [];
        listData.value = rows.map((item: AlarmRow, index: number) => ({
          ...item,
          key: item.key ?? `${item.alarmPoint ?? "alarm"}-${index}`,
          alarmPoint: item.alarmPoint || "--",
          alarmTime: item.alarmTime || "--",
          alarmResult: item.alarmResult || "--",
        }));
      } catch {
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openDetail = (event?: Event): void => {
      event?.stopPropagation?.();
      showAbnormalModal.value = true;
    };

    const closeDetail = (): void => {
      showAbnormalModal.value = false;
    };

    onMounted(() => {
      void getAlarmPage();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : listData.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <RollTable column={column} data={listData.value} showLength={isZoom ? 10 : 5} />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="巡更异常事件统计"
            class="visual-v2-sub-panel v2-panel-card patrol-abnormal-event-v2-panel"
            zoomable
            zoom-title="巡更异常事件统计详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-alarm" />,
              extra: () => (
                <button
                  type="button"
                  class={styles.detailBtn}
                  data-no-zoom
                  onClick={openDetail}
                  onPointerdown={(event) => event.stopPropagation()}
                >
                  查看详情
                </button>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <Modal
          show={showAbnormalModal.value}
          title="异常事件列表"
          width="1100px"
          mask
          destroyOnClose
          wrapClassName={modalWrapClassName.value}
          onClose={closeDetail}
        >
          <AbnormalEvents />
        </Modal>
      </>
    );
  },
});

export default PatrolAbnormalEventStatistics;
