import { defineComponent, onMounted, ref, provide } from "vue";

import tableData from "../../rollTable";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import bus from "@/infrastructure/utils/bus";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import usrCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";

import styles from "./patrol-abnormal-stats.module.less";

type PatrolRow = {
  time?: string;
  patrol?: string;
  reportPerson?: string;
  alarmTargetCode?: string;
  photos?: { id?: string | number; url?: string[] };
  key?: string | number;
};

export const PatrolAbnormalStats = defineComponent({
  name: "PatrolAbnormalStats",
  props: {
    title: { type: String, default: "巡逻异常数统计" },
  },
  setup(props) {
    const tableList = ref<PatrolRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const unusualTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const { getremakerList } = usrCommon();
    const { globalState } = useStateStore();
    const { column: baseColumns } = tableData();

    const columns = (baseColumns.value || []).map((item) => {
      if (item.dataIndex === "time") {
        return { ...item, flex: 1.3, align: "center" as const, width: undefined };
      }
      if (item.dataIndex === "patrol") {
        return { ...item, flex: 1.2, align: "left" as const, width: undefined };
      }
      if (item.dataIndex === "reportPerson") {
        return { ...item, flex: 0.8, align: "center" as const, width: undefined };
      }
      return { ...item, flex: 1, width: undefined };
    });

    const changeUnusualTime = async (): Promise<void> => {
      try {
        const rows = await getremakerList({
          areaId: globalState.business.currentAreaId,
          sceneType: globalState.business.currentMenu,
          period: unusualTime.value.dateRange?.join(",") ?? "",
          type: unusualTime.value.timeType,
          pageNumber: 1,
          pageSize: 50,
        });
        const list = Array.isArray(rows) ? rows : [];
        tableList.value = list.map((item: PatrolRow, index: number) => ({
          ...item,
          key: item.photos?.id ?? `${item.time ?? "row"}-${index}`,
          time: item.time || "--",
          patrol: item.patrol || "--",
          reportPerson: item.reportPerson || "--",
        }));
      } catch {
        tableList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const handleClickRow = (record: PatrolRow): void => {
      if (record?.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };

    onMounted(() => {
      void changeUnusualTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : tableList.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <RollTable
              column={columns}
              data={tableList.value}
              showLength={isZoom ? 10 : 5}
              onClickRow={handleClickRow}
              v-slots={{
                photos: ({ record }: { record: PatrolRow }) => {
                  const urls = Array.isArray(record?.photos?.url) ? record.photos!.url! : [];
                  if (urls.length === 0) return <span>--</span>;
                  return (
                    <a-image-preview-group>
                      {urls.map((item, index) => (
                        <a-image key={`${record.key}-img-${index}`} width={30} height={30} src={item} />
                      ))}
                    </a-image-preview-group>
                  );
                },
              }}
            />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme patrol-abnormal-stats-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={unusualTime.value}
                  onUpdate:modelValue={(v) => {
                    unusualTime.value = v;
                  }}
                  onSearch={changeUnusualTime}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default PatrolAbnormalStats;
