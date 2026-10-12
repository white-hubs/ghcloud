import moment from "moment";
import { computed, defineComponent, onMounted, ref, provide } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./new-reserve-records.module.less";

const titleIcon = getThemeImage("alarm-record.png");

type RecordRow = {
  address?: string;
  reserveDay?: string;
  reservePeriod?: string;
  name?: string;
};

const formatPeriod = (timeStr?: string): string => {
  if (!timeStr) return "--";
  const time = timeStr.split("-");
  if (time.length < 2) return "--";
  return `${time[0].split(":").slice(0, 2).join(":")}-${time[1].split(":").slice(0, 2).join(":")}`;
};

export const NewReserveRecords = defineComponent({
  name: "NewReserveRecords",
  setup() {
    const column = [
      { title: "区域", dataIndex: "address", align: "left" as const, flex: 1 },
      { title: "预约日期", dataIndex: "reserveDay", align: "left" as const, width: 72 },
      { title: "预约时段", dataIndex: "reservePeriod", align: "left" as const, width: 96 },
      { title: "预约人", dataIndex: "name", align: "left" as const, width: 72 },
    ];
    const dataSource = ref<RecordRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasData = computed(() => dataSource.value.length > 0);

    const getData = async (): Promise<void> => {
      try {
        const result = await cubeVisitorManagementService.getReservationRecordPage({
          pageNumber: 1,
          pageSize: 10,
        });
        dataSource.value = (result?.records ?? []).map((item: Record<string, string>) => ({
          ...item,
          reserveDay: item.dayStr ? moment(item.dayStr).format("MM.DD") : "--",
          reservePeriod: formatPeriod(item.timeStr),
        }));
      } catch {
        dataSource.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["visor-reserve-records-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        ) : (
          <div class={["table-wrap", isZoom ? "is-zoom" : ""]}>
            <RollTable showLength={isZoom ? 12 : 8} column={column} data={dataSource.value} />
          </div>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root visor-reserve-records-v2-root">
        <SubPanelTemplate
          title="最新预约记录"
          class="visual-v2-sub-panel v2-panel-card visor-reserve-records-v2-panel"
          zoomable
          zoom-title="最新预约记录详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default NewReserveRecords;
