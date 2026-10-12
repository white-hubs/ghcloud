import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import UniversalPanelCardIcon from "../../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS } from "../../_shared/universal-panel-v2";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/security-overview/cards/public-security-device-count.module.less";
import "./equipment-overview.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceTotalOnlineIcon = getThemeImage("device-total-online.png");
const deviceTotalOfflineIcon = getThemeImage("device-total-offline.png");

type PieDataItem = {
  name: string;
  value: number;
  color: string;
  areaId?: string;
};

type StatCardItem = {
  label: string;
  value: number;
  cardClass: string;
  iconSrc: string;
  valueClass: string;
  deviceState?: boolean;
};

/**
 * 设备情况总览：视觉对齐图2「设备总览」(public-security-device-count)。
 * 下钻参数对齐设备统计：tagCodes + deviceState + anyAreaId / filterAreaIds。
 */
export const EquipmentOverview = defineComponent({
  name: "EquipmentOverview",
  props: {
    title: { type: String, required: false, default: "设备情况总览" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const { getEquipmentNumber } = useCommon();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => "default" as const);

    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF"];
    const pieData = ref<PieDataItem[]>([]);
    const deviceTotal = ref(0);
    const onlineCount = ref(0);
    const offlineCount = ref(0);

    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      anyAreaId: undefined as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      areaId: undefined as string | undefined,
      dateRange: [] as string[],
    });

    const resolveTagCode = (): string => buildVisualMenuTagCode(globalState.business.currentMenu);

    const statCards = computed<StatCardItem[]>(() => [
      {
        label: "设备总数",
        value: deviceTotal.value,
        cardClass: "is-total",
        iconSrc: deviceTotalIcon,
        valueClass: "",
        deviceState: undefined,
      },
      {
        label: "在线设备",
        value: onlineCount.value,
        cardClass: "is-online",
        iconSrc: deviceTotalOnlineIcon,
        valueClass: "is-online-value",
        deviceState: true,
      },
      {
        label: "离线设备",
        value: offlineCount.value,
        cardClass: "is-offline",
        iconSrc: deviceTotalOfflineIcon,
        valueClass: "is-offline-value",
        deviceState: false,
      },
    ]);

    /** 优先 device-center 统计；失败时回退 legacy equipmentTotal */
    const loadOverview = async (): Promise<void> => {
      const tagCode = resolveTagCode();
      try {
        const [countRes, areaRes, legacyRes] = await Promise.all([
          getDeviceNumber({ tagCodes: tagCode }).catch(() => undefined),
          getDeviceBuyArea({
            tagCodes: [tagCode],
            areaLevel: globalState.business.currentAreaLeave,
          }).catch(() => []),
          getEquipmentNumber().catch(() => undefined),
        ]);

        if (countRes) {
          deviceTotal.value = Number(countRes.totalNumber) || 0;
          onlineCount.value = Number(countRes.normalNumber) || 0;
          offlineCount.value = Number(countRes.offlineNumber) || 0;
        } else {
          deviceTotal.value = Number(legacyRes?.deviceNum) || 0;
          const statusNums = Array.isArray(legacyRes?.deviceStatusNums) ? legacyRes.deviceStatusNums : [];
          onlineCount.value = Number(statusNums.find((item: { name?: string }) => item.name === "NORMAL")?.num) || 0;
          offlineCount.value = Number(statusNums.find((item: { name?: string }) => item.name === "OFFLINE")?.num) || 0;
        }

        let nextPie = setDeviceData(areaRes, colors) as PieDataItem[];
        const pieSum = nextPie.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

        // 区域分布全 0 但设备总数有值时：用下一级区域重试，再不行则按设备列表聚合并兜底
        if (pieSum === 0 && deviceTotal.value > 0) {
          const deeperAreaRes = await getDeviceBuyArea({
            tagCodes: [tagCode],
            areaLevel: Number(globalState.business.currentAreaLeave || 1) + 1,
          }).catch(() => []);
          nextPie = setDeviceData(deeperAreaRes, colors) as PieDataItem[];
        }

        const deeperSum = nextPie.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        if (deeperSum === 0 && deviceTotal.value > 0) {
          const devices = Array.isArray(legacyRes?.devices) ? legacyRes.devices : [];
          if (devices.length > 0) {
            const areaMap = new Map<string, { areaId?: string; name: string; value: number }>();
            devices.forEach((device: { areaId?: string; areaName?: string }) => {
              const name = device.areaName || "其他";
              const key = String(device.areaId || name);
              const current = areaMap.get(key) || { areaId: device.areaId, name, value: 0 };
              current.value += 1;
              areaMap.set(key, current);
            });
            nextPie = setDeviceData(
              [...areaMap.values()].map((item) => ({
                areaId: item.areaId,
                areaName: item.name,
                deviceNumber: item.value,
              })),
              colors,
            ) as PieDataItem[];
          }
        }

        pieData.value = nextPie;
      } catch {
        deviceTotal.value = 0;
        onlineCount.value = 0;
        offlineCount.value = 0;
        pieData.value = [];
      }
    };

    /** 对齐 public-security-device-count / EquipmentStatusOverview 下钻参数 */
    const openDeviceList = (options?: { deviceState?: boolean; anyAreaId?: string; filterAreaIds?: string[] }): void => {
      Object.assign(deviceParameter, {
        deviceState: options?.deviceState,
        anyAreaId: options?.anyAreaId,
        filterAreaIds: options?.filterAreaIds ?? [],
        tagCodes: [resolveTagCode()],
        // 有具体区域时用 anyAreaId；否则限定当前场景区域
        areaId: options?.anyAreaId ? undefined : globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const onStatClick = (item: StatCardItem): void => {
      openDeviceList({
        deviceState: item.deviceState,
        anyAreaId: globalState.business.currentAreaId,
      });
    };

    const onPieLegendClick = (value?: { name: string }): void => {
      if (!value?.name) return;
      if (value.name === "其他") {
        openDeviceList({
          filterAreaIds: pieData.value.map((item) => item.areaId).filter(Boolean) as string[],
        });
        return;
      }
      const findItem = pieData.value.find((item) => item.name === value.name);
      if (findItem?.areaId) {
        openDeviceList({ anyAreaId: findItem.areaId });
      }
    };

    onMounted(() => {
      void loadOverview();
    });

    const renderStatsRow = (isZoom: boolean): JSX.Element => (
      <div class="stats-row" data-no-zoom>
        {statCards.value.map((item) => (
          <button
            type="button"
            class={["stat-card", item.cardClass]}
            key={`${isZoom ? "zoom-" : ""}${item.label}`}
            onClick={() => onStatClick(item)}
          >
            <span class="stat-icon stat-icon-image" aria-hidden="true">
              <img src={item.iconSrc} alt="" class="stat-icon-img" />
            </span>
            <span class="stat-content">
              <span class="stat-label">{item.label}</span>
              <span class="stat-value-row">
                <span class={["stat-value", item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                </span>
                <span class="stat-unit">台</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderChartRow = (isZoom: boolean): JSX.Element => (
      <div class={["device-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
          <ElevatorAnalysisPie
            class="elevator-analysis-left"
            radius={isMinimalWhite.value ? "78" : "75"}
            ringVariant={pieRingVariant.value}
            pieData={pieData.value}
            onClickbar={onPieLegendClick}
            v-slots={{
              default: () => (
                <>
                  <div class="pie-center-value">
                    <CountTo startVal={0} endVal={deviceTotal.value} separator="" duration={2000} />
                  </div>
                  <div class="pie-center-label">设备总数</div>
                </>
              ),
            }}
          />
        </div>
        <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
          {pieData.value.map((item) => (
            <button type="button" class="legend-item" key={`${isZoom ? "zoom-" : ""}${item.name}`} onClick={() => onPieLegendClick(item)}>
              <span class="legend-left">
                <span class="legend-color" style={{ background: item.color }} />
                <span class="legend-name" title={item.name}>
                  {item.name}
                </span>
              </span>
              <span class="legend-value">{item.value}台</span>
            </button>
          ))}
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          "public-security-device-count",
          "public-security-device-count-panel",
          "equipment-overview-v2-body",
          isZoom ? "is-zoom" : "",
        ]}
      >
        {renderStatsRow(isZoom)}
        {renderChartRow(isZoom)}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root equipment-overview-v2-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} visual-v2-sub-panel v2-panel-card public-security-device-count-panel equipment-overview-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={720}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          parameter={deviceParameter}
          onClose={() => {
            deviceModalShow.value = false;
          }}
        />
      </>
    );
  },
});

export default EquipmentOverview;
