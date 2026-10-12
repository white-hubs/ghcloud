import { defineComponent } from "vue";
import { reactive, onMounted } from "vue";
import { CountTo } from "vue3-count-to";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { arrangeTodayStat } from "@/infrastructure/api/attendance";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";

export const MonitorPersonnelStatistics = defineComponent({
  name: "MonitorPersonnelStatistics",
  setup() {
    const personStatistic = reactive({
      total: 0,
      onDutyNum: 0,
      leaveNum: 0,
    });

    const requestStateTotal = async () => {
      const res = await arrangeTodayStat();
      personStatistic.onDutyNum = 0;
      personStatistic.leaveNum = 0;
      personStatistic.total = 0;
      personStatistic.onDutyNum = res.workCount;
      personStatistic.leaveNum = res.totalCount - res.workCount;
      personStatistic.total = res.totalCount;
    };

    onMounted(() => {
      requestStateTotal();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body", isZoom ? "is-zoom access-control-v2-panel access-control-card-theme" : ""]} data-no-zoom>
        <div class="overview-v2-summary-grid is-three personnel-stat-grid" data-no-zoom>
          <div class="overview-v2-stat-card access-control-surface personnel-total-card" data-no-zoom>
            <div class="overview-v2-stat-icon">
              <img src={getAssetsImage("overView4.png")} alt="" />
            </div>
            <div class="overview-v2-stat-main">
              <CountTo startVal={0} endVal={personStatistic.total} duration={1200} class="overview-v2-stat-value" />
              <div class="overview-v2-stat-label">人员总数</div>
            </div>
          </div>
          <div class="overview-v2-stat-card access-control-surface" data-no-zoom>
            <div class="overview-v2-stat-icon">
              <img src={getAssetsImage("overView9.png")} alt="" />
            </div>
            <div class="overview-v2-stat-main">
              <CountTo startVal={0} endVal={personStatistic.onDutyNum} duration={1200} class="overview-v2-stat-value" />
              <div class="overview-v2-stat-label">在岗人员</div>
            </div>
          </div>
          <div class="overview-v2-stat-card access-control-surface" data-no-zoom>
            <div class="overview-v2-stat-icon">
              <img src={getAssetsImage("overView11.png")} alt="" />
            </div>
            <div class="overview-v2-stat-main">
              <CountTo startVal={0} endVal={personStatistic.leaveNum} duration={1200} class="overview-v2-stat-value" />
              <div class="overview-v2-stat-label">离岗人员</div>
            </div>
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="overview-v2-root">
        <SubPanelTemplate
          title="监控人员统计"
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel"
          zoomable
          zoom-title="监控人员统计详情"
          zoom-width={620}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-personnel" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default MonitorPersonnelStatistics;
