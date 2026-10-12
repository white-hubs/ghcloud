import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { CountTo } from "vue3-count-to";

import { formatOverviewFullNumber } from "../../utils/format-stat-number";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getMonitorSituation } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";
import "../device-situation/device-situation.module.less";
import "./monitor-situation.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");

interface PieItem {
  color: string;
  value: number;
  label: string;
  name: string;
  percent: number;
  areaId?: string;
}

interface StatusItem {
  label: string;
  value: number;
  color: string;
  key: string;
  cardClass: string;
}

export const MonitorSituation = defineComponent({
  name: "MonitorSituation",
  setup() {
    const deviceModalShow = ref(false);
    const deviceParameter = ref<Record<string, unknown>>({ applicationCode: "SECURITY_MONITORING" });
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

    const openDeviceModal = (payload?: { status?: string; areaId?: string }): void => {
      deviceParameter.value = {
        applicationCode: "SECURITY_MONITORING",
        status: payload?.status ?? "",
        ...(payload?.areaId ? { areaId: payload.areaId } : {}),
      };
      deviceModalShow.value = true;
    };

    const requestMonitorSituation = async (): Promise<void> => {
      try {
        const res = await getMonitorSituation();
        analysis.total = Number(res?.deviceNum) || 0;
        analysis.itemize.forEach((item) => {
          const hit = (res?.deviceStatusNums || []).find((element: { name?: string }) => element.name === item.key);
          item.value = Number(hit?.num) || 0;
        });

        const areas = Array.isArray(res?.deviceAreaNum) ? res.deviceAreaNum : [];
        pieData.value = areas.map((item: any, index: number) => {
          const parts = String(item.areaName || "").split("/");
          const areaName = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.areaName || "--";
          const value = Number(item.num) || 0;
          const percent = Math.round((Number(item.proportion) || 0) * 1000) / 10;
          return {
            label: areaName,
            name: areaName,
            value,
            percent,
            color: pieColors[index % pieColors.length],
            areaId: item.areaId,
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
      void requestMonitorSituation();
    });

    const renderLegend = (isZoom: boolean): JSX.Element => (
      <div class={["overview-hd-legend", isZoom ? "is-zoom" : ""]}>
        {pieData.value.map((item) => (
          <button
            type="button"
            class="overview-hd-legend-item"
            key={item.areaId || item.name}
            onClick={() => openDeviceModal({ areaId: item.areaId })}
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
      <div class={["overview-v2-body", "monitor-situation-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <button type="button" class="monitor-situation-total-card" onClick={() => openDeviceModal()}>
          <span class="situation-v2-total-icon">
            <img src={deviceTotalIcon} alt="" />
          </span>
          <span class="overview-v2-stat-main">
            <CountTo startVal={0} endVal={analysis.total} duration={1200} class="overview-v2-stat-value" />
            <span class="overview-v2-stat-label">设备总数</span>
          </span>
        </button>

        <div class="situation-v2-status-grid is-two-by-two" data-no-zoom>
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
            <>
              <div class={["overview-hd-pie-wrap", isZoom ? "is-zoom" : ""]}>
                <ElevatorAnalysisPie
                  class="overview-hd-pie"
                  pie-class="overview-hd-pie-chart"
                  pieData={[
                    { name: "在线", value: analysis.itemize[0].value, color: analysis.itemize[0].color },
                    { name: "离线", value: analysis.itemize[1].value, color: analysis.itemize[1].color },
                    { name: "故障", value: analysis.itemize[2].value, color: analysis.itemize[2].color },
                    { name: "报警", value: analysis.itemize[3].value, color: analysis.itemize[3].color },
                  ]}
                >
                  <div class="overview-hd-pie-center">
                    <div class="overview-hd-pie-value" title={formatOverviewFullNumber(analysis.total)}>
                      {formatOverviewFullNumber(analysis.total)}
                    </div>
                    <div class="overview-hd-pie-label">设备总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              <div class={["overview-hd-legend", isZoom ? "is-zoom" : ""]}>
                {analysis.itemize.map((item) => (
                  <button
                    type="button"
                    class="overview-hd-legend-item"
                    key={item.key}
                    onClick={() => openDeviceModal({ status: item.key })}
                  >
                    <span class="overview-hd-legend-left">
                      <i class="overview-hd-dot" style={{ backgroundColor: item.color }} />
                      <span class="overview-hd-name">{item.label}</span>
                    </span>
                    <span class="overview-hd-metrics">
                      <span class="overview-hd-value">{formatOverviewFullNumber(item.value)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="overview-v2-root">
          <SubPanelTemplate
            title="监控态势"
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel monitor-situation-v2-panel"
            zoomable
            zoom-title="监控态势详情"
            zoom-width={820}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-monitor" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          parameter={deviceParameter.value}
          onClose={() => {
            deviceModalShow.value = false;
          }}
        />
      </>
    );
  },
});

export default MonitorSituation;
