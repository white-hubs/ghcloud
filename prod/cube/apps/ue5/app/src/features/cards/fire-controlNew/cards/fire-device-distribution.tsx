import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import {
  buildVisualDeviceBuyAreaParams,
  buildVisualDeviceNumberParams,
  buildVisualMenuTagCodes,
} from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./fire-device-distribution.module.less";

const deviceTotalOfflineIcon = getThemeImage("device-total-offline.png");
const deviceTotalOnlineIcon = getThemeImage("device-total-online.png");
const deviceTotalIcon = getThemeImage("device-total.png");
const fireDeviceIcon = getThemeImage("fire-device.png");
const LEGEND_VISIBLE_ROWS = 4;

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
  clickKey?: string;
};

export const FireDeviceDistribution = defineComponent({
  name: "FireDeviceDistribution",
  setup() {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const pieData = ref<PieDataItem[]>([]);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      anyAreaId: "" as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [] as string[],
    });

    const deviceStatusData = reactive({
      title: "设备总数",
      total: 0,
      online: 0,
      offline: 0,
    });

    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF"];

    const statCards = computed<StatCardItem[]>(() => [
      {
        label: deviceStatusData.title,
        value: deviceStatusData.total,
        cardClass: "is-total",
        iconSrc: deviceTotalIcon,
        valueClass: "",
        clickKey: undefined,
      },
      {
        label: "在线设备",
        value: deviceStatusData.online,
        cardClass: "is-online",
        iconSrc: deviceTotalOnlineIcon,
        valueClass: "is-online-value",
        clickKey: "在线设备",
      },
      {
        label: "离线设备",
        value: deviceStatusData.offline,
        cardClass: "is-offline",
        iconSrc: deviceTotalOfflineIcon,
        valueClass: "is-offline-value",
        clickKey: "离线设备",
      },
    ]);
    const getDeviceDistribution = async () => {
      const menuId = globalState.business.currentMenu;
      const res = await getDeviceNumber(buildVisualDeviceNumberParams(menuId));
      deviceStatusData.total = res.totalNumber;
      deviceStatusData.online = res.normalNumber;
      deviceStatusData.offline = res.offlineNumber;
      const data = await getDeviceBuyArea(buildVisualDeviceBuyAreaParams(menuId, globalState.business.currentAreaLeave));
      pieData.value = setDeviceData(data, colors);
    };

    const handelClickItemize = (item: StatCardItem) => {
      deviceParameter.filterAreaIds = [];
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      if (item.clickKey === "离线设备") {
        deviceParameter.deviceState = false;
      } else if (item.clickKey === "在线设备") {
        deviceParameter.deviceState = true;
      } else {
        deviceParameter.deviceState = undefined;
      }
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };

    const handleClickPie = (value: { name: string }) => {
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      const { name } = value;
      if (name === "其他") {
        deviceParameter.anyAreaId = undefined;
        deviceParameter.filterAreaIds = pieData.value.map((e) => e.areaId).filter(Boolean) as string[];
        deviceModalShow.value = true;
      } else {
        deviceParameter.filterAreaIds = [];
        const findItem = pieData.value.find((res) => res.name === name);
        if (findItem) {
          deviceParameter.anyAreaId = findItem.areaId;
          deviceModalShow.value = true;
        }
      }
    };

    onMounted(() => {
      void getDeviceDistribution();
    });

    const bindStatCardPointer = (handler: () => void) => ({
      type: "button" as const,
      onClick: (event: MouseEvent) => {
        event.stopPropagation();
        handler();
      },
      onPointerdown: (event: PointerEvent) => {
        event.stopPropagation();
      },
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["fire-device-distribution", "fire-device-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="stats-row" data-no-zoom>
          {statCards.value.map((item) => (
            <button
              key={`${isZoom ? "zoom-" : ""}${item.label}`}
              {...bindStatCardPointer(() => handelClickItemize(item))}
              class={["stat-card", item.cardClass]}
            >
              <div class="stat-icon stat-icon-image">
                <img src={item.iconSrc} alt="" class="stat-icon-img" />
              </div>
              <div class="stat-content">
                <div class="stat-label">{item.label}</div>
                <div class={["stat-value", item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={4000} />
                </div>
              </div>
            </button>
          ))}
        </div>
        <div class={["device-chart-row", isZoom ? "is-zoom" : "", isMinimalWhite.value ? "is-clean-ring" : ""]}>
          <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
            <ElevatorAnalysisPie
              class="elevator-analysis-left"
              radius={isMinimalWhite.value ? "78" : "75"}
              ringVariant={pieRingVariant.value}
              pieData={pieData.value}
              onClickbar={handleClickPie}
              v-slots={{
                default: () => (
                  <>
                    <div class="pie-center-value">
                      <CountTo startVal={0} endVal={deviceStatusData.total} separator="" duration={2000} />
                    </div>
                    <div class="pie-center-label">设备总数</div>
                  </>
                ),
              }}
            />
          </div>
          <div
            class={[
              "legend-list",
              isZoom ? "is-zoom" : "",
              !isZoom && pieData.value.length > 0 && pieData.value.length <= LEGEND_VISIBLE_ROWS ? "is-centered" : "",
            ]}
          >
            {pieData.value.map((item) => (
              <button
                type="button"
                key={`${isZoom ? "zoom-" : ""}${item.name}`}
                class="legend-item"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClickPie(item);
                }}
                onPointerdown={(event) => event.stopPropagation()}
              >
                <span class="legend-left">
                  <i class="legend-color" style={{ backgroundColor: item.color }} />
                  <span class="legend-name" title={item.name}>
                    {item.name}
                  </span>
                </span>
                <span class="legend-value">
                  {item.value}
                  <em class="legend-unit">个</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="消防设备分布情况"
            class="visual-v2-sub-panel v2-panel-card fire-panel-v2 fire-device-panel fire-device-distribution-panel"
            zoomable
            zoom-title="消防设备分布情况详情"
            zoom-width={720}
            v-slots={{
              titleIcon: () => <img src={fireDeviceIcon} alt="" class="title-card-icon" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        {deviceModalShow.value ? (
          <ModalEquipmentAllTable
            showModal={deviceModalShow.value}
            onClose={() => {
              deviceModalShow.value = false;
            }}
            parameter={deviceParameter}
          />
        ) : null}
      </>
    );
  },
});

export default FireDeviceDistribution;
