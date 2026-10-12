import { defineComponent, onMounted, reactive, ref } from "vue";

import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/universal-panel/_shared/universal-panel-v2-shared.less";

import styles from "./lift-stats.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");

type GenreRow = {
  name: string;
  value: number;
  percent: number;
};

const fallbackRows: GenreRow[] = [
  { name: "电梯设备", value: 0, percent: 0 },
  { name: "客梯", value: 0, percent: 0 },
  { name: "货梯", value: 0, percent: 0 },
];

export const LiftStats = defineComponent({
  name: "LiftStats",
  setup() {
    const { getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();
    const total = ref(0);
    const rows = ref<GenreRow[]>(fallbackRows.map((item) => ({ ...item })));
    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      anyAreaId: "" as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [] as string[],
    });

    const openDeviceList = (): void => {
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      deviceParameter.filterAreaIds = [];
      deviceParameter.deviceState = undefined;
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceModalShow.value = true;
    };

    const loadData = async (): Promise<void> => {
      try {
        const res: any = await getEquipmentNumber();
        const genres = Array.isArray(res?.deviceGenreNums) ? res.deviceGenreNums : [];
        const values = genres.map((item: any) => ({
          name: String(item?.genreName || "未分类设备"),
          value: Number(item?.num) || 0,
        }));
        total.value = Number(res?.deviceNum) || values.reduce((sum: number, item: { value: number }) => sum + item.value, 0);
        const base = Math.max(
          total.value,
          values.reduce((sum: number, item: { value: number }) => sum + item.value, 0),
          1,
        );
        rows.value = (values.length > 0 ? values.slice(0, 5) : fallbackRows).map((item) => ({
          ...item,
          percent: Math.round(((item.value || 0) / base) * 1000) / 10,
        }));
      } catch {
        total.value = 0;
        rows.value = fallbackRows.map((item) => ({ ...item }));
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : "", ...(isZoom ? universalPanelZoomClass : [])]} data-no-zoom>
        <div
          class={styles.summaryCard}
          role="button"
          tabIndex={0}
          aria-label="查看设备列表"
          onClick={openDeviceList}
          onKeydown={(event: KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") openDeviceList();
          }}
        >
          <div class={styles.summaryGlyph} aria-hidden="true">
            <img src={deviceTotalIcon} alt="" />
          </div>
          <div class={styles.summaryContent}>
            <span class={styles.summaryLabel}>设备总数</span>
            <span class={styles.summaryValueRow}>
              <span class={styles.summaryValue}>
                <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
              </span>
              <span class={styles.summaryUnit}>台</span>
            </span>
          </div>
        </div>

        <div class={styles.genreGrid}>
          {rows.value.map((item, index) => (
            <div class={styles.genreCard} key={`${isZoom ? "zoom-" : ""}${item.name}-${index}`}>
              <div class={styles.genreHeader}>
                <span class={styles.genreDot} />
                <span class={styles.genreName} title={item.name}>
                  {item.name}
                </span>
                <span class={styles.genreValue}>{item.value}台</span>
              </div>
              <div class={styles.genreTrack}>
                <span class={styles.genreFill} style={{ width: `${Math.max(0, Math.min(item.percent, 100))}%` }} />
              </div>
              <span class={styles.genrePercent}>占比 {item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="电梯统计"
            class={`${UNIVERSAL_PANEL_V2_CLASS} lift-stats-v2-panel`}
            zoomable
            zoom-title="电梯统计详情"
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          show-modal={deviceModalShow.value}
          parameter={deviceParameter}
          onClose={() => {
            deviceModalShow.value = false;
          }}
        />
      </>
    );
  },
});

export default LiftStats;
