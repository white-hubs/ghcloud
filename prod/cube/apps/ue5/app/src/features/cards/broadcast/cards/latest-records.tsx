import dayjs from "dayjs";
import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsRecord } from "@/infrastructure/api/broadcast";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./latest-records.module.less";

const VISIBLE_ROWS = 5;

export const LatestRecords = defineComponent({
  name: "LatestRecords",
  setup() {
    const { globalState } = useStateStore();
    const column = [
      {
        title: "广播时间",
        dataIndex: "broadcastTime",
        width: 120,
      },
      {
        title: "内容",
        dataIndex: "broadcastPlayContent",
        width: 160,
      },
      {
        title: "操作人",
        dataIndex: "operatorByName",
      },
    ];
    const listData = ref<any[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const getPlaybackRecord = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      try {
        const res = await statisticsRecord(params);
        const rows = Array.isArray(res) ? res : [];
        listData.value = rows.map((item: any) => ({
          ...item,
          broadcastTime: item.broadcastTime ? dayjs(item.broadcastTime).format("YYYY-MM-DD HH:mm:ss") : "--",
        }));
      } catch {
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getPlaybackRecord();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      const showLength = isZoom ? 9 : VISIBLE_ROWS;
      return (
        <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : listData.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <div class={[styles.tableSurface, isZoom ? styles.isZoomTable : ""]}>
              <RollTable column={column} data={listData.value} showLength={showLength} />
            </div>
          )}
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="最新记录明细"
          class="visual-v2-sub-panel v2-panel-card broadcast-latest-records-v2-panel"
          zoomable
          zoom-title="最新记录明细详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="broadcast-records" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default LatestRecords;
