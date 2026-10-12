import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { applicationCode } from "@/infrastructure/api/saftsecurity/overview";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "@/features/cards/overview/cards/overview-v2-shared.module.less";
import "./security-device-count.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

interface DevicePieItem {
  name: string;
  value: number;
  color: string;
  tagCode: string;
  rate: number;
}

interface DeviceStatItem {
  label: string;
  value: number;
  color: string;
  className: string;
  iconSrc: string;
}

export const SecurityDeviceCount = defineComponent({
  name: "SecurityDeviceCount",
  props: {
    title: { type: String, required: false, default: "设备统计" },
  },
  setup(props) {
    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#F6C343"];
    const pieData = ref<DevicePieItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 0,
      itemize: [
        { label: "在线设备", value: 0, color: "#2AE8BD", className: "is-online", iconSrc: deviceOnlineIcon },
        { label: "离线设备", value: 0, color: "#FFAB10", className: "is-offline", iconSrc: deviceOfflineIcon },
      ] as DeviceStatItem[],
    });

    const hasStructure = computed(() => pieData.value.length > 0);

    const getDeviceStatic = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.deviceStatusEquipmentStatistics([]);
        deviceStatisticsData.total = Number(res.totalNumber) || 0;
        deviceStatisticsData.itemize[0].value = Number(res.normalNumber) || 0;
        deviceStatisticsData.itemize[1].value = Number(res.offlineNumber) || 0;
        const data = await cubeDeviceCenterService.deviceTagPercentage([...applicationCode.keys()]);
        const list = Array.isArray(data) ? data : [];
        const sum = list.reduce((acc: number, item: { tagDeviceNumber?: number }) => acc + (Number(item.tagDeviceNumber) || 0), 0) || 1;
        pieData.value = list.map((item: { tagCode?: string; tagDeviceNumber?: number }, index: number) => {
          const value = Number(item.tagDeviceNumber) || 0;
          return {
            name: applicationCode.get(item.tagCode || "") || "其他",
            value,
            color: colors[index % colors.length],
            tagCode: item.tagCode || `other-${index}`,
            rate: Math.round((value / sum) * 1000) / 10,
          };
        });
      } catch {
        pieData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const deviceModalShow = ref(false);
    const deviceParameter = ref<Record<string, any>>({
      deviceState: undefined,
      tagCodes: [],
      areaId: undefined,
      filterTagCodes: [],
    });

    const handelClickDeviceItemize = (item?: DevicePieItem): void => {
      if (!item) return;
      if (item.name === "其他") {
        deviceParameter.value.tagCodes = [];
        deviceParameter.value.filterTagCodes = pieData.value
          .map((row) => (row.tagCode !== "other" ? row.tagCode : undefined))
          .filter(Boolean);
      } else {
        deviceParameter.value.tagCodes = [item.tagCode];
        deviceParameter.value.filterTagCodes = [];
      }
      deviceParameter.value.deviceState = undefined;
      deviceModalShow.value = true;
    };

    const handelClickItemize = (value?: DeviceStatItem | { label: string }): void => {
      if (value?.label === "在线设备") {
        deviceParameter.value.deviceState = true;
      } else if (value?.label === "离线设备") {
        deviceParameter.value.deviceState = false;
      } else {
        deviceParameter.value.deviceState = undefined;
      }
      deviceParameter.value.tagCodes = [...applicationCode.keys()];
      deviceParameter.value.filterTagCodes = [];
      deviceModalShow.value = true;
    };

    onMounted(() => {
      void getDeviceStatic();
    });

    const renderStats = (): JSX.Element => (
      <div class="safe-overview-device-stats" data-no-zoom>
        <button
          type="button"
          class="device-status-card is-total"
          onClick={() =>
            handelClickItemize({
              label: "设备总数",
              value: deviceStatisticsData.total,
              color: "#2F8DFF",
              className: "is-total",
              iconSrc: deviceTotalIcon,
            })
          }
        >
          <span class="device-status-icon">
            <img src={deviceTotalIcon} alt="" />
          </span>
          <span class="device-status-main">
            <span class="device-status-label">{deviceStatisticsData.title}</span>
            <span class="device-status-value is-total-value">
              <CountTo startVal={0} endVal={deviceStatisticsData.total} separator="" duration={1600} />
            </span>
          </span>
        </button>
        {deviceStatisticsData.itemize.map((item) => (
          <button type="button" class={["device-status-card", item.className]} key={item.label} onClick={() => handelClickItemize(item)}>
            <span class="device-status-icon">
              <img src={item.iconSrc} alt="" />
            </span>
            <span class="device-status-main">
              <span class="device-status-label">{item.label}</span>
              <span class="device-status-value" style={{ color: item.color }}>
                <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderPieLegend = (isZoom: boolean): JSX.Element => (
      <div class={["safe-device-legend", isZoom ? "is-zoom" : ""]}>
        {pieData.value.map((item) => (
          <button
            type="button"
            class="safe-device-legend-item"
            key={item.tagCode || item.name}
            onClick={() => handelClickDeviceItemize(item)}
          >
            <span class="safe-device-legend-name">
              <i class="safe-device-legend-dot" style={{ backgroundColor: item.color }} />
              <span class="safe-device-legend-name-text" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="safe-device-legend-value">
              {item.value}
              <em class="safe-device-legend-unit">个</em>
            </span>
          </button>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body safe-overview-device-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderStats()}
        <div class={["overview-v2-pie-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasStructure.value ? (
            <>
              <div class={["safe-device-pie-wrap", isZoom ? "is-zoom" : ""]}>
                <ElevatorAnalysisPie class="overview-v2-pie" pie-class="overview-v2-pie-chart" pieData={pieData.value}>
                  <div class="overview-v2-pie-center is-clickable" onClick={() => handelClickItemize()}>
                    <div class="total-num">
                      <CountTo startVal={0} endVal={deviceStatisticsData.total} separator="" duration={1600} />
                    </div>
                    <div>设备总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              {renderPieLegend(isZoom)}
            </>
          ) : (
            <div class={["overview-v2-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root overview-v2-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel safe-overview-panel safe-device-count-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          onClose={() => (deviceModalShow.value = false)}
          parameter={deviceParameter.value}
        />
      </>
    );
  },
});

export default SecurityDeviceCount;
