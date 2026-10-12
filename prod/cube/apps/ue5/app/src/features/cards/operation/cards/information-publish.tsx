import dayjs from "dayjs";
import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { playRecord } from "@/infrastructure/api/securitymanagement";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./information-publish.module.less";

type PublishRow = {
  itemName?: string;
  startTime?: string;
};

export const InformationPublish = defineComponent({
  name: "InformationPublish",
  setup() {
    const columns = [
      { title: "信息名称", dataIndex: "itemName" },
      { title: "发布时间", dataIndex: "startTime", width: 160 },
    ];
    const listData = ref<PublishRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const getPlayRecord = async (): Promise<void> => {
      try {
        const res = await playRecord();
        const records = Array.isArray(res?.records) ? res.records : [];
        listData.value = records.map((item: PublishRow) => ({
          ...item,
          itemName: item?.itemName || "--",
          startTime: item?.startTime ? dayjs(item.startTime).format("YYYY-MM-DD HH:mm:ss") : "--",
        }));
      } catch {
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getPlayRecord();
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
            <RollTable column={columns} data={listData.value} showLength={isZoom ? 10 : 5} />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="信息发布"
          class="visual-v2-sub-panel v2-panel-card information-publish-v2-panel"
          zoomable
          zoom-title="信息发布详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="broadcast-records" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default InformationPublish;
