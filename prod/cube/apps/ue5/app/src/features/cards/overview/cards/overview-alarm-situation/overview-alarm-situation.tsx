import moment from "moment";
import { computed, defineComponent, onMounted, ref } from "vue";
import { CountTo } from "vue3-count-to";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAlarmSituation } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";

const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmActualIcon = getThemeImage("alarm-count-unhandled.png");
const alarmImpracticalIcon = getThemeImage("alarm-count-handled.png");

interface AlarmPieItem {
  color: string;
  value: number;
  name: string;
  label: string;
  percent: number;
  id?: string;
}

export const OverviewAlarmSituation = defineComponent({
  name: "OverviewAlarmSituation",
  setup() {
    const handleAlarmTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")],
    });
    const alarmParameter = ref<Record<string, any>>({});
    const alarmModalStatus = ref("");
    const alarmModalShow = ref(false);
    const alarmTotal = ref(0);
    const alarmSituationStatistic = ref([
      {
        label: "报警总数",
        value: 0,
        img: alarmTotalIcon,
        color: "#2F8DFF",
        key: "alarmNum",
        alarmHandleResult: "",
      },
      {
        label: "真实数",
        value: 0,
        img: alarmActualIcon,
        color: "#F14545",
        key: "alarmActualNum",
        alarmHandleResult: "ALARM_ACTUAL",
      },
      {
        label: "误报数",
        value: 0,
        img: alarmImpracticalIcon,
        color: "#FFC700",
        key: "alarmImpracticalNum",
        alarmHandleResult: "ALARM_IMPRACTICAL",
      },
    ]);
    const alarmSituationColors = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const alarmSituationPieData = ref<AlarmPieItem[]>([]);
    const hasPieData = computed(() => alarmSituationPieData.value.length > 0);

    const handelClickAlarmNum = (item: { alarmHandleResult: string }): void => {
      alarmModalStatus.value = "";
      alarmModalShow.value = true;
      alarmParameter.value = {
        dateRange: [...(handleAlarmTime.value?.dateRange ?? [])],
        alarmHandleResult: item.alarmHandleResult,
      };
    };

    const handelClickItemize = (item: AlarmPieItem): void => {
      alarmModalStatus.value = "";
      alarmModalShow.value = true;
      alarmParameter.value = {
        dateRange: [...(handleAlarmTime.value?.dateRange ?? [])],
        alarmTypeId: item.id,
      };
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
      alarmModalStatus.value = "";
    };

    const rquesestAlarmSituation = async (): Promise<void> => {
      if (!handleAlarmTime.value?.dateRange?.length) return;
      const res = await getAlarmSituation({
        period: handleAlarmTime.value.dateRange.join(","),
        type: handleAlarmTime.value.timeType,
      });
      alarmTotal.value = res.alarmBimStatistics.alarmNum;
      alarmSituationStatistic.value.forEach((item) => {
        item.value = res.alarmBimStatistics[item.key];
      });
      alarmSituationPieData.value = res.alarmBimStatisticsTopChains
        .map((item: any, index: number) => {
          const name = item.name || "--";
          return {
            name,
            label: name,
            value: Number(item.alarmNum) || 0,
            percent: Math.round(Number(item.ratio || 0) * 100) / 100,
            color: alarmSituationColors[index % 4],
            id: item.id,
          };
        })
        .sort((a: AlarmPieItem, b: AlarmPieItem) => b.value - a.value);
    };

    onMounted(() => {
      void rquesestAlarmSituation();
    });

    const renderLegend = (isZoom: boolean): JSX.Element => (
      <div class={["overview-hd-legend", isZoom ? "is-zoom" : ""]}>
        {alarmSituationPieData.value.map((item) => (
          <button type="button" class="overview-hd-legend-item" key={item.id || item.name} onClick={() => handelClickItemize(item)}>
            <span class="overview-hd-legend-left">
              <i class="overview-hd-dot" style={{ backgroundColor: item.color }} />
              <span class="overview-hd-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="overview-hd-metrics">
              <span class="overview-hd-value">{item.value}</span>
              <span class="overview-hd-share">{item.percent}%</span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="overview-v2-summary-grid" data-no-zoom>
          {alarmSituationStatistic.value.map((item) => (
            <div
              class={[
                "overview-v2-stat-card",
                item.key === "alarmActualNum" ? "is-actual" : "",
                item.key === "alarmImpracticalNum" ? "is-impractical" : "",
              ]}
              key={item.key}
              onClick={() => handelClickAlarmNum(item)}
              data-no-zoom
            >
              <div class="overview-v2-stat-icon">
                <img src={item.img} alt="" />
              </div>
              <div class="overview-v2-stat-main">
                <CountTo startVal={0} endVal={item.value} duration={1200} class="overview-v2-stat-value" style={{ color: item.color }} />
                <div class="overview-v2-stat-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div class={["overview-hd-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasPieData.value ? (
            <>
              <div class={["overview-hd-pie-wrap", isZoom ? "is-zoom" : ""]}>
                <ElevatorAnalysisPie class="overview-hd-pie" pie-class="overview-hd-pie-chart" pieData={alarmSituationPieData.value}>
                  <div class="overview-hd-pie-center">
                    <div class="overview-hd-pie-value">{alarmTotal.value}</div>
                    <div class="overview-hd-pie-label">报警总数</div>
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
            title="报警态势"
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel overview-alarm-v2-panel"
            zoomable
            zoom-title="报警态势详情"
            zoom-width={820}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-alarm" />,
              extra: () => (
                <div class="access-control-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={handleAlarmTime.value}
                    onUpdate:modelValue={(v) => {
                      handleAlarmTime.value = v;
                    }}
                    onSearch={() => {
                      void rquesestAlarmSituation();
                    }}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        {alarmModalShow.value && (
          <ModalAlarmTable
            showModal={alarmModalShow.value}
            alarmStatus={alarmModalStatus.value}
            onClose={closeModal}
            parameter={alarmParameter.value}
          />
        )}
      </>
    );
  },
});

export default OverviewAlarmSituation;
