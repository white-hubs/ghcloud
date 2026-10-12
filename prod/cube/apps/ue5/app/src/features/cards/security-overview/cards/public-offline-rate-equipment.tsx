import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { resolveEquipmentManagementPanelContext } from "@/features/cards/air-exhaust/_shared/supply-exhaust-air-panel-context";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import WaterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../../air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./public-offline-rate-equipment.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

type StatCardItem = {
  label: string;
  value: number;
  cardClass: string;
  valueClass: string;
  iconSrc: string;
  deviceState?: boolean;
};

export const PublicOfflineRateEquipment = defineComponent({
  name: "PublicOfflineRateEquipment",
  props: {
    panelName: { type: String, required: false },
  },
  setup(props) {
    const { getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();
    const panelContext = resolveEquipmentManagementPanelContext(props.panelName);
    const deviceModalShow = ref(false);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceParameter = reactive<Record<string, unknown>>({
      deviceState: undefined as boolean | undefined,
      tagCodes: [] as string[],
      areaId: undefined as string | undefined,
    });

    const stats = reactive({
      total: 0,
      offline: 0,
      online: 0,
      rate: 0,
    });

    const offlineRate = computed(() => Math.min(100, Math.max(0, Number(stats.rate) || 0)));
    const isEmpty = computed(() => loaded.value && !stats.total);

    const statCards = computed<StatCardItem[]>(() => [
      {
        label: "设备总数",
        value: stats.total,
        cardClass: styles.isTotal,
        valueClass: "",
        iconSrc: deviceTotalIcon,
        deviceState: undefined,
      },
      {
        label: "在线设备",
        value: stats.online,
        cardClass: styles.isOnline,
        valueClass: styles.isOnlineValue,
        iconSrc: deviceOnlineIcon,
        deviceState: true,
      },
      {
        label: "离线设备",
        value: stats.offline,
        cardClass: styles.isOffline,
        valueClass: styles.isOfflineValue,
        iconSrc: deviceOfflineIcon,
        deviceState: false,
      },
    ]);

    const equipmentStatistic = async (): Promise<void> => {
      try {
        const res = await getEquipmentNumber();
        if (!res || JSON.stringify(res) === "{}") {
          stats.total = 0;
          stats.offline = 0;
          stats.online = 0;
          stats.rate = 0;
          return;
        }
        const total = Number(res.deviceNum ?? 0);
        let offline = 0;
        (res.deviceStatusNums ?? []).forEach((item: { name?: string; num?: number }) => {
          if (item.name === "OFFLINE") offline = Number(item.num ?? 0);
        });
        const online = Math.max(0, total - offline);
        stats.total = total;
        stats.offline = offline;
        stats.online = online;
        stats.rate = total > 0 ? Math.round((offline / total) * 10000) / 100 : 0;
      } catch {
        stats.total = 0;
        stats.offline = 0;
        stats.online = 0;
        stats.rate = 0;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void equipmentStatistic();
    });

    const openDeviceList = (deviceState?: boolean): void => {
      Object.assign(deviceParameter, {
        deviceState,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const closeDeviceList = (): void => {
      deviceModalShow.value = false;
    };

    const panelClass = [
      panelContext.panelClass ?? "visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel",
      "public-offline-rate-equipment-panel",
    ]
      .filter(Boolean)
      .join(" ");

    const renderMetricCards = (isZoom: boolean): JSX.Element => (
      <div class={styles.metricList}>
        {statCards.value.map((item) => (
          <button
            type="button"
            class={[styles.metricCard, item.cardClass]}
            key={`${isZoom ? "zoom-" : ""}${item.label}`}
            onClick={() => openDeviceList(item.deviceState)}
            aria-label={`查看${item.label}列表`}
          >
            <span class={styles.metricIcon} aria-hidden="true">
              <img src={item.iconSrc} alt="" />
            </span>
            <span class={styles.metricContent}>
              <span class={styles.metricLabel}>{item.label}</span>
              <span class={styles.metricValueRow}>
                <span class={[styles.metricValue, item.valueClass]}>
                  {isZoom ? item.value : <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />}
                </span>
                <span class={styles.metricUnit}>台</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          "air-conditioning-card-body",
          ...(isZoom && panelContext.isV2 ? panelContext.zoomClass : []),
        ]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : isEmpty.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.rateSurface}>
            <button
              type="button"
              class={styles.gaugeWrap}
              onClick={() => openDeviceList(false)}
              aria-label={`查看离线设备列表，离线率 ${offlineRate.value}%`}
            >
              <WaterPolo
                title=""
                value={offlineRate.value}
                unit="%"
                percentage
                responsive
                tone="primary"
                glow
                labelFontSize={isZoom ? 28 : 16}
              />
            </button>
            {renderMetricCards(isZoom)}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <SubPanelTemplate
          title="设备离线率"
          class={panelClass}
          zoomable
          zoom-title="设备离线率详情"
          zoom-width={800}
          v-slots={{
            titleIcon: () => <CardTitleIcon name={panelContext.isMeetingManage ? "overview-device" : "supply-exhaust-offline"} />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <ModalEquipmentAllTable showModal={deviceModalShow.value} onClose={closeDeviceList} parameter={deviceParameter} />
      </>
    );
  },
});

export default PublicOfflineRateEquipment;
