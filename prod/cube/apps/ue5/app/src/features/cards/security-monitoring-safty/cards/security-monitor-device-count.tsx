import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./security-monitor-device-count.module.less";

const deviceSituationIcon = getThemeImage("device-situation.png");
const offlineDeviceIcon = getThemeImage("device-total-offline.png");
const onlineDeviceIcon = getThemeImage("device-total-online.png");
const deviceTotalIcon = getThemeImage("device-total.png");

const cardIcons = {
  deviceTotal: deviceTotalIcon,
  onlineDevice: onlineDeviceIcon,
  offlineDevice: offlineDeviceIcon,
} as const;

type PieDataItem = {
  name: string;
  value: number;
  color: string;
  areaId?: string;
};

export const SecurityMonitorDeviceCount = defineComponent({
  name: "SecurityMonitorDeviceCount",
  props: {
    title: { type: String, default: "监控设备统计" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const pieData = ref<PieDataItem[]>([]);
    let timer: ReturnType<typeof setInterval> | null = null;
    const deviceAllModalShow = ref(false);
    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF"];

    const deviceAllParameter = reactive({
      anyAreaId: "" as string | undefined,
      areaId: undefined as string | undefined,
      tagCodes: [] as string[],
      filterAreaIds: [] as string[],
      deviceState: undefined as boolean | undefined,
      dateRange: [] as string[],
    });

    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 0,
      online: 0,
      offline: 0,
    });

    const statCards = computed(() => [
      {
        label: deviceStatisticsData.title,
        value: deviceStatisticsData.total,
        cardClass: "is-total",
        iconSrc: cardIcons.deviceTotal,
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        label: "在线设备",
        value: deviceStatisticsData.online,
        cardClass: "is-online",
        iconSrc: cardIcons.onlineDevice,
        valueClass: "is-online-value",
        clickKey: "在线设备",
      },
      {
        label: "离线设备",
        value: deviceStatisticsData.offline,
        cardClass: "is-offline",
        iconSrc: cardIcons.offlineDevice,
        valueClass: "is-offline-value",
        clickKey: "离线设备",
      },
    ]);

    const changeEventTimeCount = async (): Promise<void> => {
      const res = await getDeviceNumber({ tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu) });
      deviceStatisticsData.total = res.totalNumber;
      deviceStatisticsData.online = res.normalNumber;
      deviceStatisticsData.offline = res.offlineNumber;
      const data = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave,
      });
      pieData.value = setDeviceData(data, colors);
    };

    const deviceClickItemize = (value?: string): void => {
      if (value === "在线设备") {
        deviceAllParameter.deviceState = true;
      } else if (value === "离线设备") {
        deviceAllParameter.deviceState = false;
      } else {
        deviceAllParameter.deviceState = undefined;
      }
      deviceAllParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceAllParameter.anyAreaId = undefined;
      deviceAllParameter.filterAreaIds = [];
      deviceAllParameter.areaId = undefined;
      deviceAllModalShow.value = true;
    };

    const alarmOpen = (value: { name: string }): void => {
      if (value.name === "其他") {
        deviceAllParameter.anyAreaId = undefined;
        deviceAllParameter.filterAreaIds = pieData.value.map((e) => e.areaId).filter(Boolean) as string[];
      } else {
        deviceAllParameter.anyAreaId = pieData.value.find((e) => e.name === value.name)?.areaId;
        deviceAllParameter.filterAreaIds = [];
        deviceAllParameter.deviceState = undefined;
      }
      deviceAllParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceAllModalShow.value = true;
    };

    const init = (): void => {
      void changeEventTimeCount();
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        if (timer) clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
        );
        init();
      },
    );

    onMounted(() => {
      init();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderStatsRow = (): JSX.Element => (
      <div class="stats-row" data-no-zoom>
        {statCards.value.map((item) => (
          <button
            type="button"
            class={["stat-card", item.cardClass]}
            key={item.label}
            onClick={(event) => {
              event.stopPropagation();
              deviceClickItemize(item.clickKey);
            }}
            onPointerdown={(event) => event.stopPropagation()}
          >
            <span class="stat-icon stat-icon-image" aria-hidden="true">
              <img src={item.iconSrc} alt="" class="stat-icon-img" />
            </span>
            <span class="stat-content">
              <span class="stat-label">{item.label}</span>
              <span class={["stat-value", item.valueClass]}>
                <CountTo startVal={0} endVal={item.value} separator="" duration={4000} />
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderLegendList = (isZoom: boolean): JSX.Element => (
      <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
        {pieData.value.map((item) => (
          <button
            type="button"
            class="legend-item"
            key={`${isZoom ? "zoom-" : ""}${item.name}`}
            onClick={(event) => {
              event.stopPropagation();
              alarmOpen(item);
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
    );

    const renderChartRow = (isZoom: boolean): JSX.Element => (
      <div class={["device-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
          <ElevatorAnalysisPie
            class="elevator-analysis-left"
            pieData={pieData.value}
            onClickbar={alarmOpen}
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
        {renderLegendList(isZoom)}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["security-monitor-device-count-v2", "security-monitor-device-count-v2-panel", isZoom ? "is-zoom" : ""]}>
        {renderStatsRow()}
        {renderChartRow(isZoom)}
      </div>
    );

    return () => (
      <div class="v2-panel-root security-monitor-device-count-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card security-monitor-device-count-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={deviceSituationIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <ModalEquipmentAllTable
          showModal={deviceAllModalShow.value}
          parameter={deviceAllParameter}
          onClose={() => {
            deviceAllModalShow.value = false;
          }}
        />
      </div>
    );
  },
});

export default SecurityMonitorDeviceCount;
