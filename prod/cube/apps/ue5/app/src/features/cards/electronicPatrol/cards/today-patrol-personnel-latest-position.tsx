import moment from "moment";
import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolPersonLocationNew } from "@/infrastructure/api/door";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./today-patrol-personnel-latest-position.module.less";

type PersonnelRow = {
  datetime?: string;
  personName?: string;
  location?: string;
  key?: string | number;
};

export const TodayPatrolPersonnelLatestPosition = defineComponent({
  name: "TodayPatrolPersonnelLatestPosition",
  setup() {
    const personnelLocationData = ref<PersonnelRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const columns = [
      {
        title: "时间",
        dataIndex: "datetime",
        flex: 1.2,
        align: "center" as const,
      },
      {
        title: "人员",
        dataIndex: "personName",
        flex: 0.9,
        align: "center" as const,
      },
      {
        title: "点位",
        dataIndex: "location",
        flex: 1.2,
        align: "left" as const,
      },
    ];

    const getPatrolPersonLocationNew = async (): Promise<void> => {
      try {
        const res = await patrolPersonLocationNew({ type: "TODAY" });
        const rows = Array.isArray(res) ? res : [];
        personnelLocationData.value = rows.map((item: PersonnelRow, index: number) => ({
          ...item,
          key: `${item.personName ?? "person"}-${index}`,
          datetime: item.datetime ? moment(item.datetime).format("YYYY-MM-DD HH:mm:ss") : "--",
          personName: item.personName || "--",
          location: item.location || "--",
        }));
      } catch {
        personnelLocationData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getPatrolPersonLocationNew();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : personnelLocationData.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <RollTable column={columns} data={personnelLocationData.value} showLength={isZoom ? 10 : 5} />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="今日巡更人员最新位置"
          class="visual-v2-sub-panel v2-panel-card today-patrol-personnel-v2-panel"
          zoomable
          zoom-title="今日巡更人员最新位置详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-personnel" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TodayPatrolPersonnelLatestPosition;
