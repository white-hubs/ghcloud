import dayjs from "dayjs";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from "vue";

import FireEquipmentTable from "../components/fire-equipment-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { measureRollTableVisibleRows } from "@/features/cards/base-panel-render/slot-visible-rows";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { sourceLedgerPage } from "@/infrastructure/api/property";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./fire-equipment-statistics.module.less";

const expireIcon = getThemeImage("device-total-offline.png");
const normalIcon = getThemeImage("device-total-online.png");
const VISIBLE_ROWS = 5;
const ROW_HEIGHT = 30;

type FireDeviceRow = {
  id?: string;
  name?: string;
  typeName?: string;
  usageDate?: string;
  status?: string;
};

export const FireEquipmentStatistics = defineComponent({
  name: "FireEquipmentStatistics",
  setup() {
    const fireControlTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const modalShow = ref(false);
    const loaded = ref(false);
    const tableSurfaceRef = ref<HTMLElement | null>(null);
    const visibleRows = ref(VISIBLE_ROWS);
    provide(panelCardLoadedKey, loaded);
    const parameter = reactive<{ status?: string; dateRange: string[] }>({
      status: "EXPIRE",
      dateRange: [],
    });
    const listData = ref<FireDeviceRow[]>([]);
    const expireTotal = ref(0);
    const normalTotal = ref(0);
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;

    const updateVisibleRows = (): void => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        const surface = tableSurfaceRef.value;
        if (!surface) return;
        visibleRows.value = measureRollTableVisibleRows(surface, {
          rowHeight: ROW_HEIGHT,
          min: 3,
          max: 8,
        });
      });
    };

    const column = [
      { title: "设备名称", dataIndex: "name", width: 120 },
      { title: "设备类型", dataIndex: "typeName" },
      { title: "使用年限", dataIndex: "usageDate", width: 110 },
      {
        title: "状态",
        dataIndex: "status",
        slots: { customRender: "status" },
        width: 72,
      },
    ];

    const getFireControlCount = async (): Promise<void> => {
      try {
        const [expireRes, normalRes] = await Promise.all([
          sourceLedgerPage({ status: "EXPIRE", typeCode: "FIRE_FIGHTING_EQUIPMENT" }),
          sourceLedgerPage({ status: "NOT_EXPIRED", typeCode: "FIRE_FIGHTING_EQUIPMENT", pageSize: 1, pageNumber: 1 }),
        ]);
        expireTotal.value = Number(expireRes?.total) || 0;
        normalTotal.value = Number(normalRes?.total) || 0;
        const records = Array.isArray(expireRes?.records) ? expireRes.records : [];
        listData.value = records.map((e: FireDeviceRow) => ({
          ...e,
          status: e.status === "EXPIRE" ? "已过期" : "正常",
          usageDate: e.usageDate ? dayjs(e.usageDate).format("YYYY-MM-DD") : "-",
        }));
      } catch {
        expireTotal.value = 0;
        normalTotal.value = 0;
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openModal = (status?: string): void => {
      parameter.status = status;
      parameter.dateRange = [...(fireControlTime.value.dateRange ?? [])];
      modalShow.value = true;
    };

    onMounted(() => {
      void getFireControlCount();
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(updateVisibleRows);
        if (tableSurfaceRef.value) resizeObserver.observe(tableSurfaceRef.value);
      }
    });
    watch(
      () => [loaded.value, listData.value.length],
      () => {
        void nextTick(updateVisibleRows);
      },
    );
    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
    });

    const tableSlots = {
      status: ({ record }: { record: FireDeviceRow }) => (
        <span class={[styles.statusTag, record.status === "已过期" ? styles.isExpire : styles.isNormal]}>{record.status || "--"}</span>
      ),
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isExpireCard]} onClick={() => openModal("EXPIRE")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={expireIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>到期设备数</span>
              <span class={styles.statValueRow}>
                <span class={[styles.statValue, styles.isExpireValue]}>
                  <CountTo startVal={0} endVal={expireTotal.value} separator="" duration={1400} />
                </span>
                <span class={styles.statUnit}>台</span>
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isNormalCard]} onClick={() => openModal(undefined)}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={normalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>正常设备数</span>
              <span class={styles.statValueRow}>
                <span class={[styles.statValue, styles.isNormalValue]}>
                  <CountTo startVal={0} endVal={normalTotal.value} separator="" duration={1400} />
                </span>
                <span class={styles.statUnit}>台</span>
              </span>
            </span>
          </button>
        </div>

        <div
          ref={isZoom ? undefined : tableSurfaceRef}
          class={[styles.tableSurface, "visual-v2-roll-table"]}
          style={isZoom ? undefined : ({ "--visible-rows": String(visibleRows.value) } as Record<string, string>)}
        >
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : listData.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <RollTable
              column={column}
              data={listData.value}
              showLength={isZoom ? 10 : visibleRows.value}
              rowHeight={ROW_HEIGHT}
              onClickRow={() => openModal("EXPIRE")}
              v-slots={tableSlots}
            />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="消防设备统计"
            class="visual-v2-sub-panel v2-panel-card fire-equipment-statistics-v2-panel"
            zoomable
            zoom-title="消防设备统计详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-device" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={fireControlTime.value}
                    onUpdate:modelValue={(v) => {
                      fireControlTime.value = v;
                    }}
                    onSearch={getFireControlCount}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <FireEquipmentTable
          showModal={modalShow.value}
          onClose={() => {
            modalShow.value = false;
          }}
          parameter={parameter}
        />
      </>
    );
  },
});

export default FireEquipmentStatistics;
