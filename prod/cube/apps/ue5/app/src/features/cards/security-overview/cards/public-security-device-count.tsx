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

import "./public-security-device-count.module.less";

const deviceSituationIcon = getThemeImage("device-situation.png");
const deviceTotalOfflineIcon = getThemeImage("device-total-offline.png");
const deviceTotalOnlineIcon = getThemeImage("device-total-online.png");
const deviceTotalIcon = getThemeImage("device-total.png");

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
};

export const PublicSecurityDeviceCount = defineComponent({
  name: "PublicSecurityDeviceCount",
  props: {
    title: { type: String, default: "设备统计" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    // 与「报警占比」一致：外装饰环 + 刻度 + 数据环，保留背景轨
    const pieRingVariant = computed(() => "default" as const);

    const { globalState } = useStateStore();
    const pieData = ref<PieDataItem[]>([]);
    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF"];

    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 0,
      itemize: [
        { label: "在线设备", value: 0, color: "#26C2BC" },
        { label: "离线设备", value: 0, color: "#FF4D4F" },
      ],
    });

    const statCards = computed<StatCardItem[]>(() => [
      {
        label: deviceStatisticsData.title,
        value: deviceStatisticsData.total,
        cardClass: "is-total",
        iconSrc: deviceTotalIcon,
        valueClass: "",
      },
      {
        label: deviceStatisticsData.itemize[0].label,
        value: deviceStatisticsData.itemize[0].value,
        cardClass: "is-online",
        iconSrc: deviceTotalOnlineIcon,
        valueClass: "is-online-value",
      },
      {
        label: deviceStatisticsData.itemize[1].label,
        value: deviceStatisticsData.itemize[1].value,
        cardClass: "is-offline",
        iconSrc: deviceTotalOfflineIcon,
        valueClass: "is-offline-value",
      },
    ]);

    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      anyAreaId: "" as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [] as string[],
    });

    const getDeviceDistribution = async (): Promise<void> => {
      const menuId = globalState.business.currentMenu;
      const res = await getDeviceNumber(buildVisualDeviceNumberParams(menuId));
      deviceStatisticsData.total = res.totalNumber;
      deviceStatisticsData.itemize[0].value = res.normalNumber;
      deviceStatisticsData.itemize[1].value = res.offlineNumber;
      const data = await getDeviceBuyArea(buildVisualDeviceBuyAreaParams(menuId, globalState.business.currentAreaLeave));
      pieData.value = setDeviceData(data, colors);
    };

    const handelClickDeviceItemize = (value?: { name: string }): void => {
      if (!value) return;
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      const { name } = value;
      if (value.name === "其他") {
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

    const handelClickItemize = (item: StatCardItem): void => {
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      if (item.label === "在线设备") {
        deviceParameter.deviceState = true;
      } else if (item.label === "离线设备") {
        deviceParameter.deviceState = false;
      } else {
        deviceParameter.deviceState = undefined;
      }
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };

    const closeModal = (): void => {
      deviceModalShow.value = false;
    };

    onMounted(() => {
      void getDeviceDistribution();
    });

    const renderStatsRow = (isZoom: boolean): JSX.Element => (
      <div class="stats-row" data-no-zoom>
        {statCards.value.map((item) => (
          <div class={["stat-card", item.cardClass]} key={`${isZoom ? "zoom-" : ""}${item.label}`} onClick={() => handelClickItemize(item)}>
            <div class="stat-icon stat-icon-image">
              <img src={item.iconSrc} alt="" class="stat-icon-img" />
            </div>
            <div class="stat-content">
              <div class="stat-label">{item.label}</div>
              <div class="stat-value-row">
                <div class={["stat-value", item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={4000} />
                </div>
              </div>
            </div>
          </div>
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
            onClickbar={handelClickDeviceItemize}
            v-slots={{
              default: () => (
                <>
                  <div class="pie-center-value">
                    <CountTo startVal={0} endVal={deviceStatisticsData.total} separator="" duration={2000} />
                  </div>
                  <div class="pie-center-label">设备总数</div>
                </>
              ),
            }}
          />
        </div>
        <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
          {pieData.value.map((item) => (
            <button
              type="button"
              class="legend-item"
              key={`${isZoom ? "zoom-" : ""}${item.name}`}
              onClick={() => handelClickDeviceItemize(item)}
            >
              <span class="legend-left">
                <i class="legend-color" style={{ backgroundColor: item.color }} />
                <span class="legend-name" title={item.name}>
                  {item.name}
                </span>
              </span>
              <span class="legend-value">
                {item.value}
                <em class="legend-unit">台</em>
              </span>
            </button>
          ))}
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["public-security-device-count", "public-security-device-count-panel", isZoom ? "is-zoom" : ""]}>
        {renderStatsRow(isZoom)}
        {renderChartRow(isZoom)}
      </div>
    );

    return () => (
      <>
        <div class="panel overview-left">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card public-security-device-count-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={680}
            v-slots={{
              titleIcon: () => <img src={deviceSituationIcon} alt="" class="title-icon-img" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable show-modal={deviceModalShow.value} parameter={deviceParameter} onClose={closeModal} />
      </>
    );
  },
});

export default PublicSecurityDeviceCount;
