import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import VehicleTrendsModal from "@/features/cards/convenient-access/vehicle-trends-modal";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAccessRecords } from "@/infrastructure/api/park-management";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./real-time-access-records.module.less";

const CARD_ROW_HEIGHT = 44;
const ZOOM_ROW_HEIGHT = 52;
const CARD_HEADER_HEIGHT = 34;
const ZOOM_HEADER_HEIGHT = 42;
const CARD_VISIBLE_ROWS = 5;
const ZOOM_VISIBLE_ROWS = 10;

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path
        d="M6 4h12v16H6V4Zm3 4h6M9 12h6m-6 4h4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
);

type AccessRow = {
  accessTime: string;
  accessTimeFull: string;
  vehicleNo: string;
  accessType: string;
  accessTone: "in" | "out";
  parkingInfoName: string;
};

export const RealTimeAccessRecords = defineComponent({
  name: "RealTimeAccessRecords",
  setup() {
    const data = ref<AccessRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const showModal = ref(false);
    const modalParams = reactive<{ period: string[] }>({ period: [] });

    const buildColumns = (isZoom: boolean) =>
      isZoom
        ? [
            {
              title: "时间",
              dataIndex: "accessTimeFull",
              flex: 1.5,
              align: "left" as const,
            },
            {
              title: "车牌号码",
              dataIndex: "vehicleNo",
              flex: 1.05,
              align: "left" as const,
            },
            {
              title: "出入场",
              dataIndex: "accessType",
              width: 80,
              align: "center" as const,
              slots: { customRender: "accessType" },
            },
            {
              title: "所属停车场",
              dataIndex: "parkingInfoName",
              flex: 1.35,
              align: "left" as const,
            },
          ]
        : [
            {
              title: "时间",
              dataIndex: "accessTime",
              flex: 1.15,
              align: "left" as const,
            },
            {
              title: "车牌号码",
              dataIndex: "vehicleNo",
              flex: 1.05,
              align: "left" as const,
            },
            {
              title: "出入场",
              dataIndex: "accessType",
              width: 54,
              align: "center" as const,
              slots: { customRender: "accessType" },
            },
            {
              title: "所属停车场",
              dataIndex: "parkingInfoName",
              flex: 1.25,
              align: "left" as const,
            },
          ];

    const loadData = async (): Promise<void> => {
      try {
        const res = await getAccessRecords({
          pageNumber: 1,
          pageSize: 20,
        });
        const records = Array.isArray(res?.records) ? res.records : [];
        data.value = records.map((e: any) => {
          const rawTime = e?.accessTime;
          const isIn = e?.accessType === "ACCESS_IN";
          return {
            accessTime: rawTime ? dayjs(rawTime).format("MM-DD HH:mm") : "--",
            accessTimeFull: rawTime ? dayjs(rawTime).format("YYYY-MM-DD HH:mm:ss") : "--",
            vehicleNo: e?.vehicleNo || "--",
            accessType: isIn ? "入场" : "出场",
            accessTone: isIn ? ("in" as const) : ("out" as const),
            parkingInfoName: e?.parkingInfoName || "--",
          };
        });
      } catch {
        data.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openMore = (): void => {
      modalParams.period = [dayjs().startOf("year").format("YYYY-MM-DD HH:mm:ss"), dayjs().format("YYYY-MM-DD HH:mm:ss")];
      showModal.value = true;
    };

    onMounted(() => {
      void loadData();
    });

    const renderAccessType = (record: AccessRow): JSX.Element => (
      <span class={[styles.accessTag, record.accessTone === "in" ? styles.toneIn : styles.toneOut]}>{record.accessType}</span>
    );

    const renderBody = (isZoom: boolean): JSX.Element => {
      const rowHeight = isZoom ? ZOOM_ROW_HEIGHT : CARD_ROW_HEIGHT;
      const headerHeight = isZoom ? ZOOM_HEADER_HEIGHT : CARD_HEADER_HEIGHT;
      const visibleRows = isZoom ? ZOOM_VISIBLE_ROWS : CARD_VISIBLE_ROWS;
      const tableHeight = headerHeight + visibleRows * rowHeight;

      return (
        <div class={[styles.cardBody, isZoom ? styles.isZoom : "", isZoom ? "realtime-access-records-zoom" : ""]} data-no-zoom>
          <div class={[styles.tableSurface, "visual-v2-roll-table"]} style={{ height: `${tableHeight}px`, flexBasis: `${tableHeight}px` }}>
            {!loaded.value ? (
              <PanelCardLoading zoom={isZoom} />
            ) : data.value.length === 0 ? (
              <div class={styles.emptySurface} style={{ minHeight: `${tableHeight}px` }}>
                <NoData />
              </div>
            ) : (
              <RollTable
                column={buildColumns(isZoom)}
                data={data.value}
                showLength={visibleRows}
                rowHeight={rowHeight}
                onClickRow={openMore}
                v-slots={{
                  accessType: ({ record }: { record: AccessRow }) => renderAccessType(record),
                }}
              />
            )}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="实时出入记录"
            class="visual-v2-sub-panel v2-panel-card realtime-access-records-v2-panel"
            zoomable
            zoom-title="实时出入记录详情"
            zoom-width={980}
            v-slots={{
              titleIcon: () => <TitleIcon />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <button type="button" class={styles.moreBtn} onClick={openMore}>
                    查看更多
                  </button>
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        {showModal.value ? (
          <VehicleTrendsModal
            params={modalParams}
            showModal={showModal.value}
            onClose={() => {
              showModal.value = false;
            }}
          />
        ) : null}
      </>
    );
  },
});

export default RealTimeAccessRecords;
