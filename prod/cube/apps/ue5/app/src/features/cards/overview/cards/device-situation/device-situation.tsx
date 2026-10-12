import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { CountTo } from "vue3-count-to";

import { formatOverviewFullNumber } from "../../utils/format-stat-number";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceSituation } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import NoData from "@/shared-ui/panel/noData";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";
import "./device-situation.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");

interface PieItem {
  color: string;
  value: number;
  label: string;
  name: string;
  percent: number;
  applicationCode: string;
}

interface StatusItem {
  label: string;
  value: number;
  color: string;
  key: string;
  cardClass: string;
}

export const DeviceSituation = defineComponent({
  name: "DeviceSituation",
  setup() {
    const deviceModalShow = ref(false);
    const deviceParameter = ref<Record<string, unknown>>({ status: "" });
    const pieColors = ["#2F8DFF", "#19F8F7", "#FFAB10", "#F14545", "#655DD1", "#00F27B"];
    const pieData = ref<PieItem[]>([]);
    const hasPieData = computed(() => pieData.value.length > 0);

    const analysis = reactive({
      total: 0,
      itemize: [
        { label: "在线", value: 0, color: "#00F27B", key: "NORMAL", cardClass: "is-online" },
        { label: "离线", value: 0, color: "#FFAB10", key: "OFFLINE", cardClass: "is-offline" },
        { label: "故障", value: 0, color: "#FFC700", key: "TROUBLE", cardClass: "is-trouble" },
        { label: "报警", value: 0, color: "#F14545", key: "ALARM", cardClass: "is-alarm" },
      ] as StatusItem[],
    });

    const openDeviceModal = (payload?: { status?: string; applicationCode?: string }): void => {
      deviceParameter.value = {
        status: payload?.status ?? "",
        ...(payload?.applicationCode ? { applicationCode: payload.applicationCode } : {}),
      };
      deviceModalShow.value = true;
    };

    const requestDeviceSituation = async (): Promise<void> => {
      try {
        const res = await getDeviceSituation();
        analysis.total = Number(res?.deviceNum) || 0;
        analysis.itemize.forEach((item) => {
          const hit = (res?.deviceStatusNums || []).find((element: { name?: string }) => element.name === item.key);
          item.value = Number(hit?.num) || 0;
        });

        const apps = Array.isArray(res?.deviceApplicationNums) ? res.deviceApplicationNums : [];
        pieData.value = apps.map((item: any, index: number) => {
          const value = Number(item.num) || 0;
          const percent = Math.round((Number(item.proportion) || 0) * 1000) / 10;
          return {
            label: item.applicationName || "--",
            name: item.applicationName || "--",
            value,
            percent,
            color: pieColors[index % pieColors.length],
            applicationCode: item.applicationCode,
          };
        });
      } catch {
        analysis.total = 0;
        analysis.itemize.forEach((item) => {
          item.value = 0;
        });
        pieData.value = [];
      }
    };

    onMounted(() => {
      void requestDeviceSituation();
    });

    const renderLegend = (isZoom: boolean): JSX.Element => (
      <div class={["overview-hd-legend", isZoom ? "is-zoom" : ""]}>
        {pieData.value.map((item) => (
          <button
            type="button"
            class="overview-hd-legend-item"
            key={item.applicationCode || item.name}
            onClick={() => openDeviceModal({ applicationCode: item.applicationCode })}
          >
            <span class="overview-hd-legend-left">
              <i class="overview-hd-dot" style={{ backgroundColor: item.color }} />
              <span class="overview-hd-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="overview-hd-metrics">
              <span class="overview-hd-value" title={formatOverviewFullNumber(item.value)}>
                {formatOverviewFullNumber(item.value)}
              </span>
              <span class="overview-hd-share">{item.percent}%</span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body", "device-situation-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <button type="button" class="device-situation-total-card" onClick={() => openDeviceModal()}>
          <span class="situation-v2-total-icon">
            <img src={deviceTotalIcon} alt="" />
          </span>
          <span class="overview-v2-stat-main">
            <CountTo startVal={0} endVal={analysis.total} duration={1200} class="overview-v2-stat-value" />
            <span class="overview-v2-stat-label">设备总数</span>
          </span>
        </button>

        <div class="situation-v2-status-grid" data-no-zoom>
          {analysis.itemize.map((item) => (
            <button
              type="button"
              class={["situation-v2-status-card", item.cardClass]}
              key={item.key}
              onClick={() => openDeviceModal({ status: item.key })}
            >
              <CountTo startVal={0} endVal={item.value} duration={1200} class="situation-v2-status-value" />
              <span class="situation-v2-status-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div class={["overview-hd-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasPieData.value ? (
            <>
              <div class={["overview-hd-pie-wrap", isZoom ? "is-zoom" : ""]}>
                <ElevatorAnalysisPie class="overview-hd-pie" pie-class="overview-hd-pie-chart" pieData={pieData.value}>
                  <div class="overview-hd-pie-center">
                    <div class="overview-hd-pie-value" title={formatOverviewFullNumber(analysis.total)}>
                      {formatOverviewFullNumber(analysis.total)}
                    </div>
                    <div class="overview-hd-pie-label">设备总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              {renderLegend(isZoom)}
            </>
          ) : (
            <div class={["overview-hd-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="overview-v2-root">
          <SubPanelTemplate
            title="设备态势"
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel device-situation-v2-panel"
            zoomable
            zoom-title="设备态势详情"
            zoom-width={820}
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
          parameter={deviceParameter.value}
        />
      </>
    );
  },
});

export default DeviceSituation;
