import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { byTagProperties } from "@/infrastructure/api/device";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-pipe-network.module.less";

const monitorIcon = getThemeImage("device-total.png");
const PAGE_SIZE = 4;

const PIPE_TAGS = [
  { tagCode: "builtin.usage::liquid.level.sensors", iotPropertyCodes: ["hydraulics"], fallbackName: "液位", fallbackUnit: "m" },
  { tagCode: "builtin.usage::fire.water_pressure.device", iotPropertyCodes: ["pressure"], fallbackName: "水压", fallbackUnit: "MPa" },
] as const;

type PipeItem = {
  id: string;
  name: string;
  propertyName: string;
  valueText: string;
  unit: string;
};

const resolvePipeUnit = (iot: any, fallbackName: string, fallbackUnit: string): string => {
  const fromApi = [
    iot?.attributeUnitName,
    iot?.unitName,
    iot?.unit,
    iot?.attributeUnit,
    iot?.dataUnit,
    iot?.attribute?.unitName,
    iot?.attribute?.attributeUnitName,
  ]
    .map((value) => (value == null ? "" : String(value).trim()))
    .find(Boolean);
  if (fromApi) return fromApi;

  const code = String(iot?.code || iot?.attributeCode || iot?.iotPropertyCode || "").toLowerCase();
  const name = String(iot?.name || fallbackName || "");
  if (code.includes("pressure") || name.includes("压力") || name.includes("水压")) return "MPa";
  if (code.includes("hydraulic") || code.includes("level") || name.includes("液位")) return "m";
  return fallbackUnit || "";
};

export const FirePipeNetwork = defineComponent({
  name: "FirePipeNetwork",
  setup() {
    const { globalState } = useStateStore();
    const monitorList = ref<PipeItem[]>([]);
    const pageIndex = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      tagCodes: PIPE_TAGS.map((item) => item.tagCode) as string[],
      areaId: "" as string | undefined,
      filterAreaIds: [] as string[],
      dateRange: [] as string[],
      deviceState: undefined as boolean | undefined,
      status: "" as string,
    });
    let timer: ReturnType<typeof setInterval> | null = null;

    const pages = computed(() => {
      const list = monitorList.value;
      if (list.length === 0) return [] as PipeItem[][];
      const chunks: PipeItem[][] = [];
      for (let i = 0; i < list.length; i += PAGE_SIZE) {
        chunks.push(list.slice(i, i + PAGE_SIZE));
      }
      return chunks;
    });

    const currentPage = computed(() => pages.value[pageIndex.value] ?? []);

    const clearLoop = (): void => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const startLoop = (): void => {
      clearLoop();
      if (pages.value.length <= 1) return;
      timer = setInterval(() => {
        pageIndex.value = (pageIndex.value + 1) % pages.value.length;
      }, 1000 * 60);
    };

    const loadData = async (): Promise<void> => {
      try {
        const responses = await Promise.all(
          PIPE_TAGS.map((tag) =>
            byTagProperties({
              tagCode: tag.tagCode,
              iotPropertyCodes: [...tag.iotPropertyCodes],
            }),
          ),
        );
        const rows: PipeItem[] = [];
        responses.forEach((res, tagIndex) => {
          const tagMeta = PIPE_TAGS[tagIndex];
          (Array.isArray(res) ? res : []).forEach((item: any) => {
            (item?.iotProperties ?? []).forEach((iot: any) => {
              const raw = iot?.originalValue ?? iot?.value;
              const numeric = Number(raw);
              const hasValue = !(raw === undefined || raw === null || raw === "");
              rows.push({
                id: String(item.id ?? ""),
                name: item.deviceName || "--",
                propertyName: iot?.name || tagMeta.fallbackName,
                valueText: !hasValue ? "--" : Number.isFinite(numeric) ? String(numeric) : String(raw),
                unit: resolvePipeUnit(iot, tagMeta.fallbackName, tagMeta.fallbackUnit),
              });
            });
          });
        });
        monitorList.value = rows;
        pageIndex.value = 0;
        startLoop();
      } catch {
        monitorList.value = [];
        pageIndex.value = 0;
        clearLoop();
      } finally {
        loaded.value = true;
      }
    };
    const locateDevice = async (item: PipeItem): Promise<void> => {
      if (!item?.id) return;
      try {
        const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: item.id });
        setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
      } catch {
        // ignore focus errors
      }
    };

    onMounted(() => {
      void loadData();
    });

    onBeforeUnmount(() => {
      clearLoop();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={monitorIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>监测数</span>
              <span class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={monitorList.value.length} separator="" duration={1400} />
                </span>
                <span class={styles.statUnit}>个</span>
              </span>
            </span>
          </button>
        </div>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : monitorList.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.grid}>
            {currentPage.value.map((item) => (
              <button
                type="button"
                class={styles.monitorCard}
                key={`${isZoom ? "zoom-" : ""}${item.id}-${item.propertyName}`}
                onClick={() => void locateDevice(item)}
              >
                <span class={styles.monitorIcon} aria-hidden="true">
                  <img src={monitorIcon} alt="" />
                </span>
                <span class={styles.monitorMeta}>
                  <span class={styles.monitorName} title={item.name}>
                    {item.name}
                  </span>
                  <span class={styles.monitorProperty}>{item.propertyName}</span>
                  <span class={styles.monitorValueRow}>
                    <span class={styles.monitorValue}>{item.valueText}</span>
                    {item.unit ? <span class={styles.monitorUnit}>{item.unit}</span> : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="消防管网监测"
            class="visual-v2-sub-panel v2-panel-card fire-pipe-network-v2-panel"
            zoomable
            zoom-title="消防管网监测详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-monitor" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          onClose={() => {
            deviceModalShow.value = false;
          }}
          parameter={deviceParameter}
        />
      </>
    );
  },
});

export default FirePipeNetwork;
