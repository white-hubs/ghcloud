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

import styles from "./ups-work-situation.module.less";

const upsIcon = getThemeImage("device-total.png");
const UPS_TAG = "builtin.usage::ups";
const PAGE_SIZE = 4;

type UpsItem = {
  id: string;
  name: string;
  propertyName: string;
  hours: number;
  hoursText: string;
};

export const UpsWorkSituation = defineComponent({
  name: "UpsWorkSituation",
  setup() {
    const { globalState } = useStateStore();
    const upsList = ref<UpsItem[]>([]);
    const pageIndex = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      tagCodes: [UPS_TAG] as string[],
      areaId: "" as string | undefined,
      filterAreaIds: [] as string[],
      dateRange: [] as string[],
      deviceState: undefined as boolean | undefined,
      status: "" as string,
    });
    let timer: ReturnType<typeof setInterval> | null = null;

    const pages = computed(() => {
      const list = upsList.value;
      if (list.length === 0) return [] as UpsItem[][];
      const chunks: UpsItem[][] = [];
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

    const getUpsData = async (): Promise<void> => {
      try {
        const res = await byTagProperties({ tagCode: UPS_TAG, iotPropertyCodes: ["bat_time"] });
        const rows: UpsItem[] = [];
        (Array.isArray(res) ? res : []).forEach((item: any) => {
          (item?.iotProperties ?? []).forEach((iot: any) => {
            const hours = iot?.originalValue ? Number(iot.originalValue) / 3600 : 0;
            rows.push({
              id: String(item.id ?? ""),
              name: item.deviceName || "--",
              propertyName: iot?.name || "电池续航",
              hours: Number.isFinite(hours) ? hours : 0,
              hoursText: `${(Number.isFinite(hours) ? hours : 0).toFixed(2)}时`,
            });
          });
        });
        upsList.value = rows;
        pageIndex.value = 0;
        startLoop();
      } catch {
        upsList.value = [];
        pageIndex.value = 0;
        clearLoop();
      } finally {
        loaded.value = true;
      }
    };

    const openUpsDeviceList = (): void => {
      deviceParameter.tagCodes = [UPS_TAG];
      deviceParameter.areaId = globalState.business.currentAreaId;
      deviceParameter.filterAreaIds = [];
      deviceParameter.deviceState = undefined;
      deviceParameter.status = "";
      deviceModalShow.value = true;
    };

    const handleCurrentUps = async (item: UpsItem): Promise<void> => {
      if (!item?.id) return;
      try {
        const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: item.id });
        setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
      } catch {
        // ignore focus errors
      }
    };

    onMounted(() => {
      void getUpsData();
    });

    onBeforeUnmount(() => {
      clearLoop();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal, styles.isClickable]} onClick={openUpsDeviceList}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={upsIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>UPS 设备数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={upsList.value.length} separator="" duration={1400} />
              </span>
            </span>
          </button>
        </div>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : upsList.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div
            class={[
              styles.grid,
              currentPage.value.length <= 1 ? styles.isSingle : "",
              currentPage.value.length <= 2 ? styles.isSparse : "",
            ]}
          >
            {currentPage.value.map((item) => (
              <button
                type="button"
                class={styles.upsCard}
                key={`${isZoom ? "zoom-" : ""}${item.id}-${item.propertyName}`}
                onClick={() => void handleCurrentUps(item)}
              >
                <span class={styles.upsIcon} aria-hidden="true">
                  <img src={upsIcon} alt="" />
                </span>
                <span class={styles.upsMeta}>
                  <span class={styles.upsName} title={item.name}>
                    {item.name}
                  </span>
                  <span class={styles.upsProperty}>{item.propertyName}</span>
                </span>
                <span class={styles.upsValue}>{item.hoursText}</span>
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
            title="UPS工作情况"
            class="visual-v2-sub-panel v2-panel-card ups-work-situation-v2-panel"
            zoomable
            zoom-title="UPS工作情况详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-device" />,
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

export default UpsWorkSituation;
